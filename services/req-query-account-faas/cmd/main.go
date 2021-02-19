package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgx/v4"

	faas "github.com/systemaccouting/mxfactorial/services/req-query-account-faas"
	"github.com/systemaccouting/mxfactorial/services/req-query-account-faas/pkg/pg"
)

const (
	query string = `
	SELECT * FROM transactions
	WHERE creditor=$1 OR debitor=$1 OR author=$1
	AND (creditor_approval_time IS NULL OR debitor_approval_time IS NULL)
	ORDER BY id
	DESC LIMIT $2;`
	recordLimit string = "RETURN_RECORD_LIMIT"
)

var (
	osVars = faas.EnvVars{
		recordLimit: 0,
	}
	recordReturnLimit int
	pgConn            string = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s",
		os.Getenv("PGHOST"),
		os.Getenv("PGPORT"),
		os.Getenv("PGUSER"),
		os.Getenv("PGPASSWORD"),
		os.Getenv("PGDATABASE"))
)

func lambdaFn(
	ctx context.Context,
	e faas.Event,
	c faas.Connector,
	t *faas.Transactions,
) (string, error) {

	// connect to postgres
	db, err := c.Connect(ctx, pgConn)
	if err != nil {
		return "", err
	}

	// query
	rows, err := db.Query(
		ctx,
		query,
		e.Account,
		osVars[recordLimit],
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// unmarshal query response
	err = db.Unmarshal(ctx, rows, t)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// send query response as json
	return t.Marshal()
}

// wraps lambdaFn accepting db interface for testability
func handleEvent(ctx context.Context, e faas.Event) (string, error) {
	var t faas.Transactions
	d := pg.NewConnector(pgx.Connect)
	return lambdaFn(ctx, e, d, &t)
}

// avoids lambda package dependency during local development
func testEnvOnly(event string) {

	var testEvent faas.Event

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

	// set env vars
	err := osVars.Assign()
	if err != nil {
		log.Fatal(err)
	}

	// ### TEST ENV only: assign event from env var
	var osTestEvent string = os.Getenv("TEST_EVENT")
	if len(osTestEvent) > 0 {
		testEnvOnly(osTestEvent)
		return
	}
	// ###

	lambda.Start(handleEvent)
}
