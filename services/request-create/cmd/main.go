package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgtype"
	"github.com/jackc/pgx/v4"
	"github.com/systemaccounting/mxfactorial/pkg/logger"
	"github.com/systemaccounting/mxfactorial/pkg/postgres"
	"github.com/systemaccounting/mxfactorial/pkg/service"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

var (
	notifyTopicArn = os.Getenv("NOTIFY_TOPIC_ARN")
	pgHost         = os.Getenv("PGHOST")
	pgPort         = os.Getenv("PGPORT")
	pgUser         = os.Getenv("PGUSER")
	pgPassword     = os.Getenv("PGPASSWORD")
	pgDatabase     = os.Getenv("PGDATABASE")
	pgConn         = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s",
		pgHost,
		pgPort,
		pgUser,
		pgPassword,
		pgDatabase)
	readinessCheckPath = os.Getenv("READINESS_CHECK_PATH")
	ruleUrl            = os.Getenv("RULE_URL")
	port               = os.Getenv("REQUEST_CREATE_PORT")
)

type SQLDB interface {
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Begin(context.Context) (pgx.Tx, error)
	Close(context.Context) error
	IsClosed() bool
}

type IRulesService interface {
	GetRuleAppliedIntraTransactionFromTrItems(trItems types.TransactionItems) (*types.IntraTransaction, error)
}

type IApproveService interface {
	Approve(ctx context.Context, authAccount string, approverRole types.Role, preApprovalTransaction *types.Transaction, notifyTopicArn string) (string, error)
}

type ITransactionService interface {
	GetTransactionByID(ID types.ID) (*types.Transaction, error)
	InsertTransactionTx(ruleTestedTransaction *types.Transaction) (*types.ID, error)
	GetTransactionWithTrItemsAndApprovalsByID(trID types.ID) (*types.Transaction, error)
	GetTransactionsWithTrItemsAndApprovalsByID(trIDs types.IDs) (types.Transactions, error)
	GetLastNTransactions(accountName string, recordLimit string) (types.Transactions, error)
	GetLastNRequests(accountName string, recordLimit string) (types.Transactions, error)
	GetTrItemsAndApprovalsByTransactionIDs(trIDs types.IDs) (types.TransactionItems, types.Approvals, error)
	GetTrItemsByTransactionID(ID types.ID) (types.TransactionItems, error)
	GetTrItemsByTrIDs(IDs types.IDs) (types.TransactionItems, error)
	GetApprovalsByTransactionID(ID types.ID) (types.Approvals, error)
	GetApprovalsByTransactionIDs(IDs types.IDs) (types.Approvals, error)
	AddApprovalTimesByAccountAndRole(trID types.ID, accountName string, accountRole types.Role) (pgtype.Timestamptz, error)
}

type IProfileService interface {
	GetProfileIDsByAccountNames(accountNames []string) (types.AccountProfileIDs, error)
	CreateAccountProfile(accountProfile *types.AccountProfile) error
}

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
	rulesServiceConstructor func(url string) IRulesService,
) (*types.IntraTransaction, types.Role, error) {

	if e.AuthAccount == "" {
		return nil, types.Role(0), errors.New("missing auth_account. exiting")
	}

	if e.Transaction == nil {
		return nil, types.Role(0), errors.New("missing transaction. exiting")
	}

	// match author_role from items to authenticated account
	// todo: globally rename authorRole to authRole
	authorRole, err := e.Transaction.GetAuthorRole(e.AuthAccount)
	if err != nil {
		log.Printf("GetAuthorRole error: %v\n", err)
		return nil, types.Role(0), err
	}

	// overwrite transaction author role with authenticated role
	e.Transaction.AuthorRole = &authorRole

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
	rulesService := rulesServiceConstructor(ruleUrl)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, types.Role(0), err
	}

	// reproduce rules service response
	// with items sent from client
	ruleTested, err := rulesService.GetRuleAppliedIntraTransactionFromTrItems(
		nonRuleClientItems,
	)
	if err != nil {
		return nil, types.Role(0), err
	}

	// reduce items to simple structure and
	// relevant values for equality testing
	clientPreEqualityTest := testPrep(fromClient)
	rulePreEqualityTest := testPrep(ruleTested.Transaction.TransactionItems)

	// test length equality between client and rule tested items
	err = testLengthEquality(clientPreEqualityTest, rulePreEqualityTest)
	if err != nil {
		return nil, types.Role(0), err
	}

	// test item equality between client and rule tested items
	err = testItemEquality(clientPreEqualityTest, rulePreEqualityTest)
	if err != nil {
		return nil, types.Role(0), err
	}

	log.Print("client request equal to rule response")

	// add authenticated values to rule tested transaction
	// cadet todo: add AddAuthValues method to Transaction
	ruleTested.Transaction.Author = &e.AuthAccount
	ruleTested.Transaction.AuthorRole = &authorRole

	return ruleTested, authorRole, nil
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

