package tools

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func less(a, b string) bool { return a < b }

var isCustomIDUniqueTests = []struct {
	inputID   types.ID
	inputlist []interface{}
	want      bool
}{
	{
		inputID: types.ID("1"),
		inputlist: []interface{}{
			types.ID("2"),
			types.ID("3"),
		},
		want: true,
	},
	{
		inputID: types.ID("1"),
		inputlist: []interface{}{
			types.ID("1"),
			types.ID("3"),
		},
		want: false,
	},
}

func TestIsCustomIDUnique(t *testing.T) {
	for _, tc := range isCustomIDUniqueTests {
		got := IsCustomIDUnique(tc.inputID, tc.inputlist)
		if got != tc.want {
			t.Errorf("got %v, want %v", got, tc.want)
		}
	}
}

var isIfaceStringUniqueTests = []struct {
	inputval  string
	inputlist []interface{}
	want      bool
}{
	{
		inputval: "1",
		inputlist: []interface{}{
			"2",
			"3",
		},
		want: true,
	},
	{
		inputval: "1",
		inputlist: []interface{}{
			"1",
			"3",
		},
		want: false,
	},
}

func TestIsIfaceStringUnique(t *testing.T) {
	for _, tc := range isIfaceStringUniqueTests {
		got := IsIfaceStringUnique(tc.inputval, tc.inputlist)
		if got != tc.want {
			t.Errorf("got %v, want %v", got, tc.want)
		}
	}
}

var isStringUniqueTests = []struct {
	inputval  string
	inputlist []string
	want      bool
}{
	{
		inputval: "1",
		inputlist: []string{
			"2",
			"3",
		},
		want: true,
	},
	{
		inputval: "1",
		inputlist: []string{
			"1",
			"3",
		},
		want: false,
	},
}

func TestIsStringUnique(t *testing.T) {
	for _, tc := range isStringUniqueTests {
		got := IsStringUnique(tc.inputval, tc.inputlist)
		if got != tc.want {
			t.Errorf("got %v, want %v", got, tc.want)
		}
	}
}

func TestListUniqueAccountsFromTrItems(t *testing.T) {
	testtr := GetTestTransaction(t, transNoAppr)
	got := ListUniqueAccountsFromTrItems(testtr.TransactionItems)
	want := []interface{}{
		"JacobWebb", "StateOfCalifornia", "GroceryStore",
	}
	if !cmp.Equal(got, want, cmpopts.SortSlices(less)) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestListUniqueDebitorAccountsFromTrItems(t *testing.T) {
	testtr := GetTestTransaction(t, transNoAppr)
	got := ListUniqueDebitorAccountsFromTrItems(testtr.TransactionItems)
	want := []string{"JacobWebb"}
	if !cmp.Equal(got, want, cmpopts.SortSlices(less)) {
		t.Errorf("got %v, want %v", got, want)
	}
}
