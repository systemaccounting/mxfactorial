package sqls

import "github.com/huandu/go-sqlbuilder"

type IWithSQLs interface {
	SelectIDFromInsertTransactionCTEAuxStmt() sqlbuilder.Builder
	SelectIDFromTrItemAliasCTEAuxStmt(string) sqlbuilder.Builder
}

type WithSQLs struct {
	SQLBuilder
}

// passed as arg to InsertApprovalsSQL to
// reference approval relationship with a transaction
func (w *WithSQLs) SelectIDFromInsertTransactionCTEAuxStmt() sqlbuilder.Builder {
	w.Init()
	w.sb.Select("id")
	w.sb.From("insert_transaction")
	return sqlbuilder.WithFlavor(w.sb, sqlbuilder.PostgreSQL)
}

// passed as arg to InsertApprovalsSQL to
// reference approval relationship with a transaction_item
func (w *WithSQLs) SelectIDFromTrItemAliasCTEAuxStmt(alias string) sqlbuilder.Builder {
	w.Init()
	w.sb.Select("id")
	w.sb.From(alias)
	return sqlbuilder.WithFlavor(w.sb, sqlbuilder.PostgreSQL)
}
