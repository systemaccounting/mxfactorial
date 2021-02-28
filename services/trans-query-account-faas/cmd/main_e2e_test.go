// +build integration

package main

import (
	"os"
	"testing"

	faas "github.com/systemaccounting/mxfactorial/services/trans-query-account-faas"
	"github.com/systemaccounting/mxfactorial/services/trans-query-account-faas/pkg/e2e"
)

var (
	setupSQLPath string = "../e2e/setup.sql"
	jsonDataPath string = "../testdata/transactions.json"
	senderAcct   string = os.Getenv("TEST_SENDER_ACCOUNT")
	awsRegion    string = os.Getenv("AWS_REGION")
	lambdaFnName string = os.Getenv("LAMBDA_FUNCTION_NAME")
	sql          string = `INSERT INTO transactions (
		name,
		price,
		quantity,
		rule_instance_id,
		transaction_id,
		author,
		debitor,
		creditor,
		debitor_approval_time,
		creditor_approval_time
	) VALUES (
		$1,$2,$3,$4,$5,$6,$7,$8,$9,$10
	) RETURNING id;`
)

func setUp(t *testing.T) []int32 {
	addedIDs, err := e2e.Setup(jsonDataPath, pgConn, sql)
	if err != nil {
		t.Fatal(err)
	}

	// log.Printf("added %d: %v", len(addedIDs), addedIDs)
	return addedIDs
}

func tearDown(t *testing.T, addedIDs []int32) {
	delSQL := e2e.CreateDeletSQL(addedIDs)
	delParams := e2e.CreateParameters(addedIDs)

	deletedIDs, err := e2e.TearDown(pgConn, delSQL, delParams)
	if err != nil {
		t.Error(err)
	}
	deletedIDCount := len(deletedIDs)
	// log.Printf("deleted %d: %v", deletedIDCount, deletedIDs)

	var addedIDCount int = len(addedIDs)
	if addedIDCount != deletedIDCount {
		t.Errorf("added %d, but deleted %d", addedIDCount, deletedIDCount)
	}
}

func TestE2EMatchingValues(t *testing.T) {
	// create temp records in postgres
	IDsToRemove := setUp(t)

	// request records from lambda
	testEvent := &faas.Event{
		TransactionID:        "",
		Account:              senderAcct,
		GraphQLRequestSender: senderAcct,
	}
	revOrder, err := e2e.Request(t, testEvent, awsRegion, lambdaFnName)
	if err != nil {
		t.Fatal(err)
	}

	// reverse order of query response to match disk
	var transFromReq faas.Transactions
	for i := len(revOrder) - 1; i >= 0; i-- {
		transFromReq = append(transFromReq, revOrder[i])
	}

	// load expected from disk
	transFromDisk, err := e2e.LoadJSONData(jsonDataPath)
	if err != nil {
		t.Fatal(err)
	}

	// test response data
	for i, v := range transFromReq {

		got := *v
		want := *transFromDisk[i]
		/*
			assert equality:
				got.TableID,
				got.Name,
				got.Price,
				got.Quantity,
				got.RuleInstanceID,
				got.TransactionID,
				got.Author,
				got.Debitor,
				got.Creditor,
				got.DebitorApprovalTime,
				got.CreditorApprovalTime,
		*/

		if got.TableID != IDsToRemove[i] {
			t.Errorf(
				"got id %v, want %v",
				got.TableID,
				IDsToRemove[i],
			)
		}
		if got.Name != want.Name {
			t.Errorf(
				"got name %v, want %v on record id %v",
				got.Name,
				want.Name,
				got.TableID,
			)
		}
		if got.Price != want.Price {
			t.Errorf(
				"got price %v, want %v on record id %v",
				got.Price,
				want.Price,
				got.TableID,
			)
		}
		if got.Quantity != want.Quantity {
			t.Errorf(
				"got quantity %v, want %v on record id %v",
				got.Quantity,
				want.Quantity,
				got.TableID,
			)
		}
		if got.RuleInstanceID != want.RuleInstanceID {
			t.Errorf(
				"got rule id %v, want %v on record id %v",
				got.RuleInstanceID,
				want.RuleInstanceID,
				got.TableID,
			)
		}
		if got.TransactionID != want.TransactionID {
			t.Errorf(
				"got transaction id %v, want %v on record id %v",
				got.TransactionID,
				want.TransactionID,
				got.TableID,
			)
		}
		if got.Author != want.Author {
			t.Errorf(
				"got author %v, want %v on record id %v",
				got.Author,
				want.Author,
				got.TableID,
			)
		}
		if got.Debitor != want.Debitor {
			t.Errorf(
				"got debitor %v, want %v on record id %v",
				got.Debitor,
				want.Debitor,
				got.TableID,
			)
		}
		if got.Creditor != want.Creditor {
			t.Errorf(
				"got creditor %v, want %v on record id %v",
				got.Creditor,
				want.Creditor,
				got.TableID,
			)
		}
		if got.DebitorApprovalTime != want.DebitorApprovalTime {
			t.Errorf(
				"got debitor approval time %v, want %v on record id %v",
				got.DebitorApprovalTime,
				want.DebitorApprovalTime,
				got.TableID,
			)
		}
		if got.CreditorApprovalTime != want.CreditorApprovalTime {
			t.Errorf(
				"got creditor approval time %v, want %v on record id %v",
				got.CreditorApprovalTime,
				want.CreditorApprovalTime,
				got.TableID,
			)
		}
	}

	// delete records
	t.Cleanup(func() {
		tearDown(t, IDsToRemove)
	})
}

func TestE2EResponseLength(t *testing.T) {
	// create temp records in postgres
	IDsToRemove := setUp(t)

	// request records from lambda
	testEvent := &faas.Event{
		TransactionID:        "",
		Account:              senderAcct,
		GraphQLRequestSender: senderAcct,
	}
	transFromReq, err := e2e.Request(t, testEvent, awsRegion, lambdaFnName)
	if err != nil {
		t.Fatal(err)
	}

	got := len(transFromReq)
	// only 3 transactions in test data with
	// b41869c2-9a01-4412-92e3-b6ebd81acf55 transaction_id value
	want := 3

	if got != want {
		t.Errorf("got %d transactions, want %d", got, want)
	}

	// delete records
	t.Cleanup(func() {
		tearDown(t, IDsToRemove)
	})
}
