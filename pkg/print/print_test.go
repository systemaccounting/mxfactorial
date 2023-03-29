package print

import (
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/google/go-cmp/cmp"
	mprint "github.com/systemaccounting/mxfactorial/pkg/print/mock_print"
	"github.com/systemaccounting/mxfactorial/pkg/types"
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
	m := mprint.NewMockMarshaler(ctrl)
	m.EXPECT().MarshalIndent().Times(1)
	PrintTransaction(m)
}
