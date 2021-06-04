package sqlbuilder

import (
	sqlb "github.com/huandu/go-sqlbuilder"
)

func InsertWebsocketConnectionSQL(
	connectionID string,
	epochCreatedAt int64,
) (string, []interface{}) {
	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("websocket")
	ib.Cols(
		"connection_id",
		"epoch_created_at",
	)
	ib.Values(
		connectionID,
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

func DeleteWebsocketsByConnectionIDSQL(IDs []interface{}) (string, []interface{}) {
	db := sqlb.PostgreSQL.NewDeleteBuilder()
	db.DeleteFrom("websocket")
	db.Where(
		db.In("connection_id", IDs...),
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

func SelectWebsocketByConnectionIDSQL(connID string) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select("*")
	sb.From("websocket").
		Where(
			sb.Equal("connection_id", connID),
		)
	return sb.Build()
}

func UpdateWebsocketByConnIDSQL(accountName, connectionID string) (string, []interface{}) {
	ub := sqlb.PostgreSQL.NewUpdateBuilder()
	ub.Update("websocket").
		Set(
			ub.Assign("account_name", accountName),
		).
		Where(
			ub.Equal("connection_id", connectionID),
		)
	return ub.Build()
}
