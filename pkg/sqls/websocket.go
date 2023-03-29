package sqls

import (
	"github.com/huandu/go-sqlbuilder"
)

type WebsocketSQLs struct {
	SQLBuilder
}

func (w *WebsocketSQLs) InsertWebsocketConnectionSQL(
	connectionID string,
	epochCreatedAt int64,
) (string, []interface{}) {
	w.Init()
	w.ib.InsertInto("websocket")
	w.ib.Cols(
		"connection_id",
		"epoch_created_at",
	)
	w.ib.Values(
		connectionID,
		epochCreatedAt,
	)
	return w.ib.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (w *WebsocketSQLs) DeleteWebsocketConnectionByConnectionIDSQL(connectionID string) (string, []interface{}) {
	w.Init()
	w.db.DeleteFrom("websocket")
	w.db.Where(
		w.db.Equal("connection_id", connectionID),
	)
	return w.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (w *WebsocketSQLs) DeleteWebsocketsByConnectionIDsSQL(connectionIDs []string) (string, []interface{}) {

	// sqlbuilder wants interface slice
	iConnectionIDs := stringToInterfaceSlice(connectionIDs)

	w.Init()
	w.db.DeleteFrom("websocket")
	w.db.Where(
		w.db.In("connection_id", iConnectionIDs...),
	)

	return w.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (w *WebsocketSQLs) SelectWebsocketsByAccountsSQL(accounts []string) (string, []interface{}) {

	// sqlbuilder wants interface slice
	iaccounts := stringToInterfaceSlice(accounts)

	w.Init()
	w.sb.Select("*")
	w.sb.From("websocket").
		Where(
			w.sb.In("account_name", iaccounts...),
		)
	return w.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (w *WebsocketSQLs) SelectWebsocketByConnectionIDSQL(connID string) (string, []interface{}) {
	w.Init()
	w.sb.Select("*")
	w.sb.From("websocket").
		Where(
			w.sb.Equal("connection_id", connID),
		)
	return w.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (w *WebsocketSQLs) UpdateWebsocketByConnIDSQL(accountName, connectionID string) (string, []interface{}) {
	w.Init()
	w.ub.Update("websocket").
		Set(
			w.ub.Assign("account_name", accountName),
		).
		Where(
			w.ub.Equal("connection_id", connectionID),
		)
	return w.ub.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func NewWebsocketSQLs() *WebsocketSQLs {
	return new(WebsocketSQLs)
}
