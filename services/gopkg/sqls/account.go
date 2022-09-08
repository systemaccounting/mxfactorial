package sqls

import "github.com/huandu/go-sqlbuilder"

type AccountSQLs struct {
	SQLBuilder
}

func (a *AccountSQLs) InsertAccountSQL(account string) (string, []interface{}) {
	a.Init()
	a.ib.InsertInto("account")
	a.ib.Cols("name")
	a.ib.Values(account)
	// format with ib arg only to avoid:
	// can't scan into dest[0]: unable to assign to *int32
	ret := sqlbuilder.Buildf("%v ON CONFLICT (name) DO NOTHING", a.ib)
	return sqlbuilder.WithFlavor(ret, sqlbuilder.PostgreSQL).Build()
}

func (a *AccountSQLs) DeleteOwnerAccountSQL(account string) (string, []interface{}) {
	a.Init()
	a.db.DeleteFrom("account_owner")
	a.db.Where(
		a.db.Equal("owner_account", account),
	)
	return a.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (a *AccountSQLs) DeleteAccountSQL(account string) (string, []interface{}) {
	a.Init()
	a.db.DeleteFrom("account")
	a.db.Where(
		a.db.Equal("name", account),
	)
	return a.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func NewAccountSQLs() *AccountSQLs {
	return new(AccountSQLs)
}
