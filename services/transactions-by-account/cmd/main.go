package main

// todo: testing

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
	recordLimit string = os.Getenv("RETURN_RECORD_LIMIT")
	pgConn      string = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s",
		os.Getenv("PGHOST"),
		os.Getenv("PGPORT"),
		os.Getenv("PGUSER"),
		os.Getenv("PGPASSWORD"),
		os.Getenv("PGDATABASE"))
	readinessCheckPath = os.Getenv("READINESS_CHECK_PATH")
	port               = os.Getenv("TRANSACTIONS_BY_ACCOUNT_PORT")
)

type SQLDB interface {
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Begin(context.Context) (pgx.Tx, error)
	Close(context.Context) error
	IsClosed() bool
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

func run(
	ctx context.Context,
	e types.QueryByAccount,
	dbConnector func(context.Context, string) (SQLDB, error),
	tranactionServiceConstructor func(db SQLDB) (ITransactionService, error),
) (string, error) {

	if e.AuthAccount == "" {
		return "", errors.New("missing auth_account. exiting")
	}

	if e.AccountName == nil {
		return "", errors.New("missing account_name. exiting")
	}

	// connect to db
	db, err := dbConnector(context.Background(), pgConn)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}
	defer db.Close(context.Background())

	// create transaction service
	ts, err := tranactionServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// get transactions
	trans, err := ts.GetLastNTransactions(e.AuthAccount, recordLimit)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// test for empty transaction list
	if len(trans) == 0 {

		log.Println("0 transactions found")

		// send empty string response to client
		return types.EmptyMarshaledIntraTransaction(e.AuthAccount)
	}

	// create for response to client
	intraTrs := trans.CreateIntraTransactions(e.AuthAccount)

	// send string or error response to client
	return intraTrs.MarshalIntraTransactions()
}

// wraps run accepting interfaces for testability
func handleEvent(ctx context.Context, e types.QueryByAccount) (string, error) {
	return run(
		ctx,
		e,
		newIDB,
		newTransactionService,
	)
}

// enables run fn unit testing
func newIDB(ctx context.Context, dsn string) (SQLDB, error) {
	return postgres.NewDB(ctx, dsn)
}

// enables run fn unit testing
func newTransactionService(idb SQLDB) (ITransactionService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newTransactionService: failed to assert *postgres.DB")
	}
	return service.NewTransactionService(db), nil
}

func main() {

	r := gin.Default()

	// aws-lambda-web-adapter READINESS_CHECK_*
	r.GET(readinessCheckPath, func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	var queryByAccount types.QueryByAccount

	r.POST("/", func(c *gin.Context) {

		c.BindJSON(&queryByAccount)

		resp, err := handleEvent(c.Request.Context(), queryByAccount)
		if err != nil {
			c.Status(http.StatusBadRequest)
		}

		c.String(http.StatusOK, resp)
	})

	r.Run(fmt.Sprintf(":%s", port))
}
