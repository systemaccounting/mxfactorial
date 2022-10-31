package sqls

import (
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestInsertAccountSQL(t *testing.T) {
	testsqlb := AccountSQLs{}
	testaccount := "test"
	got1, got2 := testsqlb.InsertAccountSQL(testaccount)
	want1 := "INSERT INTO account (name) VALUES ($1) ON CONFLICT (name) DO NOTHING"
	want2 := []interface{}{testaccount}
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestDeleteOwnerAccountSQL(t *testing.T) {
	testsqlb := AccountSQLs{}
	testaccount := "test"
	got1, got2 := testsqlb.DeleteOwnerAccountSQL(testaccount)
	want1 := "DELETE FROM account_owner WHERE owner_account = $1"
	want2 := []interface{}{testaccount}
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestDeleteAccountSQL(t *testing.T) {
	testsqlb := AccountSQLs{}
	testaccount := "test"
	got1, got2 := testsqlb.DeleteAccountSQL(testaccount)
	want1 := "DELETE FROM account WHERE name = $1"
	want2 := []interface{}{testaccount}
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}
