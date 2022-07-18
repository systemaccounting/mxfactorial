package sqls

import (
	"testing"

	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/testdata"
)

func TestUpdateAccountBalancesSQL(t *testing.T) {
	tr := testdata.GetTestTransaction("../testdata/transWTimes.json")
	u := NewUpdateBuilder()

	gotSQL, gotArgs := u.UpdateAccountBalancesSQL(tr.TransactionItems)

	wantSQL := "SELECT change_account_balances(($1, $2, $3), ($4, $5, $6), ($7, $8, $9), ($10, $11, $12), ($13, $14, $15), ($16, $17, $18), ($19, $20, $21), ($22, $23, $24), ($25, $26, $27), ($28, $29, $30), ($31, $32, $33), ($34, $35, $36))"

	if gotSQL != wantSQL {
		t.Errorf("got %v, want %v", gotSQL, wantSQL)
	}

	wantArg0 := "GroceryCo"
	gotArg0 := getString(gotArgs, 0, t)
	if gotArg0 != wantArg0 {
		t.Errorf("got %v, want %v", gotArg0, wantArg0)
	}

	wantArg1 := createDecimal("5", t)
	gotArg1 := getDecimal(gotArgs, 1, t)
	if gotArg1.Cmp(wantArg1) != 0 {
		t.Errorf("got %v, want %v", gotArg1, wantArg1)
	}

	wantArg2 := "67"
	gotArg2 := getString(gotArgs, 2, t)
	if gotArg2 != wantArg2 {
		t.Errorf("got %v, want %v", gotArg2, wantArg2)
	}

	wantArg3 := "SarahBell"
	gotArg3 := getString(gotArgs, 3, t)
	if gotArg3 != wantArg3 {
		t.Errorf("got %v, want %v", gotArg3, wantArg3)
	}

	wantArg4 := "-5"
	gotArg4 := getString(gotArgs, 4, t)
	if gotArg4 != wantArg4 {
		t.Errorf("got %v, want %v", gotArg4, wantArg4)
	}

	wantArg5 := "67"
	gotArg5 := getString(gotArgs, 5, t)
	if gotArg5 != wantArg5 {
		t.Errorf("got %v, want %v", gotArg5, wantArg5)
	}

	wantCount := 36
	gotCount := len(gotArgs)
	if gotCount != wantCount {
		t.Errorf("got %v, want %v", gotCount, wantCount)
	}
}

func getString(args []interface{}, idx int, t *testing.T) string {
	val, ok := args[idx].(string)
	if !ok {
		t.Errorf("type assert error at index %d, want string", idx)
	}
	return val
}

func getDecimal(args []interface{}, idx int, t *testing.T) decimal.Decimal {
	val, ok := args[idx].(decimal.Decimal)
	if !ok {
		t.Errorf("type assert error at index %d, want decimal.Decimal", idx)
	}
	return val
}

func createDecimal(s string, t *testing.T) decimal.Decimal {
	d, err := decimal.NewFromString(s)
	if err != nil {
		t.Error(err)
	}
	return d
}
