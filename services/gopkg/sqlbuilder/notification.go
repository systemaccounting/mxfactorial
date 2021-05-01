package sqlbuilder

import (
	sqlb "github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func InsertTransactionNotificationSQL(n []*types.TransactionNotification) (string, []interface{}) {
	ib := sqlb.NewInsertBuilder()
	ib.InsertInto("transaction_notification")
	ib.Cols(
		"transaction_id",
		"account_name",
		"account_role",
		"message",
	)
	for _, v := range n {
		ib.Values(
			*v.TransactionID,
			*v.AccountName,
			*v.AccountRole,
			*v.Message,
		)
	}
	retID := sqlb.Buildf("%v returning id", ib)
	return sqlb.WithFlavor(retID, sqlb.PostgreSQL).Build()
}

func SelectTransNotifsByIDsSQL(IDs []interface{}) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select("*")
	sb.From("transaction_notification").
		Where(
			sb.In("id", IDs...),
		)
	return sb.Build()
}

func DeleteTransNotificationsByIDSQL(IDs []interface{}) (string, []interface{}) {
	db := sqlb.PostgreSQL.NewDeleteBuilder()
	db.DeleteFrom("transaction_notification")
	db.Where(
		db.In("id", IDs...),
	)
	return db.Build()
}

func SelectTransNotifsByAccountSQL(accountName string, limit int) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select("*")
	sb.From("transaction_notification").
		Where(
			sb.Equal("account_name", accountName),
		)
	sb.OrderBy("id").Desc()
	sb.Limit(limit)
	return sb.Build()
}
