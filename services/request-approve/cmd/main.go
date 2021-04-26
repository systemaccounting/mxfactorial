package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgx/v4"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

var (
	pgHost     string = os.Getenv("PGHOST")
	pgPort            = os.Getenv("PGPORT")
	pgUser            = os.Getenv("PGUSER")
	pgPassword        = os.Getenv("PGPASSWORD")
	pgDatabase        = os.Getenv("PGDATABASE")
	pgConn            = fmt.Sprintf(
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
	if &e.AuthAccount == nil ||
		&e.AccountName == nil ||
		&e.AccountRole == nil ||
		e.ID == nil ||
		e.AuthAccount == "" {
		return "", errReqValsMissing
	}

	// create sql to get current transaction
	preTrSQL, preTrArgs := sqlb.SelectTransactionByIDSQL(
		e.ID,
	)

	// create sql to get current transaction items
	preTrItemsSQL, preTrItemsArgs := sqlb.SelectTrItemsByTrIDSQL(
		e.ID,
	)

	// create sql to get current approvers
	preApprSQL, preApprArgs := sqlb.SelectApproversByTrIDSQL(
		e.AccountName,
		e.AccountRole,
		e.ID,
	)

	// connect to postgres
	db, err := c.Connect(context.Background(), pgConn)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// close db connection when main exits
	defer db.Close(context.Background())

	// get current transaction
	preTrRow := db.QueryRow(
		context.Background(),
		preTrSQL,
		preTrArgs...,
	)

	// unmarshal current transaction
	preTr, err := lpg.UnmarshalTransaction(
		preTrRow,
	)
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
	preTrItemRows, err := db.Query(
		context.Background(),
		preTrItemsSQL,
		preTrItemsArgs...,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// unmarshal transaction items
	preTrItems, err := lpg.UnmarshalTrItems(
		preTrItemRows,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// convert transaction items to list of maps for convenient value testing
	preTrItemsMaps := make([]map[string]*string, 0)
	for _, v := range preTrItems {
		// defensive
		if *v.Debitor == *e.AccountName &&
			*v.Creditor == *e.AccountName {
			var err = errors.New("same debitor and creditor in item. exiting")
			return "", err
		}

		m := make(map[string]*string)
		if *v.Debitor == *e.AccountName {
			m["debitor"] = v.DebitorApprovalTime
		}
		if *v.Creditor == *e.AccountName {
			m["creditor"] = v.CreditorApprovalTime
		}
		preTrItemsMaps = append(preTrItemsMaps, m)
	}

	// fail approval if 0 approval time stamps pending in transaction items
	itemApprovalsPending := 0
	for _, v := range preTrItemsMaps {
		if val, ok := v[*e.AccountRole]; ok {
			if val == nil {
				itemApprovalsPending++
			}
		}
	}
	if itemApprovalsPending == 0 {
		var err = errors.New("account not found in items. exiting")
		return "", err
	}

	// get transaction approvers
	preApprRows, err := db.Query(
		context.Background(),
		preApprSQL,
		preApprArgs...,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// unmarshal transaction approvers
	preApprovers, err := lpg.UnmarshalApprovers(
		preApprRows,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// fail approval if account not found as approver or timestamps not pending
	approverTimeStampsPending := 0
	for _, v := range preApprovers {
		if *v.AccountName == *e.AccountName &&
			*v.AccountRole == *e.AccountRole &&
			v.ApprovalTime == nil {
			approverTimeStampsPending++
		}
	}
	if approverTimeStampsPending == 0 {
		var err = errors.New("0 timestamps pending for approver. exiting")
		return "", err
	}

	// todo: dedupe queries

	// create update approver sql returning
	// all columns of updated approvers
	updSQL, updArgs := sqlb.UpdateApproversSQL(
		e.AccountName,
		e.AccountRole,
		e.ID,
	)

	// update approvers
	updatedApproverRows, err := db.Query(
		context.Background(),
		updSQL,
		updArgs...,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// unmarshal approvers returned from update query
	updatedApprovers, err := lpg.UnmarshalApprovers(
		updatedApproverRows,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// list transaction item ids affected by approvals
	// sqlbuilder pkg wants interface args
	var trItemIDsAffectedByApprovals []interface{}
	for _, v := range updatedApprovers {
		trItemIDsAffectedByApprovals = append(
			trItemIDsAffectedByApprovals,
			v.TransactionItemID,
		)
	}

	// create sql to get approvers of transaction
	// item IDs affected by current approval
	getApprSQL, getApprArgs := sqlb.SelectApproversByTrItemIDsSQL(
		e.AccountRole,
		trItemIDsAffectedByApprovals,
	)

	// get all approvers of transaction items
	// affected by current approval
	approversPerTrItemRows, err := db.Query(
		context.Background(),
		getApprSQL,
		getApprArgs...,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// unmarshal approvers of transaction items
	// affected by current approval
	allApproversPerAffectedTrItem, err := lpg.UnmarshalApprovers(
		approversPerTrItemRows,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// count transaction item id occurrence across approvers
	trItemIDOccurrence := make(map[int32]int)
	for _, v := range allApproversPerAffectedTrItem {
		trItemIDOccurrence[*v.TransactionItemID] += 1
	}

	// list newly approved transaction item ids
	var approvedTrItemIDs []interface{}
	for trItemID, total := range trItemIDOccurrence {
		apprCount := 0
		for _, v := range allApproversPerAffectedTrItem {
			if *v.TransactionItemID == trItemID {
				if len(*v.ApprovalTime) > 0 {
					apprCount++
				}
			}
		}
		if apprCount == total {
			approvedTrItemIDs = append(approvedTrItemIDs, trItemID)
		}
	}

	// create sql to update transaction items affected by current approval
	updTrItemSQL, updTrItemArgs := sqlb.UpdateTrItemAfterApprovalSQL(
		*e.AccountRole+"_approval_time",
		approvedTrItemIDs,
	)

	// update transaction items affected by current approval
	_, err = db.Exec(
		context.Background(),
		updTrItemSQL,
		updTrItemArgs...,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// final step: update transaction with equilibrium time
	// and summed value IF all transaction items approved

	// create sql to get all transaction items after latest approval
	trItemsByTrIDSQL, trItemsByTrIDArgs := sqlb.SelectTrItemsByTrIDSQL(
		e.ID,
	)

	trItemRows, err := db.Query(
		context.Background(),
		trItemsByTrIDSQL,
		trItemsByTrIDArgs...,
	)
	if err != nil {
		return "", err
	}

	allTrItemsInTransaction, err := lpg.UnmarshalTrItems(
		trItemRows,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	requiredTotalApprovalCount := len(allTrItemsInTransaction)
	measuredApprovalCount := 0
	equilibriumTime := time.Time{}
	if err != nil {
		log.Print(err)
		return "", err
	}
	for _, v := range allTrItemsInTransaction {
		if len(*v.DebitorApprovalTime) > 0 && len(*v.CreditorApprovalTime) > 0 {
			// count items approved by debitor and creditor
			measuredApprovalCount++

			// also search for last approval time
			currDebTime, err := convertPGTimeToGo(v.DebitorApprovalTime)
			if err != nil {
				log.Print(err)
				return "", err
			}
			currCredTime, err := convertPGTimeToGo(v.CreditorApprovalTime)
			if err != nil {
				log.Print(err)
				return "", err
			}
			equilibriumTime = getLatestTime(currDebTime, currCredTime)
		}
	}

	postApprovalTransaction := preTr

	if requiredTotalApprovalCount == measuredApprovalCount {
		// create update transaction sql
		updTrByIDSQL, updTrByIDArgs := sqlb.UpdateTransactionByIDSQL(
			e.ID,
			equilibriumTime.Format("2006-01-02T15:04:05.000000Z"),
		)

		// update transaction with equilibrium values
		updTrRow := db.QueryRow(
			context.Background(),
			updTrByIDSQL,
			updTrByIDArgs...,
		)

		// unmarshal transaction with equilibrium values
		updTr, err := lpg.UnmarshalTransaction(updTrRow)
		if err != nil {
			log.Print(err)
			return "", err
		}

		// assign returning transaction updated values
		postApprovalTransaction = updTr
	}

	// create transaction for response to client
	intraTr := tools.CreateIntraTransaction(
		e.AuthAccount,
		postApprovalTransaction,
		allTrItemsInTransaction,
	)
	// todo: send notifications to approvers

	// send string or error response to client
	return tools.MarshalIntraTransaction(&intraTr)
}

func getLatestTime(t1, t2 *time.Time) time.Time {
	if t1.After(*t2) {
		return *t1
	}
	return *t2
}

func convertPGTimeToGo(pgt *string) (*time.Time, error) {
	t, err := time.Parse(time.RFC3339, *pgt)
	if err != nil {
		log.Print(err)
		return nil, err
	}
	return &t, nil
}

func isUnique(i int32, l []int32) bool {
	for _, v := range l {
		if i == v {
			return false
		}
	}
	return true
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