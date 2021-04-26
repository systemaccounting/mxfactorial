package sqlbuilder

import sqlb "github.com/huandu/go-sqlbuilder"

func InsertWebsocketConnectionSQL(
	connectionID,
	account string,
	epochCreatedAt int64,
) (string, []interface{}) {
	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("websocket")
	ib.Cols(
		"connection_id",
		"account",
		"epoch_created_at",
	)
	ib.Values(
		connectionID,
		account,
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
