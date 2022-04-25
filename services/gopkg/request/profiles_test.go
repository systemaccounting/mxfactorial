package request

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func TestMapProfileIDsToAccounts(t *testing.T) {

	testid1 := types.ID("1")
	testaccountname1 := "test1"
	testid2 := types.ID("2")
	testaccountname2 := "test2"

	testinput := []*types.AccountProfileID{
		{
			ID:          &testid1,
			AccountName: &testaccountname1,
		},
		{
			ID:          &testid2,
			AccountName: &testaccountname2,
		},
	}

	got := MapProfileIDsToAccounts(testinput)
	want := map[string]types.ID{
		testaccountname1: testid1,
		testaccountname2: testid2,
	}
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want, %v", got, want)
	}
}

func TestAddProfileIDsToTrItems(t *testing.T) {

	testid1 := types.ID("1")
	testaccountname1 := "JacobWebb"
	testid2 := types.ID("2")
	testaccountname2 := "StateOfCalifornia"
	testid3 := types.ID("3")
	testaccountname3 := "GroceryStore"

	testTransaction := GetTestTransaction(t, transNoAppr)

	got := AddProfileIDsToTrItems(
		testTransaction.TransactionItems,
		map[string]types.ID{
			testaccountname1: testid1,
			testaccountname2: testid2,
			testaccountname3: testid3,
		},
	)

	want := []struct {
		dbPrID types.ID
		crPrID types.ID
	}{
		{dbPrID: testid1, crPrID: testid2},
		{dbPrID: testid1, crPrID: testid2},
		{dbPrID: testid1, crPrID: testid2},
		{dbPrID: testid1, crPrID: testid3},
		{dbPrID: testid1, crPrID: testid3},
		{dbPrID: testid1, crPrID: testid3},
	}

	for i, g := range got {
		w := want[i]
		if *g.DebitorProfileID != w.dbPrID {
			t.Errorf("got %v, want DebitorProfileID %v", *g.DebitorProfileID, w.dbPrID)
		}
		if *g.CreditorProfileID != w.crPrID {
			t.Errorf("got %v, want CreditorProfileID %v", *g.CreditorProfileID, w.crPrID)
		}
	}
}
