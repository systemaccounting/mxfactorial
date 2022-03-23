package tools

import (
	"encoding/json"
	"io/ioutil"
	"testing"

	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

const (
	transNoAppr    string = "../testdata/transNoAppr.json"
	allRuleInstIDs string = "../testdata/allRuleInstanceIDs.json"
)

func GetTestTransaction(t *testing.T, testPath string) types.Transaction {
	f, err := ioutil.ReadFile(testPath)
	if err != nil {
		t.Fatalf("read fail %s: %v", testPath, err)
	}
	var i types.IntraTransaction
	if err := json.Unmarshal(f, &i); err != nil {
		t.Fatalf("unmarshal fail: %v", err)
	}
	return *i.Transaction
}

func TestGetAuthorRoleCreditor(t *testing.T) {
	testTransaction := GetTestTransaction(t, transNoAppr)
	testAuthor := "GroceryStore"
	got, err := GetAuthorRole(&testTransaction, testAuthor)
	if err != nil {
		t.Fatal(err)
	}
	want := types.CREDITOR
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestGetAuthorRoleErrAccountNotAvailable(t *testing.T) {
	testTransaction := GetTestTransaction(t, transNoAppr)
	testAuthor := "DoesntExist"
	_, got := GetAuthorRole(&testTransaction, testAuthor)
	want := "author not in items"
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestGetAuthorRoleErrRuleInstIDs(t *testing.T) {
	testTransaction := GetTestTransaction(t, allRuleInstIDs)
	testTransaction.TransactionItems = []*types.TransactionItem{}
	testAuthor := "GroceryStore"
	_, got := GetAuthorRole(&testTransaction, testAuthor)
	want := "author not in items"
	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}
