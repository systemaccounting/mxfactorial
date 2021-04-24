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
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

// todo: integration test
// 1. get transaction items by transaction id
// 2. count transaction items where account included
// 3. count unapproved transactions items
// 4. return all transactions items IF:
//			i) the requesting account is present
//			ii) at least 1 unapproved item
const sql string = `
WITH transaction_id_items AS (
	SELECT *
	FROM transaction_item
	WHERE transaction_item.transaction_id = $1
),
included AS(
	SELECT count(id)
	FROM transaction_id_items
	WHERE creditor = $2
	OR debitor = $2
),
unapproved_count AS (
	SELECT count(id)
	FROM transaction_id_items
	WHERE debitor_approval_time IS NULL
	OR creditor_approval_time IS NULL
)
SELECT *
FROM transaction_id_items
WHERE (SELECT * FROM included) > 0
AND (SELECT * FROM unapproved_count) > 0;`

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

	// query
	rows, err := db.Query(
		ctx,
		sql,
		e.ID,
		e.AuthAccount,
	)
	if err != nil {
		log.Printf("query error: %v", err)
		return "", err
	}

	// unmarshal query response
	trItems, err := lpg.UnmarshalTrItems(rows)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// cte not retuning pgx.ErrNoRows when empty so test here
	if len(trItems) == 0 {
		var errMsg string = "0 pending transaction items found"
		return "", errors.New(errMsg)
	}

	// create sql to get current transaction
	trSQL, trArgs := sqlb.SelectTransactionByIDSQL(
		e.ID,
	)

	// get transaction
	trRow := db.QueryRow(context.Background(), trSQL, trArgs...)

	// unmarshal transaction
	tr, err := lpg.UnmarshalTransaction(trRow)
	if err != nil {
		return "", err
	}

	// create transaction for response to client
	intraTr := tools.CreateIntraTransaction(
		e.AuthAccount,
		tr,
		trItems,
	)

	// send string or error response to client
	return tools.MarshalIntraTransaction(&intraTr)
}

// wraps lambdaFn accepting db interface for testability
func handleEvent(ctx context.Context, e types.QueryByID) (string, error) {
	d := lpg.NewConnector(pgx.Connect)
	return lambdaFn(ctx, e, d)
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
