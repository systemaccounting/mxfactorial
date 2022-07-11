package request

import (
	"context"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/shopspring/decimal"
	mlpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg/mock_lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	msqls "github.com/systemaccounting/mxfactorial/services/gopkg/sqls/mock_sqls"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
	mtypes "github.com/systemaccounting/mxfactorial/services/gopkg/types/mock_types"
)

func TestTestDebitorCapacity(t *testing.T) {

	// test inputs
	testdecimal, err := decimal.NewFromString("1.000")
	if err != nil {
		t.Errorf(err.Error())
	}
	testacct := "testacct"
	testsql := "testsql"
	testrequiredfunds := map[string]decimal.Decimal{
		testacct: testdecimal,
	}

	// mock tools
	ctrl := gomock.NewController(t)
	testdb := mlpg.NewMockSQLDB(ctrl)
	mockrows := mlpg.NewMockRows(ctrl)
	mockpgunmarshaler := mlpg.NewMockPGUnmarshaler(ctrl)
	testrows := mlpg.NewMockRows(ctrl)
	testtritems := mtypes.NewMockTrItemListHelper(ctrl)
	sb := msqls.NewMockSelectSQLBuilder(ctrl)
	testacc1 := "testacc1"
	testacc1bal, err := decimal.NewFromString("10.000")
	if err != nil {
		t.Errorf(err.Error())
	}
	testacc2 := "testacc2"
	testacc2bal, err := decimal.NewFromString("11.000")
	if err != nil {
		t.Errorf(err.Error())
	}
	testbalances := []*types.AccountBalance{
		{
			AccountName:    &testacc1,
			CurrentBalance: testacc1bal,
		},
		{
			AccountName:    &testacc2,
			CurrentBalance: testacc2bal,
		},
	}

	// expects
	sb.EXPECT().
		SelectAccountBalancesSQL([]interface{}{testacct}).
		Times(1).
		Return(testsql, []interface{}{})

	testtritems.
		EXPECT().
		MapDebitorsToRequiredFunds().
		Times(1).
		Return(testrequiredfunds)

	testtritems.
		EXPECT().
		ListUniqueDebitorAccountsFromTrItems().
		Times(1).
		Return([]string{testacct})

	testdb.
		EXPECT().
		Query(gomock.Any(), gomock.Any(), gomock.Any()).
		Times(1).
		Return(testrows, nil)

	mockpgunmarshaler.
		EXPECT().
		UnmarshalAccountBalances(mockrows).
		Times(1).
		Return(testbalances, nil)

	// test
	got := TestDebitorCapacity(
		testdb,
		mockpgunmarshaler,
		func() sqls.SelectSQLBuilder { return sb },
		testtritems)

	if got != nil {
		t.Errorf("got %v, want nil", got)
	}

}

func TestGetAccountBalance(t *testing.T) {

	ctrl := gomock.NewController(t)
	mockdb := mlpg.NewMockSQLDB(ctrl)
	mockpgunmarshaler := mlpg.NewMockPGUnmarshaler(ctrl)
	mockbuilder := msqls.NewMockSelectSQLBuilder(ctrl)
	count := 0
	mocksbfn := func() sqls.SelectSQLBuilder {
		count++
		return mockbuilder
	}
	mockrow := mlpg.NewMockRow(ctrl)
	testacct := "testaccount"
	testsql := "testsql"
	testargs := []interface{}{""}
	testbalance, err := decimal.NewFromString("10.000")
	if err != nil {
		t.Errorf("NewFromString err: %v", err)
	}

	mockbuilder.
		EXPECT().
		SelectCurrentAccountBalanceByAccountNameSQL(&testacct).
		Times(1).
		Return(testsql, testargs)

	mockdb.
		EXPECT().
		QueryRow(
			context.TODO(),
			testsql,
			testargs...,
		).
		Times(1).
		Return(mockrow)

	mockpgunmarshaler.
		EXPECT().
		UnmarshalAccountBalance(mockrow).
		Times(1).
		Return(testbalance, nil)

	bal, err := GetAccountBalance(
		mockdb,
		mockpgunmarshaler,
		mocksbfn,
		&testacct)
	if err != nil {
		t.Errorf("GetAccountBalance err: %v", err)
	}

	want := testbalance.String()
	got := bal.String()

	if count != 1 {
		t.Error("wasnt called once")
	}

	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}
