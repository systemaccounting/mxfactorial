package sqls

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/systemaccounting/mxfactorial/services/gopkg/testdata"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func TestInsertTrItemSQL(t *testing.T) {

	testtransaction := testdata.GetTestTransaction("../testdata/transWTimes.json")
	testtritem := testtransaction.TransactionItems[0]

	testwithsql := WithSQLs{}
	testtrauxstmtbuilder := testwithsql.SelectIDFromInsertTransactionCTEAuxStmt()

	testbuilder := TransactionItemSQLs{}
	testinstritembuilder := testbuilder.InsertTrItemSQL(
		testtritem,
		testtrauxstmtbuilder,
	)

	got1, got2 := testinstritembuilder.Build()

	want1 := "INSERT INTO transaction_item (transaction_id, item_id, price, quantity, debitor_first, rule_instance_id, rule_exec_ids, unit_of_measurement, units_measured, debitor, creditor, debitor_profile_id, creditor_profile_id, debitor_approval_time, creditor_approval_time, debitor_expiration_time, creditor_expiration_time) VALUES ((SELECT id FROM insert_transaction), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) returning id"
	want2 := []interface{}{
		testtritem.ItemID,
		testtritem.Price,
		testtritem.Quantity,
		testtritem.DebitorFirst,
		testtritem.RuleInstanceID,
		testtritem.RuleExecIDs,
		testtritem.UnitOfMeasurement,
		testtritem.UnitsMeasured,
		testtritem.Debitor,
		testtritem.Creditor,
		testtritem.DebitorProfileID,
		testtritem.CreditorProfileID,
		testtritem.DebitorApprovalTime,
		testtritem.CreditorApprovalTime,
		testtritem.DebitorExpirationTime,
		testtritem.CreditorExpirationTime,
	}

	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestSelectTrItemsByTrIDSQL(t *testing.T) {
	testid := types.ID("1")
	testbuilder := TransactionItemSQLs{}
	want1 := "SELECT * FROM transaction_item WHERE transaction_id = $1"
	want2 := []interface{}{testid}
	got1, got2 := testbuilder.SelectTrItemsByTrIDSQL(testid)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestSelectTrItemsByTrIDsSQL(t *testing.T) {
	testid1 := types.ID("1")
	testid2 := types.ID("2")
	testids := types.IDs{&testid1, &testid2}
	testbuilder := TransactionItemSQLs{}
	want1 := "SELECT * FROM transaction_item WHERE transaction_id IN ($1, $2)"
	want2 := []interface{}{&testid1, &testid2}
	got1, got2 := testbuilder.SelectTrItemsByTrIDsSQL(testids)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}
