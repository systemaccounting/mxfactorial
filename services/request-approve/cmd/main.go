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
	"github.com/systemaccounting/mxfactorial/services/gopkg/data"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/request"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

var (
	notifyTopicArn        = os.Getenv("NOTIFY_TOPIC_ARN")
	pgHost         string = os.Getenv("PGHOST")
	pgPort                = os.Getenv("PGPORT")
	pgUser                = os.Getenv("PGUSER")
	pgPassword            = os.Getenv("PGPASSWORD")
	pgDatabase            = os.Getenv("PGDATABASE")
	pgConn                = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s",
		pgHost,
		pgPort,
		pgUser,
		pgPassword,
		pgDatabase)
	errReqValsMissing error = errors.New("required values missing. exiting")
)

func lambdaFn(
	ctx context.Context,
	e *types.RequestApprove,
	c lpg.Connector,
) (string, error) {

	// todo: more
	if e.AuthAccount == "" ||
		e.AccountName == nil ||
		e.AccountRole == nil ||
		e.ID == nil {
		return "", errReqValsMissing
	}

	var accountRole types.Role
	accountRole.Set(*e.AccountRole)

	// connect to postgres
	db, err := c.Connect(context.Background(), pgConn)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// close db connection when main exits
	defer db.Close(context.Background())

	// get current transaction
	preTr, err := data.GetTransactionByID(db, e.ID)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// fail approval if equilibrium_time set
	if preTr.EquilibriumTime != nil {
		var err = errors.New("equilibrium timestamp found. approval not pending")
		return "", err
	}

	// get transaction items
	preTrItems, err := data.GetTrItemsByTransactionID(
		db,
		e.ID,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// attach pre approval transaction items to
	// pre approval transaction
	preTr.TransactionItems = preTrItems

	// get transaction approvers
	preApprovals, err := data.GetApprovalsByTransactionID(
		db,
		e.ID,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// 1. add requested approval
	// 2. update approval time stamps in transaction items and transaction
	// 3. change account balances if equilibrium
	// 4. notify approvers
	return request.Approve(
		db,
		e.AccountName,
		&e.AuthAccount,
		accountRole,
		preTr,
		preApprovals,
		&notifyTopicArn,
	)
}

// wraps lambdaFn accepting interfaces for testability
func handleEvent(
	ctx context.Context,
	e *types.RequestApprove,
) (string, error) {
	c := lpg.NewConnector(pgx.Connect)
	return lambdaFn(ctx, e, c)
}

// avoids lambda package dependency during local development
func localEnvOnly(event string) {

	// var testEvent types.IntraTransaction
	var testEvent *types.RequestApprove

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

	// log.Print(resp)
	_ = resp
}

func main() {

	var envVars = []string{
		pgHost,
		pgPort,
		pgUser,
		pgPassword,
		pgDatabase,
	}

	for _, v := range envVars {
		if len(v) == 0 {
			log.Fatal("env var not set")
		}
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
