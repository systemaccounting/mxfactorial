// +build !integration

package main

import (
	"context"
	"encoding/json"
	"errors"
	"io/ioutil"
	"testing"

	"github.com/golang/mock/gomock"
	faas "github.com/systemaccounting/mxfactorial/services/trans-query-account-faas"
	"github.com/systemaccounting/mxfactorial/services/trans-query-account-faas/pkg/mock"
	"github.com/systemaccounting/mxfactorial/services/trans-query-account-faas/pkg/utils"
)

const testDataPath string = "../testdata/short.json"

func TestLambdaFn(t *testing.T) {
	ctrl := gomock.NewController(t)

	tstCTX := context.Background()
	tstEvent := faas.Event{
		TransactionID:        "tstID",
		Account:              "tstAccount",
		GraphQLRequestSender: "tstSender",
	}
	tstConn := mock.NewMockConnector(ctrl)
	tstDB := mock.NewMockSQLDB(ctrl)
	tstRows := mock.NewMockRows(ctrl)
	tstTrans := faas.Transactions{&faas.Transaction{}}

	f, err := ioutil.ReadFile(testDataPath)
	if err != nil {
		t.Fatal(err)
	}

	// remove white space from test data
	want, err := utils.RemoveWhiteSpace(f, json.Compact)
	if err != nil {
		t.Error(err)
	}

	transactions := make(faas.Transactions, 0)
	err = json.Unmarshal(f, &transactions)
	if err != nil {
		t.Fatal(err)
	}

	tstConn.EXPECT().
		Connect(tstCTX, pgConn).
		Return(tstDB, nil).
		Times(1)

	tstDB.EXPECT().
		Query(tstCTX, query, tstEvent.Account).
		Return(tstRows, nil).
		Times(1)

	tstDB.EXPECT().
		Unmarshal(tstCTX, tstRows, &tstTrans).
		Do(func(_ context.Context, _ *mock.MockRows, _ *faas.Transactions) {
			tstTrans = transactions
		}).
		Return(nil).
		Times(1)

	// test return value
	got, err := lambdaFn(tstCTX, tstEvent, tstConn, &tstTrans)
	if err != nil {
		t.Error(err)
	}

	if got != want {
		t.Fatalf("got %q, want %q", got, want)
	}
}

func TestLambdaFnConnectError(t *testing.T) {
	ctrl := gomock.NewController(t)

	tstCTX := context.Background()
	tstEvent := faas.Event{
		TransactionID:        "tstID",
		Account:              "tstAccount",
		GraphQLRequestSender: "tstSender",
	}
	tstConn := mock.NewMockConnector(ctrl)
	tstDB := mock.NewMockSQLDB(ctrl)
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

	tstConn.EXPECT().
		Connect(tstCTX, pgConn).
		Return(tstDB, errors.New("test")).
		Times(1)

	// test return value
	_, err = lambdaFn(tstCTX, tstEvent, tstConn, &tstTrans)
	got := err.Error()

	want := "test"
	if got != want {
		t.Fatalf("got %q, want %q", got, want)
	}
}

func TestLambdaFnQueryError(t *testing.T) {
	ctrl := gomock.NewController(t)

	tstCTX := context.Background()
	tstEvent := faas.Event{
		TransactionID:        "tstID",
		Account:              "tstAccount",
		GraphQLRequestSender: "tstSender",
	}
	tstConn := mock.NewMockConnector(ctrl)
	tstDB := mock.NewMockSQLDB(ctrl)
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

	tstConn.EXPECT().
		Connect(tstCTX, pgConn).
		Return(tstDB, nil).
		Times(1)

	tstDB.EXPECT().
		Query(tstCTX, query, tstEvent.Account).
		Return(tstRows, errors.New("test")).
		Times(1)

	// test return value
	_, err = lambdaFn(tstCTX, tstEvent, tstConn, &tstTrans)
	got := err.Error()

	want := "test"
	if got != want {
		t.Fatalf("got %q, want %q", got, want)
	}
}

func TestLambdaFnUnmarshalError(t *testing.T) {
	ctrl := gomock.NewController(t)

	tstCTX := context.Background()
	tstEvent := faas.Event{
		TransactionID:        "tstID",
		Account:              "tstAccount",
		GraphQLRequestSender: "tstSender",
	}
	tstConn := mock.NewMockConnector(ctrl)
	tstDB := mock.NewMockSQLDB(ctrl)
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

	tstConn.EXPECT().
		Connect(tstCTX, pgConn).
		Return(tstDB, nil).
		Times(1)

	tstDB.EXPECT().
		Query(tstCTX, query, tstEvent.Account).
		Return(tstRows, nil).
		Times(1)

	tstDB.EXPECT().
		Unmarshal(tstCTX, tstRows, &tstTrans).
		Return(errors.New("test")).
		Times(1)

	// test return value
	_, err = lambdaFn(tstCTX, tstEvent, tstConn, &tstTrans)
	got := err.Error()

	want := "test"
	if got != want {
		t.Fatalf("got %q, want %q", got, want)
	}
}
