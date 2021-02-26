package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgx/v4"
	faas "github.com/systemaccounting/mxfactorial/services/trans-query-id-faas"
	"github.com/systemaccounting/mxfactorial/services/trans-query-id-faas/pkg/pg"
)

const query string = "SELECT * FROM transactions WHERE transaction_id=$1;"

var pgConn string = fmt.Sprintf(
	"host=%s port=%s user=%s password=%s dbname=%s",
	os.Getenv("PGHOST"),
	os.Getenv("PGPORT"),
	os.Getenv("PGUSER"),
	os.Getenv("PGPASSWORD"),
	os.Getenv("PGDATABASE"))

func lambdaFn(
	ctx context.Context,
	e faas.Event,
	d faas.Connector,
	t *faas.Transactions,
) (string, error) {

	// connect to postgres
	db, err := d.Connect(ctx, pgConn)
	if err != nil {
		log.Printf("connect error: %v", err)
		return "", err
	}

	// query
	rows, err := db.Query(
		ctx,
		query,
		e.TransactionID,
	)
	if err != nil {
		log.Printf("query error: %v", err)
		return "", err
	}

	// unmarshal query response
	err = db.Unmarshal(ctx, rows, t)
	if err != nil {
		log.Printf("umarshal error: %v", err)
		return "", err
	}

	return t.Marshal()
}

// wraps lambdaFn accepting db interface for testability
func handleEvent(ctx context.Context, e faas.Event) (string, error) {
	var t faas.Transactions
	d := pg.NewConnector(pgx.Connect)
	return lambdaFn(ctx, e, d, &t)
}

// avoids lambda package dependency during local development
func testEventOnly(event string) {

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

	// LOCAL ENV ONLY: assign event from env var
	var osTestEvent string = os.Getenv("TEST_EVENT")
	if len(osTestEvent) > 0 {
		testEventOnly(osTestEvent)
		return
	}

	lambda.Start(handleEvent)
}
