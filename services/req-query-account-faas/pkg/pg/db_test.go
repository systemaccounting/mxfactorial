package pg

import (
	"context"
	"encoding/json"
	"errors"
	"io/ioutil"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/jackc/pgx/v4"
	faas "github.com/systemaccouting/mxfactorial/services/req-query-account-faas"
	"github.com/systemaccouting/mxfactorial/services/req-query-account-faas/pkg/mock"
	"github.com/systemaccouting/mxfactorial/services/req-query-account-faas/pkg/util"
)

const testDataPath string = "../../testdata/short.json"

var (
	gotCTX    bool
	gotPGConn string
)

func reset() {
	gotCTX = true
	gotPGConn = ""
}

func TestConnect(t *testing.T) {
	wantCTX := false
	wantPGConn := "test"
	tstCTX := context.Background()
	tstConn := "test"
	tstPG := NewConnector(func(c context.Context, s string) (*pgx.Conn, error) {
		_, gotCTX = c.Deadline()
		gotPGConn = s
		return nil, nil
	})
	tstPG.Connect(tstCTX, tstConn)
	if gotCTX != wantCTX {
		t.Fatalf("got %t, want %t", gotCTX, wantCTX)
	}
	if gotPGConn != wantPGConn {
		t.Fatalf("got %q, want %q", gotPGConn, wantPGConn)
	}
	reset()
}

func TestConnectError(t *testing.T) {
	want := "test"
	tstCTX := context.Background()
	tstConn := "test"
	tstPG := NewConnector(func(c context.Context, s string) (*pgx.Conn, error) {
		return nil, errors.New("test")
	})
	_, err := tstPG.Connect(tstCTX, tstConn)
	got := err.Error()
	if got != want {
		t.Fatalf("got %q, want %q", got, want)
	}
}

func TestUnmarshal(t *testing.T) {

	ctrl := gomock.NewController(t)

	tstCTX := context.Background()
	tstRows := mock.NewMockRows(ctrl)
	tstTrans := faas.Transactions{}

	tstRows.EXPECT().
		Close().
		Times(1)

	tstRows.EXPECT().
		Next().
		Return(true).
		Return(false).
		Times(2)

	tstRows.EXPECT().
		Scan(
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
		).
		Times(2)

	tstRows.EXPECT().
		Err().
		Times(1)

	d := NewDB()
	d.Unmarshal(tstCTX, tstRows, &tstTrans)
}

func TestUnmarshalScanError(t *testing.T) {

	ctrl := gomock.NewController(t)

	tstCTX := context.Background()
	tstRows := mock.NewMockRows(ctrl)
	tstTrans := faas.Transactions{}

	tstRows.EXPECT().
		Close().
		Times(1)

	tstRows.EXPECT().
		Next().
		Return(true).
		Times(1)

	tstRows.EXPECT().
		Scan(
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
			gomock.Any(),
		).
		Return(errors.New("test")).
		Times(1)

	tstRows.EXPECT().
		Err().
		Times(1)

	d := NewDB()
	err := d.Unmarshal(tstCTX, tstRows, &tstTrans)

	want := "test"
	got := err.Error()
	if got != want {
		t.Fatalf("want %q, got %q", want, got)
	}
}

func TestUnmarshalRowsError(t *testing.T) {

	ctrl := gomock.NewController(t)

	tstCTX := context.Background()
	tstRows := mock.NewMockRows(ctrl)
	tstTrans := faas.Transactions{}

	tstRows.EXPECT().
		Close().
		Times(1)

	tstRows.EXPECT().
		Next().
		Times(1)

	tstRows.EXPECT().
		Err().
		Return(errors.New("test")).
		Times(1)

	d := NewDB()
	err := d.Unmarshal(tstCTX, tstRows, &tstTrans)

	want := "test"
	got := err.Error()
	if got != want {
		t.Fatalf("got %q, want %q", got, want)
	}
}

func TestUnmarshalReturn(t *testing.T) {

	ctrl := gomock.NewController(t)

	tstRows := mock.NewMockRows(ctrl)
	tstTrans := faas.Transactions{}

	f, err := ioutil.ReadFile(testDataPath)
	if err != nil {
		t.Fatal(err)
	}

	transactions := make([]*faas.Transaction, 0)
	err = json.Unmarshal(f, &transactions)
	if err != nil {
		t.Fatal(err)
	}

	// remove white space from test data
	want, err := util.RemoveWhiteSpace(f, json.Compact)
	if err != nil {
		t.Error(err)
	}

	tstCTX := context.Background()

	tstRows.EXPECT().
		Close().
		Times(1)

	tstRows.EXPECT().
		Next().
		Times(1)

	tstRows.EXPECT().
		Err().
		Times(1)

	d := NewDB()
	err = d.Unmarshal(tstCTX, tstRows, &tstTrans)
	got := tstTrans
	if err != nil {
		t.Fatalf("got %v, want %v", got, want)
	}
}
