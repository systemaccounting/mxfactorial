package request

import (
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/shopspring/decimal"
	mlpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg/mock_lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	msqls "github.com/systemaccounting/mxfactorial/services/gopkg/sqls/mock_sqls"
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
	testrows := mlpg.NewMockRows(ctrl)
	testtritems := mtypes.NewMockTrItemListHelper(ctrl)
	sb := msqls.NewMockSelectSQLBuilder(ctrl)

	// expects
	sb.EXPECT().
		SelectAccountBalancesSQL([]interface{}{testacct}).
		Times(1).
		Return(testsql, []interface{}{})

	testrows.EXPECT().Next().Times(1)

	testrows.EXPECT().Close().Times(1)

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

	// test
	got := TestDebitorCapacity(
		testdb,
		func() sqls.SelectSQLBuilder { return sb },
		testtritems)

	if got != nil {
		t.Errorf("got %v, want nil", got)
	}

}
