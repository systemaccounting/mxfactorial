package tools

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func TestCreateIntraTransaction(t *testing.T) {
	testacc := "testacc"
	testtr := GetTestTransaction(t, transNoAppr)
	got := CreateIntraTransaction(testacc, &testtr)
	want := types.IntraTransaction{
		IntraEvent: types.IntraEvent{
			AuthAccount: testacc,
		},
		Transaction: &testtr,
	}
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestCreateIntraTransactions(t *testing.T) {
	testacc := "testacc"
	testtr1 := GetTestTransaction(t, transNoAppr)
	testtr2 := GetTestTransaction(t, transNoAppr)
	testtrs := []*types.Transaction{
		&testtr1,
		&testtr2,
	}
	got := CreateIntraTransactions(
		testacc,
		testtrs,
	)
	want := types.IntraTransactions{
		IntraEvent: types.IntraEvent{
			AuthAccount: testacc,
		},
		Transaction: testtrs,
	}
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}