func testLengthEquality(client, rule []preTestItem) error {
	clientLength := len(client)
	ruleLength := len(rule)
	if clientLength != ruleLength {
		var errMsg error = fmt.Errorf("client item count not equal to rule, %d vs %d", clientLength, ruleLength)
		return errMsg
	}
	return nil
}

func testItemEquality(client, rule []preTestItem) error {
	// avoid sort
	for _, c := range client {
		for i, r := range rule {
			if r == c {
				rule = append(rule[:i], rule[i+1:]...)
				break
			}
		}
	}
	if len(rule) > 0 {
		return fmt.Errorf("client missing: %+v", rule)
	}
	return nil
}

func createRequest(
	ctx context.Context,
	ruleTested *types.IntraTransaction,
	rcs *createRequestService,
) (*types.Transaction, error) {

	// list debitors and creditors to fetch profile ids
	uniqueAccounts := ruleTested.Transaction.TransactionItems.ListUniqueAccountsFromTrItems()

	// unmarshal account profile ids with account names
	profileIDList, err := rcs.p.GetProfileIDsByAccountNames(uniqueAccounts)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// convert profile id list to map for convenient
	// addition of profile ids to transaction items
	profileIDsMap := profileIDList.MapProfileIDsToAccounts()

	// add profile IDs to rule tested transaction items
	ruleTested.Transaction.TransactionItems.AddProfileIDsToTrItems(profileIDsMap)

	// create transaction request
	trID, err := rcs.t.InsertTransactionTx(ruleTested.Transaction)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// get new transaction request with transaction items and approvals
	return rcs.t.GetTransactionWithTrItemsAndApprovalsByID(*trID)
}

func handleEvent(
	ctx context.Context,
	e *types.IntraTransaction,
	dbConnector func(context.Context, string) (SQLDB, error),
	requestCreateServiceConstructor func(db SQLDB) (*createRequestService, error),
	approveServiceConstructor func(db SQLDB) (IApproveService, error),
	rulesServiceConstructor func(url string) IRulesService,
) (string, error) {

	// delay connecting to db until after client values tested
	ruleTested, authRole, err := testValues(ctx, e, rulesServiceConstructor)
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
		e.AuthAccount,
		authRole,
		request,
		notifyTopicArn,
	)
}

func newIDB(ctx context.Context, dsn string) (SQLDB, error) {
	return postgres.NewDB(ctx, dsn)
}

func newRulesService(url string) IRulesService {
	return service.NewRulesService(url)
}

type createRequestService struct {
	p IProfileService
	t ITransactionService
}

func newRequestCreateService(idb SQLDB) (*createRequestService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newRequestCreateService: failed to assert *postgres.DB")
	}
	return &createRequestService{
		p: service.NewProfileService(db),
		t: service.NewTransactionService(db),
	}, nil
}

func newApproveService(idb SQLDB) (IApproveService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newApproveService: failed to assert *postgres.DB")
	}
	return service.NewApproveService(db), nil
}

func main() {

	r := gin.Default()

	// aws-lambda-web-adapter READINESS_CHECK_*
	r.GET(readinessCheckPath, func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	var intraTransaction *types.IntraTransaction

	r.POST("/", func(c *gin.Context) {

		c.BindJSON(&intraTransaction)

		resp, err := handleEvent(
			c.Request.Context(),
			intraTransaction,
			newIDB,
			newRequestCreateService,
			newApproveService,
			newRulesService,
		)
		if err != nil {
			c.Status(http.StatusBadRequest)
		}

		c.String(http.StatusOK, resp)
	})

	r.Run(fmt.Sprintf(":%s", port))
}
