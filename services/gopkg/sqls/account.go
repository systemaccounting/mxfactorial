package sqls

import (
	"github.com/huandu/go-sqlbuilder"
)

func (b *BuildInsertSQL) InsertAccountSQL(account string) (string, []interface{}) {
	b.ib.InsertInto("account")
	b.ib.Cols("name")
	b.ib.Values(account)
	// format with ib arg only to avoid
	// can't scan into dest[0]: unable to assign to *int32
	ret := sqlbuilder.Buildf("%v ON CONFLICT (name) DO NOTHING", b.ib)
	return sqlbuilder.WithFlavor(ret, sqlbuilder.PostgreSQL).Build()
}

func (b *BuildDeleteSQL) DeleteOwnerAccountSQL(account string) (string, []interface{}) {
	b.db.DeleteFrom("account_owner")
	b.db.Where(
		b.db.Equal("owner_account", account),
	)
	return b.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildDeleteSQL) DeleteAccountSQL(account string) (string, []interface{}) {
	b.db.DeleteFrom("account")
	b.db.Where(
		b.db.Equal("name", account),
	)
	return b.db.BuildWithFlavor(sqlbuilder.PostgreSQL)
}
