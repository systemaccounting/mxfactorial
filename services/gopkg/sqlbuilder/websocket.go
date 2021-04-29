package sqlbuilder

import sqlb "github.com/huandu/go-sqlbuilder"

func InsertWebsocketConnectionSQL(
	connectionID,
	accountName string,
	epochCreatedAt int64,
) (string, []interface{}) {
	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("websocket")
	ib.Cols(
		"connection_id",
		"account_name",
		"epoch_created_at",
	)
	ib.Values(
		connectionID,
		accountName,
		epochCreatedAt,
	)
	return ib.Build()
}

func DeleteWebsocketConnectionSQL(connectionID string) (string, []interface{}) {
	db := sqlb.PostgreSQL.NewDeleteBuilder()
	db.DeleteFrom("websocket")
	db.Where(
		db.Equal("connection_id", connectionID),
	)
	return db.Build()
}

func SelectWebsocketByAccountsSQL(accounts []interface{}) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select("*")
	sb.From("websocket").
		Where(
			sb.In("account_name", accounts...),
		)
	return sb.Build()
}
