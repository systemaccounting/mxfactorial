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
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	lam "github.com/systemaccounting/mxfactorial/services/gopkg/lambdasdk"
	"github.com/systemaccounting/mxfactorial/services/gopkg/notify"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
	"github.com/systemaccounting/mxfactorial/services/gopkg/transact"
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

	if e.Transaction.Author == nil {
		return "", errors.New("missing transaction.author. exiting")
	}

	// store transaction items received from client in var
	var fromClient []*types.TransactionItem = e.Transaction.TransactionItems

	// create client control totals
	// to test all items stored at end
	var clientItemCount int = len(fromClient)
	var clientApproverCount int
	for _, it := range fromClient {
		clientApproverCount += len(it.Approvers)
	}

	// filter non-rule generated items from client
	var nonRuleClientItems []*types.TransactionItem
	for _, v := range fromClient {
		if v.RuleInstanceID == nil {
			nonRuleClientItems = append(nonRuleClientItems, v)
		}
	}

	// test non-rule generated items against rule service
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
	authorRole, err := tools.GetAuthorRole(e.Transaction, *e.Transaction.Author)
	if err != nil {
		return "", err
	}

	// add author_role from items to transaction
	e.Transaction.AuthorRole = &authorRole

	// add sum_value from rule
	e.Transaction.SumValue = ruleTested.Transaction.SumValue

	// list debitors and creditors to fetch profile ids
	var uniqueAccountsStr []string
	for _, v := range ruleTested.Transaction.TransactionItems {
		if isStringUnique(*v.Debitor, uniqueAccountsStr) {
			uniqueAccountsStr = append(uniqueAccountsStr, *v.Debitor)
		}
		if isStringUnique(*v.Creditor, uniqueAccountsStr) {
			uniqueAccountsStr = append(uniqueAccountsStr, *v.Creditor)
		}
	}

	// convert accounts to interface slice for sql builder pkg
	var uniqueAccounts []interface{}
	for _, v := range uniqueAccountsStr {
		uniqueAccounts = append(uniqueAccounts, v)
	}

	// create sql to get profile ids of debitors
	// and creditors referenced in transaction items
	getProfileIDSQL, getProfileIDArgs := sqlb.SelectProfileIDsByAccount(
		uniqueAccounts,
	)

	// create insert transaction sql
	insTrSQL, insTrArgs := sqlb.InsertTransactionSQL(*e.Transaction)

	// connect to postgres
	db, err := c.Connect(context.Background(), pgConn)
	if err != nil {
		return "", err
	}
	// close db connection when main exits
	defer db.Close(context.Background())

	// test debitor capacity
	err = transact.TestDebitorCapacity(
		db,
		*e.Transaction.Author,
		ruleTested.Transaction.TransactionItems,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// get account profile ids with account names
	profileIDRows, err := db.Query(
		context.Background(),
		getProfileIDSQL,
		getProfileIDArgs...,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// unmarshal account profile ids with account names
	profileIDList, err := lpg.UnmarshalAccountProfileIDs(profileIDRows)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// convert profile id list to map for convenient
	// addition of profile ids to transaction items
	profileIDs := make(map[string]types.ID)
	for _, v := range profileIDList {
		profileIDs[*v.AccountName] = *v.ID
	}

	// add profile IDs to rule tested transaction items
	profileIDsAdded := *ruleTested
	for _, v := range profileIDsAdded.Transaction.TransactionItems {
		v.DebitorProfileID = new(types.ID)
		*v.DebitorProfileID = profileIDs[*v.Debitor]
		v.CreditorProfileID = new(types.ID)
		*v.CreditorProfileID = profileIDs[*v.Creditor]
	}

	// insert transaction returning id
	trRow := db.QueryRow(context.Background(), insTrSQL, insTrArgs...)

	// unmarshal transaction id
	// returned from transaction insert
	tr, err := lpg.UnmarshalTransaction(trRow)
	if err != nil {
		log.Printf("unmarshal transaction error: %v", err)
		return "", err
	}

	// create insert transaction item sql
	insTrItemSQL, inTrItemArgs := sqlb.InsertTrItemsSQL(
		*tr.ID,
		profileIDsAdded.Transaction.TransactionItems,
	)

	// insert transaction items returning ids
	trItemRows, err := db.Query(
		context.Background(),
		insTrItemSQL,
		inTrItemArgs...,
	)
	if err != nil {
		log.Printf("query transaction items error: %v", err)
		return "", err
	}

	// unmarshal transaction items
	// returned from transaction item insert
	trItems, err := lpg.UnmarshalTrItems(trItemRows)
	if err != nil {
		log.Printf("unmarshal transaction items error: %v", err)
		return "", err
	}

	// create a var to store approvers inserted count
	var approversInserted []*types.Approver

	// list inserted approvers
	for i := 0; i < len(trItems); i++ {
		// create sql to insert approvers per transaction id
		aprvsSQL, aprvsArgs := sqlb.InsertApproversSQL(
			*tr.ID,
			*trItems[i].ID,
			profileIDsAdded.Transaction.TransactionItems[i].Approvers,
		)

		// insert approvers per transaction item id
		apprvRows, err := db.Query(context.Background(), aprvsSQL, aprvsArgs...)
		if err != nil {
			log.Printf("query approvers error: %v", err)
			return "", err
		}

		// unmarshal approvers returned from insert
		apprv, err := lpg.UnmarshalApprovers(apprvRows)
		if err != nil {
			log.Printf("unmarshal approvers error: %v", err)
			return "", err
		}

		// add approver insert result to list
		approversInserted = append(approversInserted, apprv...)
	}

	// urge permanent solution if client items not stored
	if len(trItems) != clientItemCount && len(approversInserted) != clientApproverCount {
		return "", errors.New("move inserts into a single sql transaction")
	}

	// add transaction items to returning transaction
	tr.TransactionItems = trItems

	// change account balances if equilibrium
	if transact.IsEquilibrium(tr) {
		transact.ChangeAccountBalances(db, tr.TransactionItems)
	}

	// notify role approvers
	err = notify.NotifyTransactionRoleApprovers(
		db,
		&notifyTopicArn,
		approversInserted,
		tr,
	)
	if err != nil {
		log.Print("notify transaction role approvers ", err)
	}

	// create request to send as client response
	intraTr := tools.CreateIntraTransaction(e.AuthAccount, tr)

	// send string or error response to client
	return tools.MarshalIntraTransaction(&intraTr)
}

func isStringUnique(s string, l []string) bool {
	for _, v := range l {
		if v == s {
			return false
		}
	}
	return true
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
