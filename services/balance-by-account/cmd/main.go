package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgx/v4"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
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
	c lpg.Connector,
) (string, error) {

	if e.AuthAccount == "" {
		return "", errors.New("missing auth_account. exiting")
	}

	if &e.AccountName == nil {
		return "", errors.New("missing account_name. exiting")
	}

	// connect to postgres
	db, err := c.Connect(ctx, pgConn)
	if err != nil {
		log.Printf("connect error: %v", err)
		return "", err
	}
	defer db.Close(context.Background())

	// create select current account balance sql
	selCurrBalSQL, selCurrBalArgs := sqlb.SelectCurrentAccountBalanceByAccountNameSQL(
		*e.AccountName,
	)

	// query
	row := db.QueryRow(
		ctx,
		selCurrBalSQL,
		selCurrBalArgs...,
	)
	if err != nil {
		log.Printf("query error: %v", err)
		return "", err
	}

	// unmarshal current account balance
	balance, err := lpg.UnmarshalAccountBalance(
		row,
	)
	if err != nil {
		log.Printf("unmarshal account balance %v", err)
		return "", err
	}

	// send string or error response to client
	return balance, nil
}

// wraps lambdaFn accepting db interface for testability
func handleEvent(ctx context.Context, e types.QueryByAccount) (string, error) {
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
