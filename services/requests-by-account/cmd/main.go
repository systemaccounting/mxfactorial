package main

// todo: testing

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
	recordLimit string = os.Getenv("RETURN_RECORD_LIMIT")
	pgConn      string = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s",
		os.Getenv("PGHOST"),
		os.Getenv("PGPORT"),
		os.Getenv("PGUSER"),
		os.Getenv("PGPASSWORD"),
		os.Getenv("PGDATABASE"))
)

func lambdaFn(
	ctx context.Context,
	e types.QueryByAccount,
	dbConnector func(context.Context, string) (postgres.SQLDB, error),
	tranactionServiceConstructor func(db postgres.SQLDB) (service.ITransactionService, error),
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

	// get requests
	requests, err := ts.GetLastNRequests(e.AuthAccount, recordLimit)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// test for empty request list
	if len(requests) == 0 {

		log.Println("0 requests found")

		// send empty response to client
		return types.EmptyMarshaledIntraTransaction(e.AuthAccount)
	}

	// create for response to client
	intraTrs := requests.CreateIntraTransactions(e.AuthAccount)

	// send string or error response to client
	return intraTrs.MarshalIntraTransactions()
}

// wraps lambdaFn which accepts interfaces for testability
func handleEvent(
	ctx context.Context,
	e types.QueryByAccount,
) (string, error) {
	return lambdaFn(
		ctx,
		e,
		postgres.NewIDB,
		newTransactionService,
	)
}

// enables lambdaFn unit testing
func newTransactionService(idb postgres.SQLDB) (service.ITransactionService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newTransactionService: failed to assert *postgres.DB")
	}
	return service.NewTransactionService(db), nil
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

	if len(recordLimit) == 0 {
		log.Fatal("env var not set")
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
