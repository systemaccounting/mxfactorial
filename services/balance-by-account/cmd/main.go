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

var pgConn string = fmt.Sprintf(
	"host=%s port=%s user=%s password=%s dbname=%s",
	os.Getenv("PGHOST"),
	os.Getenv("PGPORT"),
	os.Getenv("PGUSER"),
	os.Getenv("PGPASSWORD"),
	os.Getenv("PGDATABASE"))

func lambdaFn(
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

// wraps lambdaFn accepting services satisfying interfaces for testability
func handleEvent(ctx context.Context, e types.QueryByAccount) (string, error) {
	return lambdaFn(
		ctx,
		e,
		postgres.NewDB,
		newBalanceService,
	)
}

// enables lambdaFn unit testing
func newBalanceService(idb postgres.SQLDB) (service.IBalanceService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newBalanceService: failed to assert *postgres.DB")
	}
	return service.NewAccountBalanceService(db), nil
}

// avoids lambda package dependency during local development
func localEnvOnly(event string) {

	var testEvent types.QueryByAccount

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

	log.Print(resp)
}

func main() {

	// ### TEST ENV only: assign event from env var
	var osTestEvent string = os.Getenv("TEST_EVENT")
	if len(osTestEvent) > 0 {
		localEnvOnly(osTestEvent)
		return
	}

	lambda.Start(handleEvent)
}
