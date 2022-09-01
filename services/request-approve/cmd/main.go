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
	dbConnector func(context.Context, string) (postgres.SQLDB, error),
	tranactionServiceConstructor func(db postgres.SQLDB) (service.ITransactionService, error),
	approveServiceConstructor func(db postgres.SQLDB) (service.IApproveService, error),
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

	// connect to db
	db, err := dbConnector(context.Background(), pgConn)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}
	defer db.Close(context.Background())

	// create transaction service
	tranService, err := tranactionServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// get transaction request
	preApprTr, err := tranService.GetTransactionWithTrItemsAndApprovalsByID(*e.ID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// fail approval if equilibrium_time set
	if preApprTr.EquilibriumTime != nil && !preApprTr.EquilibriumTime.IsZero() {
		var err = errors.New("equilibrium timestamp found. approval not pending")
		log.Print(err)
		return "", err
	}

	// create approve service
	apprService, err := approveServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// 1. add requested approval
	// 2. update approval time stamps in transaction items and transaction
	// 3. change account balances if equilibrium
	// 4. notify approvers
	return apprService.Approve(
		ctx,
		e.AuthAccount,
		accountRole,
		preApprTr,
		notifyTopicArn,
	)
}

// wraps lambdaFn accepting interfaces for testability
func handleEvent(
	ctx context.Context,
	e *types.RequestApprove,
) (string, error) {

	return lambdaFn(
		ctx,
		e,
		postgres.NewIDB,
		newTransactionService,
		newApproveService,
	)
}

// BEGIN: enables lambdaFn unit testing
func newTransactionService(idb postgres.SQLDB) (service.ITransactionService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newTransactionService: failed to assert *postgres.DB")
	}
	return service.NewTransactionService(db), nil
}

func newApproveService(idb postgres.SQLDB) (service.IApproveService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newApproveService: failed to assert *postgres.DB")
	}
	return service.NewApproveService(db), nil
}

// END: enables lambdaFn unit testing

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

	if len(os.Getenv("DEBUG")) > 0 {
		log.Print(resp)
	}
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
