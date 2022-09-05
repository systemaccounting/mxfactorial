package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/service"
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
	ItemID            string
	Price             string
	Quantity          string
	DebitorFirst      bool
	RuleInstanceID    string
	UnitOfMeasurement string
	UnitsMeasured     string
	Debitor           string
	Creditor          string
}

func testValues(
	ctx context.Context,
	e *types.IntraTransaction,
	rulesServiceConstructor func(lambdaFnName, awsRegion *string) service.IRulesService,
) (*types.IntraTransaction, string, types.Role, error) {

	if e.AuthAccount == "" {
		return nil, "", types.Role(0), errors.New("missing auth_account. exiting")
	}

	if e.Transaction == nil {
		return nil, "", types.Role(0), errors.New("missing transaction. exiting")
	}

	// match author_role from items to authenticated account
	// todo: globally rename authorRole to authRole
	authorRole, err := e.Transaction.GetAuthorRole(e.AuthAccount)
	if err != nil {
		log.Printf("GetAuthorRole error: %v\n", err)
		return nil, "", types.Role(0), err
	}

	// overwrite transaction author role with authenticated role
	role := authorRole.String()
	e.Transaction.AuthorRole = &role

	// store transaction items received from client in var
	fromClient := e.Transaction.TransactionItems.RemoveUnauthorizedValues()

	// filter non-rule generated items from client
	var nonRuleClientItems types.TransactionItems
	for _, v := range fromClient {
		if v.RuleInstanceID == nil || *v.RuleInstanceID == "" {
			nonRuleClientItems = append(nonRuleClientItems, v)
		}
	}

	// create rules service
	rulesService := rulesServiceConstructor(&rulesLambdaArn, &awsRegion)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, "", types.Role(0), err
	}

	// reproduce rules service response
	// with items sent from client
	ruleTested, err := rulesService.GetRuleAppliedIntraTransactionFromTrItems(
		nonRuleClientItems,
	)
	if err != nil {
		return nil, "", types.Role(0), err
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
		return nil, "", types.Role(0), err
	}

	// test item equality between client and rule tested items
	err = testItemEquality(rulePreEqualityTest, clientPreEqualityTest)
	if err != nil {
		return nil, "", types.Role(0), err
	}

	log.Print("client items equal to rules")

	return ruleTested, e.AuthAccount, authorRole, nil
}

// simplifies transaction items before testing their
// equality between client request and rules response
func testPrep(items types.TransactionItems) []preTestItem {

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

		reduced = append(reduced, st)
	}

	return reduced
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

func createRequest(
	ctx context.Context,
	ruleTested *types.IntraTransaction,
	rcs iCreateRequestService,
) (types.Transaction, error) {

	// list debitors and creditors to fetch profile ids
	uniqueAccounts := ruleTested.Transaction.TransactionItems.ListUniqueAccountsFromTrItems()

	// unmarshal account profile ids with account names
	profileIDList, err := rcs.GetProfileIDsByAccountNames(uniqueAccounts)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return types.Transaction{}, err
	}

	// convert profile id list to map for convenient
	// addition of profile ids to transaction items
	profileIDsMap := profileIDList.MapProfileIDsToAccounts()

	// add profile IDs to rule tested transaction items
	ruleTested.Transaction.TransactionItems.AddProfileIDsToTrItems(profileIDsMap)

	// create transaction request
	trID, err := rcs.InsertTransactionTx(ruleTested.Transaction)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return types.Transaction{}, err
	}

	// get new transaction request with transaction items and approvals
	return rcs.GetTransactionWithTrItemsAndApprovalsByID(trID)
}

func lambdaFn(
	ctx context.Context,
	e *types.IntraTransaction,
	dbConnector func(context.Context, string) (postgres.SQLDB, error),
	requestCreateServiceConstructor func(db postgres.SQLDB) (iCreateRequestService, error),
	approveServiceConstructor func(db postgres.SQLDB) (service.IApproveService, error),
	rulesServiceConstructor func(lambdaFnName, awsRegion *string) service.IRulesService,
) (string, error) {

	// delay connecting to db until after client values tested
	ruleTested, authAccount, authRole, err := testValues(ctx, e, rulesServiceConstructor)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// connect to db
	db, err := dbConnector(context.Background(), pgConn)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}
	defer db.Close(context.Background())

	// create request service
	reqService, err := requestCreateServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// create request
	request, err := createRequest(ctx, ruleTested, reqService)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// create approve service
	apprService, err := approveServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// 1. add requested approval
	// 2. update approval time stamps in transaction items and transaction
	// 3. change account balances if equilibrium
	// 4. notify approvers
	return apprService.Approve(
		ctx,
		authAccount,
		authRole,
		request,
		notifyTopicArn,
	)
}

// handleEvent wraps lambdaFn which
// accepts interfaces for testability
func handleEvent(
	ctx context.Context,
	e *types.IntraTransaction,
) (string, error) {

	return lambdaFn(
		ctx,
		e,
		postgres.NewIDB,
		newRequestCreateService,
		newApproveService,
		newRulesService,
	)
}

// BEGIN: enables lambdaFn unit testing
func newRulesService(lambdaFnName, awsRegion *string) service.IRulesService {
	return service.NewRulesService(lambdaFnName, awsRegion)
}

type iCreateRequestService interface {
	service.IProfileService
	service.ITransactionService
}

type createRequestService struct {
	*service.ProfileService
	*service.TransactionService
}

func newRequestCreateService(idb postgres.SQLDB) (iCreateRequestService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newRequestCreateService: failed to assert *postgres.DB")
	}
	return &createRequestService{
		ProfileService:     service.NewProfileService(db),
		TransactionService: service.NewTransactionService(db),
	}, nil
}

func newApproveService(idb postgres.SQLDB) (service.IApproveService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newApproveService: failed to assert *postgres.DB")
	}
	return service.NewApproveService(db), nil
}

// END: enables lambdaFn unit testing

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
		panic(err)
	}

	if len(os.Getenv("DEBUG")) > 0 {
		log.Print(resp)
	}

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
