package sqls

import (
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestInsertWebsocketConnectionSQL(t *testing.T) {
	testconnectionid := "L0SM9cOFvHcCIhw="
	testepochcreatedat := int64(1547557733712)
	testbuilder := WebsocketSQLs{}
	want1 := "INSERT INTO websocket (connection_id, epoch_created_at) VALUES ($1, $2)"
	want2 := []interface{}{
		testconnectionid,
		testepochcreatedat,
	}
	got1, got2 := testbuilder.InsertWebsocketConnectionSQL(
		testconnectionid,
		testepochcreatedat,
	)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestDeleteWebsocketConnectionByConnectionIDSQL(t *testing.T) {
	testconnectionid := "L0SM9cOFvHcCIhw="
	testbuilder := WebsocketSQLs{}
	want1 := "DELETE FROM websocket WHERE connection_id = $1"
	want2 := []interface{}{
		testconnectionid,
	}
	got1, got2 := testbuilder.DeleteWebsocketConnectionByConnectionIDSQL(
		testconnectionid,
	)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestDeleteWebsocketsByConnectionIDsSQL(t *testing.T) {
	testconnectionid1 := "L0SM9cOFvHcCIhw="
	testconnectionid2 := "L0SM9cOFvHcCIhx="
	testconnectionids := []string{testconnectionid1, testconnectionid2}
	testbuilder := WebsocketSQLs{}
	want1 := "DELETE FROM websocket WHERE connection_id IN ($1, $2)"
	want2 := []interface{}{testconnectionid1, testconnectionid2}
	got1, got2 := testbuilder.DeleteWebsocketsByConnectionIDsSQL(testconnectionids)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestSelectWebsocketsByAccountsSQL(t *testing.T) {
	testacctname1 := "testacctname1"
	testacctname2 := "testacctname2"
	testacctnames := []string{testacctname1, testacctname2}
	testbuilder := WebsocketSQLs{}
	want1 := "SELECT * FROM websocket WHERE account_name IN ($1, $2)"
	want2 := []interface{}{testacctname1, testacctname2}
	got1, got2 := testbuilder.SelectWebsocketsByAccountsSQL(testacctnames)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestSelectWebsocketByConnectionIDSQL(t *testing.T) {
	testconnectionid := "L0SM9cOFvHcCIhw="
	testbuilder := WebsocketSQLs{}
	want1 := "SELECT * FROM websocket WHERE connection_id = $1"
	want2 := []interface{}{testconnectionid}
	got1, got2 := testbuilder.SelectWebsocketByConnectionIDSQL(testconnectionid)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestUpdateWebsocketByConnIDSQL(t *testing.T) {
	testacctname := "testacctname"
	testconnectionid := "L0SM9cOFvHcCIhw="
	testbuilder := WebsocketSQLs{}
	want1 := "UPDATE websocket SET account_name = $1 WHERE connection_id = $2"
	want2 := []interface{}{testacctname, testconnectionid}
	got1, got2 := testbuilder.UpdateWebsocketByConnIDSQL(testacctname, testconnectionid)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}
