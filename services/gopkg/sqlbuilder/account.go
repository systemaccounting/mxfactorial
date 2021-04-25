package sqlbuilder

import (
	sqlb "github.com/huandu/go-sqlbuilder"
)

func InsertAccountSQL(account string) (string, []interface{}) {
	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("account")
	ib.Cols("name")
	ib.Values(account)
	// format with ib arg only to avoid
	// can't scan into dest[0]: unable to assign to *int32
	ret := sqlb.Buildf("%v ON CONFLICT (name) DO NOTHING", ib)
	return sqlb.WithFlavor(ret, sqlb.PostgreSQL).Build()
}

func deleteOwnerAccountSQL(account string) (string, []interface{}) {
	db := sqlb.PostgreSQL.NewDeleteBuilder()
	db.DeleteFrom("account_owner")
	db.Where(
		db.Equal("owner_account", account),
	)
	return db.Build()
}

func deleteAccountSQL(account string) (string, []interface{}) {
	db := sqlb.PostgreSQL.NewDeleteBuilder()
	db.DeleteFrom("account")
	db.Where(
		db.Equal("name", account),
	)
	return db.Build()
}
