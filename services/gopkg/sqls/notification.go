package sqls

import (
	"github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func (b *BuildInsertSQL) InsertTransactionNotificationSQL(n []*types.TransactionNotification) (string, []interface{}) {
	b.ib.InsertInto("transaction_notification")
	b.ib.Cols(
		"transaction_id",
		"account_name",
		"account_role",
		"message",
	)
	for _, v := range n {
		b.ib.Values(
			*v.TransactionID,
			*v.AccountName,
			*v.AccountRole,
			*v.Message,
		)
	}
	retID := sqlbuilder.Buildf("%v returning id", b.ib)
	return sqlbuilder.WithFlavor(retID, sqlbuilder.PostgreSQL).Build()
}

func (b *BuildSelectSQL) SelectTransNotifsByIDsSQL(IDs []interface{}) (string, []interface{}) {
	b.sb.Select("*")
	b.sb.From("transaction_notification").
		Where(
			b.sb.In("id", IDs...),
		)
	return b.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildDeleteSQL) DeleteTransNotificationsByIDSQL(IDs []interface{}) (string, []interface{}) {
	b.db.DeleteFrom("transaction_notification")
	b.db.Where(
		b.db.In("id", IDs...),
	)
	return b.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildSelectSQL) SelectTransNotifsByAccountSQL(accountName string, limit int) (string, []interface{}) {
	b.sb.Select("*")
	b.sb.From("transaction_notification").
		Where(
			b.sb.Equal("account_name", accountName),
		)
	b.sb.OrderBy("id").Desc()
	b.sb.Limit(limit)
	return b.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildDeleteSQL) DeleteTransNotificationsByTransIDSQL(trID types.ID) (string, []interface{}) {
	b.db.DeleteFrom("transaction_notification")
	b.db.Where(
		b.db.Equal("transaction_id", trID),
	)
	return b.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}
