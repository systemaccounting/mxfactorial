package sqls

import (
	"fmt"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

func TestInit(t *testing.T) {
	testbuilder := SQLBuilder{}
	testbuilder.Init()

	// test select builder field
	if testbuilder.sb == nil {
		t.Errorf("got nil, want value")
	}
	got1 := fmt.Sprintf("%T", testbuilder.sb)
	want1 := "*sqlbuilder.SelectBuilder"
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	// test insert builder field
	if testbuilder.ib == nil {
		t.Errorf("got nil, want value")
	}
	got2 := fmt.Sprintf("%T", testbuilder.ib)
	want2 := "*sqlbuilder.InsertBuilder"
	if got2 != want2 {
		t.Errorf("got %v, want %v", got2, want2)
	}

	// test update builder field
	if testbuilder.ub == nil {
		t.Errorf("got nil, want value")
	}
	got3 := fmt.Sprintf("%T", testbuilder.ub)
	want3 := "*sqlbuilder.UpdateBuilder"
	if got3 != want3 {
		t.Errorf("got %v, want %v", got3, want3)
	}

	// test delete builder field
	if testbuilder.db == nil {
		t.Errorf("got nil, want value")
	}
	got4 := fmt.Sprintf("%T", testbuilder.db)
	want4 := "*sqlbuilder.DeleteBuilder"
	if got4 != want4 {
		t.Errorf("got %v, want %v", got4, want4)
	}
}

func TestStringToInterfaceSlice(t *testing.T) {
	teststringslice := []string{"test"}
	want := []interface{}{"test"}
	got := stringToInterfaceSlice(teststringslice)
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestIDtoInterfaceSlice(t *testing.T) {
	testid := types.ID("1")
	testids := types.IDs{&testid}
	want := []interface{}{&testid}
	got := IDtoInterfaceSlice(testids)
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}
