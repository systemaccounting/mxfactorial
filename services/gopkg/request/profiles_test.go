package request

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/systemaccounting/mxfactorial/services/gopkg/testdata"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

const (
	transNoAppr string = "../testdata/transNoAppr.json"
)

func TestMapProfileIDsToAccounts(t *testing.T) {
	acct1 := "test1"
	id1 := types.ID("1")
	acct2 := "test2"
	id2 := types.ID("2")
	testacctprofileids := []*types.AccountProfileID{
		{
			ID:          &id1,
			AccountName: &acct1,
		},
		{
			ID:          &id2,
			AccountName: &acct2,
		},
	}
	want := map[string]types.ID{
		acct1: id1,
		acct2: id2,
	}
	got := MapProfileIDsToAccounts(testacctprofileids)
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestAddProfileIDsToTrItems(t *testing.T) {
	testtrans := testdata.GetTestTransaction(transNoAppr)
	acct1 := "JacobWebb"
	id1 := types.ID("7")
	acct2 := "StateOfCalifornia"
	id2 := types.ID("27")
	acct3 := "GroceryStore"
	id3 := types.ID("11")
	testacctprofileids := map[string]types.ID{
		acct1: id1,
		acct2: id2,
		acct3: id3,
	}
	withprofileids := AddProfileIDsToTrItems(
		testtrans.TransactionItems,
		testacctprofileids,
	)
	// test for JacobWebb debitor profile id
	// in all transaction items
	for i := 0; i < len(testtrans.TransactionItems)-1; i++ {
		want := id1
		got := *withprofileids[i].DebitorProfileID
		if got != want {
			t.Errorf("got debitor profile id %v, want %v", got, want)
		}
	}
	// test for StateOfCalifornia creditor profile id
	// in first 3 transaction items
	for j := 0; j < 3; j++ {
		want := id2
		got := *withprofileids[j].CreditorProfileID
		if got != want {
			t.Errorf("got creditor profile id %v, want %v", got, want)
		}
	}
	// test for GroceryStore creditor profile id
	// in first 3 transaction items
	for k := 3; k < len(testtrans.TransactionItems)-1; k++ {
		want := id3
		got := *withprofileids[k].CreditorProfileID
		if got != want {
			t.Errorf("got creditor profile id %v, want %v", got, want)
		}
	}
}
