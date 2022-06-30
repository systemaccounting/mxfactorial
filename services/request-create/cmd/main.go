package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/huandu/go-sqlbuilder"
	"github.com/jackc/pgx/v4"
	"github.com/systemaccounting/mxfactorial/services/gopkg/data"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	lam "github.com/systemaccounting/mxfactorial/services/gopkg/lambdasdk"
	"github.com/systemaccounting/mxfactorial/services/gopkg/request"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
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
	ibc func() sqls.InsertSQLBuilder,
	sbc func() sqls.SelectSQLBuilder,
	ubc func() sqls.UpdateSQLBuilder,
	dbc func() sqls.DeleteSQLBuilder,
	b func(string, ...interface{}) sqlbuilder.Builder,
	resp *[]*types.TransactionItem,
) (string, error) {

	if e.AuthAccount == "" {
		return "", errors.New("missing auth_account. exiting")
	}

	if e.Transaction == nil {
		return "", errors.New("missing transaction. exiting")
	}

	// match author_role from items to authenticated account
	authorRole, err := tools.GetAuthorRole(e.Transaction, e.AuthAccount)
	if err != nil {
		log.Printf("GetAuthorRole error: %v\n", err)
		return "", err
	}

	// overwrite transaction author role with authenticated role
	role := authorRole.String()
	e.Transaction.AuthorRole = &role

	// store transaction items received from client in var
	var fromClient []*types.TransactionItem = request.RemoveUnauthorizedValues(e.Transaction.TransactionItems)

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

	// add authenticated values to rule tested transaction
	ruleTested.Transaction.Author = &e.AuthAccount
	ruleTested.Transaction.AuthorRole = &role

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

	var trItemsFromRules types.TransactionItems = ruleTested.Transaction.TransactionItems
	// list debitors and creditors to fetch profile ids
	uniqueAccounts := trItemsFromRules.ListUniqueAccountsFromTrItems()

	// connect to postgres
	db, err := c.Connect(context.Background(), pgConn)
	if err != nil {
		log.Printf("pg connect error: %v", err)
		return "", err
	}
	// close db connection when main exits
	defer db.Close(context.Background())

	// unmarshal account profile ids with account names
	profileIDList, err := data.GetProfileIDsByAccountList(db, sbc, uniqueAccounts)
	if err != nil {
		log.Printf("GetProfileIDsByAccountList error: %v", err)
		return "", err
	}

	// convert profile id list to map for convenient
	// addition of profile ids to transaction items
	profileIDs := request.MapProfileIDsToAccounts(profileIDList)

	// add profile IDs to rule tested transaction items
	request.AddProfileIDsToTrItems(
		trItemsFromRules,
		profileIDs,
	)

	trID, err := data.RequestCreate(db, ibc, sbc, b, ruleTested.Transaction)
	if err != nil {
		errMsg := fmt.Errorf("RequestCreate error: %v", err)
		log.Print(errMsg)
		return "", errMsg
	}

	// get new transaction request
	preApprTr, err := data.GetTransactionWithTrItemsAndApprovalsByID(db, sbc, trID)
	if err != nil {
		errMsg := fmt.Errorf("GetTransactionWithTrItemsAndApprovalsByID error: %v", err)
		log.Print(errMsg)
		return "", errMsg
	}

	// 1. add requested approval
	// 2. update approval time stamps in transaction items and transaction
	// 3. change account balances if equilibrium
	// 4. notify approvers
	return request.Approve(
		db,
		ibc,
		sbc,
		ubc,
		dbc,
		&e.AuthAccount,
		authorRole,
		preApprTr,
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
		var errMsg error = fmt.Errorf("client item count not equal to rule, %d vs %d", clientLength, ruleLength)
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
	return lambdaFn(
		ctx,
		e,
		c,
		sqls.NewInsertBuilder,
		sqls.NewSelectBuilder,
		sqls.NewUpdateBuilder,
		sqls.NewDeleteBuilder,
		sqlbuilder.Build,
		&resp)
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
