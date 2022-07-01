package tools

import (
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/google/go-cmp/cmp"
	mtools "github.com/systemaccounting/mxfactorial/services/gopkg/tools/mock_tools"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func TestNewPrintable(t *testing.T) {
	tr := new(types.Transaction)
	got := NewPrintable(tr)
	want := Printable{}
	if !cmp.Equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestPrintTransaction(t *testing.T) {
	ctrl := gomock.NewController(t)
	m := mtools.NewMockMarshaler(ctrl)
	m.EXPECT().MarshalIndent().Times(1)
	PrintTransaction(m)
}
