package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgx/v4"
	"github.com/systemaccounting/mxfactorial/services/gopkg/data"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	lam "github.com/systemaccounting/mxfactorial/services/gopkg/lambdasdk"
	"github.com/systemaccounting/mxfactorial/services/gopkg/request"
	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

var (
	awsRegion      string = os.Getenv("AWS_REGION")
	rulesLambdaArn        = os.Getenv("RULE_LAMBDA_ARN")
	notifyTopicArn        = os.Getenv("NOTIFY_TOPIC_ARN")
	pgHost                = os.Getenv("PGHOST")
	pgPort                = os.Getenv("PGPORT")
	pgUser                = os.Getenv("PGUSER")
	pgPassword            = os.Getenv("PGPASSWORD")
	pgDatabase            = os.Getenv("PGDATABASE")
	pgConn                = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s",
		pgHost,
		pgPort,
		pgUser,
		pgPassword,
		pgDatabase)
)

type preTestItem struct {
	ItemID                 string
	Price                  string
	Quantity               string
	DebitorFirst           bool
	RuleInstanceID         string
	UnitOfMeasurement      string
	UnitsMeasured          string
	Debitor                string
	Creditor               string
	DebitorExpirationTime  string
	CreditorExpirationTime string
}

func lambdaFn(
	ctx context.Context,
	e *types.IntraTransaction,
	c lpg.Connector,
	resp *[]*types.TransactionItem,
) (string, error) {

	if e.AuthAccount == "" {
		return "", errors.New("missing auth_account. exiting")
	}

	if e.Transaction == nil {
		return "", errors.New("missing transaction. exiting")
	}

	// store transaction items received from client in var
	var fromClient []*types.TransactionItem = request.RemoveUnauthorizedValues(e.Transaction.TransactionItems)

	// create client control totals
	// to test all items stored at end
	var clientItemCount int = len(fromClient)
	var clientApprovalCount int
	for _, it := range fromClient {
		clientApprovalCount += len(it.Approvals)
	}

	// filter non-rule generated items from client
	var nonRuleClientItems []*types.TransactionItem
	for _, v := range fromClient {
		if v.RuleInstanceID == nil || *v.RuleInstanceID == "" {
			nonRuleClientItems = append(nonRuleClientItems, v)
		}
	}

	// reproduce rules service response
	// with items sent from client
	ruleTested, err := lam.Invoke(
		nonRuleClientItems,
		awsRegion,
		rulesLambdaArn,
	)
	if err != nil {
		return "", err
	}

	// reduce items to simple structure and
	// relevant values for equality testing
	clientPreEqualityTest := testPrep(fromClient)
	rulePreEqualityTest := testPrep(ruleTested.Transaction.TransactionItems)

	// test length equality between client and rule tested items
	err = testLengthEquality(rulePreEqualityTest, clientPreEqualityTest)
	if err != nil {
		return "", err
	}

	// test item equality between client and rule tested items
	err = testItemEquality(rulePreEqualityTest, clientPreEqualityTest)
	if err != nil {
		return "", err
	}

	log.Print("client items equal to rules")

	// get author_role from items using
	// account from authentication service
	authorRole, err := tools.GetAuthorRole(e.Transaction, e.AuthAccount)
	if err != nil {
		return "", err
	}

	// list debitors and creditors to fetch profile ids
	uniqueAccounts := tools.ListUniqueAccountsFromTrItems(
		ruleTested.Transaction.TransactionItems,
	)

	// connect to postgres
	db, err := c.Connect(context.Background(), pgConn)
	if err != nil {
		return "", err
	}
	// close db connection when main exits
	defer db.Close(context.Background())

	// unmarshal account profile ids with account names
	profileIDList, err := data.GetProfileIDsByAccountList(db, uniqueAccounts)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// convert profile id list to map for convenient
	// addition of profile ids to transaction items
	profileIDs := request.MapProfileIDsToAccounts(profileIDList)

	// add profile IDs to rule tested transaction items
	request.AddProfileIDsToTrItems(
		ruleTested.Transaction.TransactionItems,
		profileIDs,
	)

	// create pre approval transaction
	preTr, err := data.CreateTransaction(
		db,
		nil,
		&e.AuthAccount,
		nil,
		nil,
		authorRole,
		nil,
		ruleTested.Transaction.SumValue,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// create transaction items
	preTrItems, err := data.CreateTransactionItems(
		db,
		preTr.ID,
		ruleTested.Transaction.TransactionItems,
	)
	if err != nil {
		log.Printf("unmarshal transaction items error: %v", err)
		return "", err
	}

	// create approvals without requester timestamps
	preApprovals, err := data.CreateApprovals(
		db,
		preTr.ID,
		// transaction items WITH IDs and WITHOUT rule-added approvals
		preTrItems,
		// transaction items WITHOUT IDs and WITH rule-added approvals
		ruleTested.Transaction.TransactionItems,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// urge permanent solution if client transaction items not stored
	if len(preTrItems) != clientItemCount && len(preApprovals) != clientApprovalCount {
		return "", errors.New("move inserts into a single sql transaction")
	}

	// attach pre approval transaction items to
	// pre approval transaction
	preTr.TransactionItems = preTrItems

	// 1. add requested approval
	// 2. update approval time stamps in transaction items and transaction
	// 3. change account balances if equilibrium
	// 4. notify approvers
	return request.Approve(
		db,
		&e.AuthAccount,
		authorRole,
		preTr,
		preApprovals,
		&notifyTopicArn,
	)
}

func nilString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func nilCustomID(i *types.ID) string {
	if i == nil {
		return ""
	}
	return string(*i)
}

func nilBool(b *bool) bool {
	if b == nil {
		return false
	}
	return *b
}

// simplifies transaction items before testing their
// equality between client request and rules response
func testPrep(items []*types.TransactionItem) []preTestItem {

	var reduced []preTestItem

	for _, u := range items {
		var st preTestItem
		st.ItemID = nilString(u.ItemID)
		st.Price = u.Price.String()
		st.Quantity = u.Quantity.String()
		st.DebitorFirst = nilBool(u.DebitorFirst)
		st.RuleInstanceID = nilCustomID(u.RuleInstanceID)
		st.UnitOfMeasurement = nilString(u.UnitOfMeasurement)

		var unitsMeasured string
		// pkg returns 2 nils on negative case
		// https://github.com/shopspring/decimal/blob/501661573f6073b905cf2543d17904af87099881/decimal.go#L1417
		i, _ := u.UnitsMeasured.Value()
		if i != nil {
			unitsMeasured = i.(string)
		}

		st.UnitsMeasured = unitsMeasured
		st.Debitor = nilString(u.Debitor)
		st.Creditor = nilString(u.Creditor)
		st.DebitorExpirationTime = nilString(u.DebitorExpirationTime)
		st.CreditorExpirationTime = nilString(u.CreditorExpirationTime)

		reduced = append(reduced, st)
	}

	return reduced
}

func testLengthEquality(rule, client []preTestItem) error {
	ruleLength := len(rule)
	clientLength := len(client)
	if ruleLength != clientLength {
		var errMsg error = fmt.Errorf("client item count not equal to rule, %d vs %d", ruleLength, clientLength)
		return errMsg
	}
	return nil
}

func testItemEquality(rule, client []preTestItem) error {
	diff := rule
	// avoid sort
	for _, v := range rule {
		for _, w := range client {
			if v == w {
				for k, x := range diff {
					if w == x {
						// 155.905µs of looping tested with 6 items
						// todo: load test
						// https://stackoverflow.com/a/37359662
						diff[k] = diff[len(diff)-1]
						diff = diff[:len(diff)-1]
					}
				}
			}
		}
	}
	if len(diff) > 0 {
		return fmt.Errorf("different rule items received: %+v", diff)
	}
	return nil
}

// wraps lambdaFn accepting interfaces for testability
func handleEvent(
	ctx context.Context,
	e *types.IntraTransaction,
) (string, error) {
	var resp []*types.TransactionItem
	c := lpg.NewConnector(pgx.Connect)
	return lambdaFn(ctx, e, c, &resp)
}

// avoids lambda package dependency during local development
func localEnvOnly(event string) {

	// var testEvent types.IntraTransaction
	var testEvent *types.IntraTransaction

	// unmarshal test event
	err := json.Unmarshal([]byte(event), &testEvent)
	if err != nil {
		log.Fatal(err)
	}

	// call event handler with test event
	resp, err := handleEvent(context.Background(), testEvent)
	if err != nil {
		log.Fatal(err)
	}

	// log.Print(resp)
	_ = resp
}

func main() {

	var envVars = []string{
		awsRegion,
		rulesLambdaArn,
		pgHost,
		pgPort,
		pgUser,
		pgPassword,
		pgDatabase,
	}

	for _, v := range envVars {
		if len(v) == 0 {
			log.Fatal("env var not set")
		}
	}

	// ### LOCAL ENV only: assign event from env var
	var osTestEvent string = os.Getenv("TEST_EVENT")
	if len(osTestEvent) > 0 {
		localEnvOnly(osTestEvent)
		return
	}
	// ###

	lambda.Start(handleEvent)
}
