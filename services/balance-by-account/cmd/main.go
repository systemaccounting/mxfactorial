package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/systemaccounting/mxfactorial/pkg/logger"
	"github.com/systemaccounting/mxfactorial/pkg/postgres"
	"github.com/systemaccounting/mxfactorial/pkg/service"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

var (
	pgConn string = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s",
		os.Getenv("PGHOST"),
		os.Getenv("PGPORT"),
		os.Getenv("PGUSER"),
		os.Getenv("PGPASSWORD"),
		os.Getenv("PGDATABASE"))
	readinessCheckPath = os.Getenv("READINESS_CHECK_PATH")
	port               = os.Getenv("BALANCE_BY_ACCOUNT_PORT")
)

func run(
	ctx context.Context,
	e types.QueryByAccount,
	dbConnector func(context.Context, string) (*postgres.DB, error),
	balanceServiceConstructor func(db postgres.SQLDB) (service.IBalanceService, error),
) (string, error) {

	// test required values
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

	// create account balance service
	bs, err := balanceServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// get account balance
	accountBalance, err := bs.GetAccountBalance(*e.AccountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// return balance
	return accountBalance.CurrentBalance.StringFixed(3), nil
}

// wraps run accepting services satisfying interfaces for testability
func handleEvent(ctx context.Context, e types.QueryByAccount) (string, error) {
	return run(
		ctx,
		e,
		postgres.NewDB,
		newBalanceService,
	)
}

// enables run fn unit testing
func newBalanceService(idb postgres.SQLDB) (service.IBalanceService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newBalanceService: failed to assert *postgres.DB")
	}
	return service.NewAccountBalanceService(db), nil
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
