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

// todo: integration test

var pgConn string = fmt.Sprintf(
	"host=%s port=%s user=%s password=%s dbname=%s",
	os.Getenv("PGHOST"),
	os.Getenv("PGPORT"),
	os.Getenv("PGUSER"),
	os.Getenv("PGPASSWORD"),
	os.Getenv("PGDATABASE"))

func lambdaFn(
	ctx context.Context,
	e types.QueryByID,
	dbConnector func(context.Context, string) (postgres.SQLDB, error),
	tranactionServiceConstructor func(db postgres.SQLDB) (service.ITransactionService, error),
) (string, error) {

	if e.AuthAccount == "" {
		return "", errors.New("missing auth_account. exiting")
	}

	if e.ID == nil {
		return "", errors.New("missing id. exiting")
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

	// get approvals
	apprvs, err := ts.GetApprovalsByTransactionID(*e.ID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	accountOccurrence := 0
	pendingApprovalCount := 0
	for _, v := range apprvs {
		// count account occurrence in approvals
		if *v.AccountName == e.AuthAccount {
			accountOccurrence++
		}
		// also, count pending approvals
		if v.ApprovalTime == nil {
			pendingApprovalCount++
		}
	}

	// return empty response if account or
	// pending approvals found in approvals
	if accountOccurrence == 0 || pendingApprovalCount > 0 {
		return types.EmptyMarshaledIntraTransaction(e.AuthAccount)
	}

	// get transaction items
	trItems, err := ts.GetTrItemsByTransactionID(*e.ID)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// get transaction
	tr, err := ts.GetTransactionByID(*e.ID)
	if err != nil {
		return "", err
	}

	trWithTrItemsAndApprvs := service.BuildTransaction(tr, trItems, apprvs)

	// create transaction for response to client
	intraTr := trWithTrItemsAndApprvs.CreateIntraTransaction(e.AuthAccount)

	// send string response to client
	return intraTr.MarshalIntraTransaction()
}

// wraps lambdaFn accepting interfaces for testability
func handleEvent(ctx context.Context, e types.QueryByID) (string, error) {
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

	var testEvent types.QueryByID

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

	// LOCAL ENV ONLY: assign event from env var
	var osTestEvent string = os.Getenv("TEST_EVENT")
	if len(osTestEvent) > 0 {
		localEnvOnly(osTestEvent)
		return
	}

	lambda.Start(handleEvent)
}
