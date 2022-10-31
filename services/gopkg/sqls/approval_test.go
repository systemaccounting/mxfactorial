package sqls

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/systemaccounting/mxfactorial/services/gopkg/testdata"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func TestInsertApprovalsSQL(t *testing.T) {

	testtransaction := testdata.GetTestTransaction("../testdata/transWTimes.json")
	testapprovals := testtransaction.TransactionItems[0].Approvals

	testwithsql := WithSQLs{}
	testtrauxstmtbuilder := testwithsql.SelectIDFromInsertTransactionCTEAuxStmt()

	testtranssql := TransactionSQLs{}
	trItemAliasName := testtranssql.buildAuxStmtName(trItemAliasPrefix, 1)

	trItemAliasBuilder := testwithsql.SelectIDFromTrItemAliasCTEAuxStmt(trItemAliasName)

	testbuilder := ApprovalSQLs{}
	got1, testparams := testbuilder.InsertApprovalsSQL(
		testapprovals,
		testtrauxstmtbuilder,
		trItemAliasBuilder,
	).Build()

	want1 := "INSERT INTO approval (rule_instance_id, transaction_id, transaction_item_id, account_name, account_role, device_id, device_latlng, approval_time, expiration_time) VALUES ($1, (SELECT id FROM insert_transaction), (SELECT id FROM i_1), $2, $3, $4, $5, $6, $7), ($8, (SELECT id FROM insert_transaction), (SELECT id FROM i_1), $9, $10, $11, $12, $13, $14), ($15, (SELECT id FROM insert_transaction), (SELECT id FROM i_1), $16, $17, $18, $19, $20, $21)"

	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	// count approvals
	testapprovalcount := len(testapprovals)

	if len(testparams)%testapprovalcount != 0 {
		t.Errorf("error: testparams not evenly divided by testapprovals")
	}

	// divide testparams per testapprovals entry since its
	// a flattened list of values from multiple approvals
	testparamscount := len(testparams) / testapprovalcount

	// assert per testapproval
	for i, v := range testapprovals {

		want := []interface{}{
			v.RuleInstanceID,
			v.AccountName,
			v.AccountRole,
			v.DeviceID,
			v.DeviceLatlng,
			v.ApprovalTime,
			v.ExpirationTime,
		}

		start := i * testparamscount
		end := i*testparamscount + testparamscount

		got := testparams[start:end]

		if !cmp.Equal(got, want) {
			t.Errorf("got %v, want %v", got, want)
		}
	}
}

func TestSelectApprovalsByTrIDSQL(t *testing.T) {
	testid := types.ID("1")
	testbuilder := ApprovalSQLs{}
	want1 := "SELECT * FROM approval WHERE transaction_id = $1"
	want2 := []interface{}{testid}
	got1, got2 := testbuilder.SelectApprovalsByTrIDSQL(testid)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestSelectApprovalsByTrIDsSQL(t *testing.T) {
	testid1 := types.ID("1")
	testid2 := types.ID("2")
	testids := types.IDs{&testid1, &testid2}
	testbuilder := ApprovalSQLs{}
	want1 := "SELECT * FROM approval WHERE transaction_id IN ($1, $2)"
	want2 := []interface{}{&testid1, &testid2}
	got1, got2 := testbuilder.SelectApprovalsByTrIDsSQL(testids)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}
