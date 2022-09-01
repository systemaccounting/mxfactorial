package sqls

import "github.com/huandu/go-sqlbuilder"

type IAccountSQL interface {
	InsertAccountSQL(string) (string, []interface{})
	DeleteOwnerAccountSQL(string) (string, []interface{})
	DeleteAccountSQL(string) (string, []interface{})
}

type AccountSQL struct {
	SQLBuilder
}

func (a *AccountSQL) InsertAccountSQL(account string) (string, []interface{}) {
	a.Init()
	a.ib.InsertInto("account")
	a.ib.Cols("name")
	a.ib.Values(account)
	// format with ib arg only to avoid:
	// can't scan into dest[0]: unable to assign to *int32
	ret := sqlbuilder.Buildf("%v ON CONFLICT (name) DO NOTHING", a.ib)
	return sqlbuilder.WithFlavor(ret, sqlbuilder.PostgreSQL).Build()
}

func (a *AccountSQL) DeleteOwnerAccountSQL(account string) (string, []interface{}) {
	a.Init()
	a.db.DeleteFrom("account_owner")
	a.db.Where(
		a.db.Equal("owner_account", account),
	)
	return a.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (a *AccountSQL) DeleteAccountSQL(account string) (string, []interface{}) {
	a.Init()
	a.db.DeleteFrom("account")
	a.db.Where(
		a.db.Equal("name", account),
	)
	return a.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}
