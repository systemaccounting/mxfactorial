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

// 1. from subquery, get transaction items pending approval
// 			by account, and limit the subquery return with
// 			configured RETURN_RECORD_LIMIT
// 2. query all transaction items by distinct transaction_id
// 3. return all transaction items in desc order
const (
	sql string = `
	SELECT * FROM transaction_item
	WHERE transaction_id IN (
		SELECT DISTINCT transaction_id
		FROM transaction_item
		WHERE (debitor = $1 OR creditor = $1)
		AND debitor_approval_time IS NULL
		OR creditor_approval_time IS NULL
		ORDER BY transaction_id
		DESC
		LIMIT $2
	) ORDER BY transaction_id
	DESC;`
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

	if &e.AccountName == nil {
		return "", errors.New("missing account_name. exiting")
	}

	// connect to postgres
	db, err := c.Connect(ctx, pgConn)
	if err != nil {
		return "", err
	}
	defer db.Close(context.Background())

	// query
	rows, err := db.Query(
		ctx,
		sql,
		e.AccountName,
		recordLimit,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// unmarshal query response
	trItems, err := lpg.UnmarshalTrItems(rows)
	if err != nil {
		if err == pgx.ErrNoRows {
			var errMsg string = "0 transaction items found"
			log.Print(errMsg)
			return "", errors.New(errMsg)
		}
		log.Print(err)
		return "", err
	}

	var trIDs []interface{}
	for _, v := range trItems {
		if tools.IsCustomIDUnique(*v.TransactionID, trIDs) {
			trIDs = append(trIDs, *v.TransactionID)
		}
	}

	// create sql to get current transaction
	trsSQL, trsArgs := sqlb.SelectTransactionsByIDsSQL(
		trIDs,
	)

	// get transactions
	trRows, err := db.Query(context.Background(), trsSQL, trsArgs...)
	if err != nil {
		return "", err
	}

	// unmarshal transactions
	trs, err := lpg.UnmarshalTransactions(trRows)
	if err != nil {
		return "", err
	}

	// add transaction items to each transaction
	for _, v := range trs {
		for _, w := range trItems {
			if *w.TransactionID == *v.ID {
				v.TransactionItems = append(v.TransactionItems, w)
			}
		}
	}

	// create for response to client
	intraTrs := tools.CreateIntraTransactions(e.AuthAccount, trs)

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
