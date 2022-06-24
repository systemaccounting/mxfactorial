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
	"github.com/jackc/pgx/v4"

	"github.com/systemaccounting/mxfactorial/services/gopkg/data"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
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
	c lpg.Connector,
) (string, error) {

	if e.AuthAccount == "" {
		return "", errors.New("missing auth_account. exiting")
	}

	if e.AccountName == nil {
		return "", errors.New("missing account_name. exiting")
	}

	// connect to postgres
	db, err := c.Connect(ctx, pgConn)
	if err != nil {
		return "", err
	}
	defer db.Close(context.Background())

	// create requests sql
	requestsSQL, requestsArgs := sqlb.SelectLastNReqsOrTransByAccount(e.AuthAccount, false, recordLimit)

	// get requests
	requests, err := data.GetTransactionsWithTrItemsAndApprovalsByID(db, requestsSQL, requestsArgs)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// test for empty request list
	if len(requests) == 0 {
		log.Println("0 transaction items found")

		// create empty response to client
		intraTrs := tools.CreateIntraTransactions(e.AuthAccount, []*types.Transaction{})

		// send string or error response to client
		return tools.MarshalIntraTransactions(&intraTrs)
	}

	// create for response to client
	intraTrs := tools.CreateIntraTransactions(e.AuthAccount, requests)

	// send string or error response to client
	return tools.MarshalIntraTransactions(&intraTrs)
}

// wraps lambdaFn accepting db interface for testability
func handleEvent(
	ctx context.Context,
	e types.QueryByAccount,
) (string, error) {
	d := lpg.NewConnector(pgx.Connect)
	return lambdaFn(ctx, e, d)
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
