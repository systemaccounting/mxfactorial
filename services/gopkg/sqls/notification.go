package sqls

import (
	"github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type INotificationSQLs interface {
	InsertTransactionNotificationsSQL(types.TransactionNotifications) (string, []interface{})
	SelectTransNotifsByIDsSQL(types.IDs) (string, []interface{})
	DeleteTransNotificationsByIDsSQL(types.IDs) (string, []interface{})
	SelectTransNotifsByAccountSQL(string, int) (string, []interface{})
	DeleteTransNotificationsByTransIDSQL(types.ID) (string, []interface{})
}

type NotificationSQLs struct {
	SQLBuilder
}

func (n *NotificationSQLs) InsertTransactionNotificationsSQL(tns types.TransactionNotifications) (string, []interface{}) {
	n.Init()
	n.ib.InsertInto("transaction_notification")
	n.ib.Cols(
		"transaction_id",
		"account_name",
		"account_role",
		"message",
	)
	for _, v := range tns {
		n.ib.Values(
			*v.TransactionID,
			*v.AccountName,
			*v.AccountRole,
			*v.Message,
		)
	}
	retID := sqlbuilder.Buildf("%v returning id", n.ib)
	return sqlbuilder.WithFlavor(retID, sqlbuilder.PostgreSQL).Build()
}

func (n *NotificationSQLs) SelectTransNotifsByIDsSQL(notifIDs types.IDs) (string, []interface{}) {
	n.Init()

	iNotifIDs := IDtoInterfaceSlice(notifIDs)

	n.sb.Select("*")
	n.sb.From("transaction_notification").
		Where(
			n.sb.In("id", iNotifIDs...),
		)

	return n.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (n *NotificationSQLs) DeleteTransNotificationsByIDsSQL(notifIDs types.IDs) (string, []interface{}) {
	n.Init()

	iNotifIDs := IDtoInterfaceSlice(notifIDs)

	n.db.DeleteFrom("transaction_notification")
	n.db.Where(
		n.db.In("id", iNotifIDs...),
	)

	return n.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (n *NotificationSQLs) SelectTransNotifsByAccountSQL(accountName string, limit int) (string, []interface{}) {
	n.Init()
	n.sb.Select("*")
	n.sb.From("transaction_notification").
		Where(
			n.sb.Equal("account_name", accountName),
		)
	n.sb.OrderBy("id").Desc()
	n.sb.Limit(limit)
	return n.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (n *NotificationSQLs) DeleteTransNotificationsByTransIDSQL(trID types.ID) (string, []interface{}) {
	n.Init()
	n.db.DeleteFrom("transaction_notification")
	n.db.Where(
		n.db.Equal("transaction_id", trID),
	)
	return n.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}
