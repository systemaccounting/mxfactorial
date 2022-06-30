package sqls

import "github.com/huandu/go-sqlbuilder"

func (b *BuildInsertSQL) InsertWebsocketConnectionSQL(
	connectionID string,
	epochCreatedAt int64,
) (string, []interface{}) {
	b.ib.InsertInto("websocket")
	b.ib.Cols(
		"connection_id",
		"epoch_created_at",
	)
	b.ib.Values(
		connectionID,
		epochCreatedAt,
	)
	return b.ib.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildDeleteSQL) DeleteWebsocketConnectionSQL(connectionID string) (string, []interface{}) {
	b.db.DeleteFrom("websocket")
	b.db.Where(
		b.db.Equal("connection_id", connectionID),
	)
	return b.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildDeleteSQL) DeleteWebsocketsByConnectionIDSQL(IDs []interface{}) (string, []interface{}) {
	b.db.DeleteFrom("websocket")
	b.db.Where(
		b.db.In("connection_id", IDs...),
	)
	return b.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildSelectSQL) SelectWebsocketByAccountsSQL(accounts []interface{}) (string, []interface{}) {
	b.sb.Select("*")
	b.sb.From("websocket").
		Where(
			b.sb.In("account_name", accounts...),
		)
	return b.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildSelectSQL) SelectWebsocketByConnectionIDSQL(connID string) (string, []interface{}) {
	b.sb.Select("*")
	b.sb.From("websocket").
		Where(
			b.sb.Equal("connection_id", connID),
		)
	return b.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildUpdateSQL) UpdateWebsocketByConnIDSQL(accountName, connectionID string) (string, []interface{}) {
	b.ub.Update("websocket").
		Set(
			b.ub.Assign("account_name", accountName),
		).
		Where(
			b.ub.Equal("connection_id", connectionID),
		)
	return b.ub.BuildWithFlavor(sqlbuilder.PostgreSQL)
}
