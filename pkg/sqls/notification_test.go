package sqls

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/jackc/pgtype"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

func TestInsertTransactionNotificationsSQL(t *testing.T) {
	testbuilder := NotificationSQLs{}
	testid1 := types.ID("testid1")
	testacct1 := "testacct1"
	testrole1 := types.DB
	testmsg1 := pgtype.JSONB{}

	testnotifications := types.TransactionNotifications{
		&types.TransactionNotification{
			TransactionID: &testid1,
			AccountName:   &testacct1,
			AccountRole:   &testrole1,
			Message:       &testmsg1,
		},
	}

	got1, got2 := testbuilder.InsertTransactionNotificationsSQL(testnotifications)
	want1 := "INSERT INTO transaction_notification (transaction_id, account_name, account_role, message) VALUES ($1, $2, $3, $4) returning id"
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	want2 := []interface{}{testid1, testacct1, testrole1, testmsg1}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestSelectTransNotifsByIDsSQL(t *testing.T) {
	testid1 := types.ID("testid1")
	testids := types.IDs{&testid1}
	testbuilder := NotificationSQLs{}
	want1 := "SELECT * FROM transaction_notification WHERE id IN ($1)"
	want2 := []interface{}{&testid1}
	got1, got2 := testbuilder.SelectTransNotifsByIDsSQL(testids)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestDeleteTransNotificationsByIDsSQL(t *testing.T) {
	testid1 := types.ID("testid1")
	testids := types.IDs{&testid1}
	testbuilder := NotificationSQLs{}
	want1 := "DELETE FROM transaction_notification WHERE id IN ($1)"
	want2 := []interface{}{&testid1}
	got1, got2 := testbuilder.DeleteTransNotificationsByIDsSQL(testids)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestSelectTransNotifsByAccountSQL(t *testing.T) {
	testacct := "testacct"
	testlimit := 1
	testbuilder := NotificationSQLs{}
	want1 := "SELECT * FROM transaction_notification WHERE account_name = $1 ORDER BY id DESC LIMIT 1"
	want2 := []interface{}{testacct}
	got1, got2 := testbuilder.SelectTransNotifsByAccountSQL(testacct, testlimit)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestDeleteTransNotificationsByTransIDSQL(t *testing.T) {
	testid1 := types.ID("testid1")
	testbuilder := NotificationSQLs{}
	want1 := "DELETE FROM transaction_notification WHERE transaction_id = $1"
	want2 := []interface{}{testid1}
	got1, got2 := testbuilder.DeleteTransNotificationsByTransIDSQL(testid1)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}
