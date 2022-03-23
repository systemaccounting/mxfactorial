package tools

import (
	"io/ioutil"
	"testing"

	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func TestMarshalIntraTransaction(t *testing.T) {
	testacc := "testacc"
	testtr := GetTestTransaction(t, transNoAppr)
	testintratr := types.IntraTransaction{
		IntraEvent: types.IntraEvent{
			AuthAccount: testacc,
		},
		Transaction: &testtr,
	}
	got, err := MarshalIntraTransaction(&testintratr)
	if err != nil {
		t.Fatalf("marshal fail: %v", err)
	}
	f, err := ioutil.ReadFile("./testdata/intraTransaction.golden")
	if err != nil {
		t.Fatalf("readfile fail: %v", err)
	}
	want := string(f)
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestMarshalIntraTransactions(t *testing.T) {
	testacc := "testacc"
	testtr1 := GetTestTransaction(t, transNoAppr)
	testtr2 := GetTestTransaction(t, transNoAppr)
	testintratrs := types.IntraTransactions{
		IntraEvent: types.IntraEvent{
			AuthAccount: testacc,
		},
		Transaction: []*types.Transaction{&testtr1, &testtr2},
	}
	got, err := MarshalIntraTransactions(&testintratrs)
	if err != nil {
		t.Fatalf("marshal fail: %v", err)
	}
	f, err := ioutil.ReadFile("./testdata/intraTransactions.golden")
	if err != nil {
		t.Fatalf("readfile fail: %v", err)
	}
	want := string(f)
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}
