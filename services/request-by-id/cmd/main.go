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
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
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
	c lpg.Connector,
	u lpg.PGUnmarshaler,
	sbc func() sqls.SelectSQLBuilder,
) (string, error) {

	if e.AuthAccount == "" {
		return "", errors.New("missing auth_account. exiting")
	}

	if e.ID == nil {
		return "", errors.New("missing id. exiting")
	}

	// connect to postgres
	db, err := c.Connect(ctx, pgConn)
	if err != nil {
		log.Printf("connect error: %v", err)
		return "", err
	}
	defer db.Close(context.Background())

	// get approvals
	apprvs, err := data.GetApprovalsByTransactionID(db, u, sbc, e.ID)
	if err != nil {
		log.Printf("query error: %v", err)
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
	// pending approvals not found in approvals
	if accountOccurrence == 0 || pendingApprovalCount == 0 {
		return tools.EmptyMarshaledIntraTransaction(e.AuthAccount)
	}

	// get transaction items
	trItems, err := data.GetTrItemsByTransactionID(db, u, sbc, e.ID)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// get transaction
	tr, err := data.GetTransactionByID(db, u, sbc, e.ID)
	if err != nil {
		return "", err
	}

	// add transaction items to returning transaction
	tr.TransactionItems = trItems

	data.AttachApprovalsToTransactionItems(apprvs, tr.TransactionItems)

	// create transaction for response to client
	intraTr := tools.CreateIntraTransaction(e.AuthAccount, tr)

	// send string or error response to client
	return tools.MarshalIntraTransaction(&intraTr)
}

// wraps lambdaFn accepting db interface for testability
func handleEvent(ctx context.Context, e types.QueryByID) (string, error) {
	c := lpg.NewConnector(pgx.Connect)
	u := lpg.NewPGUnmarshaler()
	return lambdaFn(ctx, e, c, u, sqls.NewSelectBuilder)
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
	// _ = resp
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
