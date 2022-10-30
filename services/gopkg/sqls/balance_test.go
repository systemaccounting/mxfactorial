package sqls

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/testdata"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func TestSelectAccountBalancesSQL(t *testing.T) {
	testacct1 := "testacct1"
	testacct2 := "testacct2"
	testaccts := []string{testacct1, testacct2}
	testbuilder := AccountBalanceSQLs{}
	want1 := "SELECT account_name, current_balance FROM account_balance WHERE account_name IN ($1, $2)"
	want2 := []interface{}{testacct1, testacct2}
	got1, got2 := testbuilder.SelectAccountBalancesSQL(testaccts)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestSelectCurrentAccountBalanceByAccountNameSQL(t *testing.T) {
	testacct := "testacct"
	testbuilder := AccountBalanceSQLs{}
	want1 := "SELECT current_balance FROM account_balance WHERE account_name = $1"
	want2 := []interface{}{testacct}
	got1, got2 := testbuilder.SelectCurrentAccountBalanceByAccountNameSQL(testacct)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestInsertAccountBalanceSQL(t *testing.T) {
	testacct := "testacct"
	testbalance := decimal.Decimal{}
	testacctid := types.ID("1")
	testbuilder := AccountBalanceSQLs{}
	want1 := "INSERT INTO account_balance (account_name, current_balance, current_transaction_item_id) VALUES ($1, $2, $3)"
	want2 := []interface{}{testacct, testbalance, testacctid}
	got1, got2 := testbuilder.InsertAccountBalanceSQL(testacct, testbalance, testacctid)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestUpdateDebitorAccountBalanceSQL(t *testing.T) {

	testtransaction := testdata.GetTestTransaction("../testdata/transWTimes.json")
	testtritem := testtransaction.TransactionItems[0]

	want1 := "UPDATE account_balance SET current_balance = $1, current_transaction_item_id = $2 WHERE account_name = $3"

	want2Price := testtritem.Price.Mul(testtritem.Quantity).Neg()
	want2TrItID := testtritem.ID
	want2Debitor := *testtritem.Debitor
	want2 := []interface{}{want2Price, want2TrItID, want2Debitor}

	testbuilder := AccountBalanceSQLs{}

	got1, got2 := testbuilder.UpdateDebitorAccountBalanceSQL(testtritem)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestUpdateCreditorAccountBalanceSQL(t *testing.T) {

	testtransaction := testdata.GetTestTransaction("../testdata/transWTimes.json")
	testtritem := testtransaction.TransactionItems[0]

	want1 := "UPDATE account_balance SET current_balance = $1, current_transaction_item_id = $2 WHERE account_name = $3"

	want2Price := testtritem.Price.Mul(testtritem.Quantity)
	want2TrItID := testtritem.ID
	want2Creditor := *testtritem.Creditor
	want2 := []interface{}{want2Price, want2TrItID, want2Creditor}

	testbuilder := AccountBalanceSQLs{}

	got1, got2 := testbuilder.UpdateCreditorAccountBalanceSQL(testtritem)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestUpdateAccountBalancesSQL(t *testing.T) {

	testtransaction := testdata.GetTestTransaction("../testdata/transWTimes.json")
	testtritems := testtransaction.TransactionItems

	want1 := "SELECT change_account_balances(($1, $2, $3), ($4, $5, $6), ($7, $8, $9), ($10, $11, $12), ($13, $14, $15), ($16, $17, $18), ($19, $20, $21), ($22, $23, $24), ($25, $26, $27), ($28, $29, $30), ($31, $32, $33), ($34, $35, $36))"

	testbuilder := AccountBalanceSQLs{}
	got1, got2 := testbuilder.UpdateAccountBalancesSQL(testtritems)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	// build flattened list of sql params in
	// want2 before asserting flattened got2
	want2 := []interface{}{}

	for _, v := range testtritems {

		want2 = append(want2,
			*v.Creditor,
			v.Price.Mul(v.Quantity),
			string(*v.ID),
			*v.Debitor,
			v.Price.Mul(v.Quantity).Neg(),
			string(*v.ID))
	}

	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}
