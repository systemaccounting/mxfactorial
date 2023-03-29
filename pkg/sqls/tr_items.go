package sqls

import (
	"github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

type TransactionItemSQLs struct {
	SQLBuilder
}

func (t *TransactionItemSQLs) InsertTrItemSQL(
	trItem *types.TransactionItem,
	transactionAuxStmt sqlbuilder.Builder,
) sqlbuilder.Builder {
	t.Init()
	t.ib.InsertInto("transaction_item")
	t.ib.Cols(
		"transaction_id",
		"item_id",
		"price",
		"quantity",
		"debitor_first",
		"rule_instance_id",
		"rule_exec_ids",
		"unit_of_measurement",
		"units_measured",
		"debitor",
		"creditor",
		"debitor_profile_id",
		"creditor_profile_id",
		"debitor_approval_time",
		"creditor_approval_time",
		"debitor_expiration_time",
		"creditor_expiration_time",
	)

	t.ib.Values(
		sqlbuilder.Buildf("(%v)", transactionAuxStmt),
		trItem.ItemID,
		trItem.Price,
		trItem.Quantity,
		trItem.DebitorFirst,
		trItem.RuleInstanceID,
		trItem.RuleExecIDs,
		trItem.UnitOfMeasurement,
		trItem.UnitsMeasured,
		trItem.Debitor,
		trItem.Creditor,
		trItem.DebitorProfileID,
		trItem.CreditorProfileID,
		trItem.DebitorApprovalTime,
		trItem.CreditorApprovalTime,
		trItem.DebitorExpirationTime,
		trItem.CreditorExpirationTime,
	)

	retID := sqlbuilder.Buildf("%v returning id", t.ib)
	return sqlbuilder.WithFlavor(retID, sqlbuilder.PostgreSQL)
}

func (t *TransactionItemSQLs) SelectTrItemsByTrIDSQL(trID types.ID) (string, []interface{}) {
	t.Init()
	t.sb.Select("*")
	t.sb.From("transaction_item").
		Where(
			t.sb.Equal("transaction_id", trID),
		)
	return t.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (t *TransactionItemSQLs) SelectTrItemsByTrIDsSQL(trIDs types.IDs) (string, []interface{}) {
	t.Init()

	// sql builder wants interface slice
	iIDs := IDtoInterfaceSlice(trIDs)

	t.sb.Select("*")
	t.sb.From("transaction_item").
		Where(
			t.sb.In("transaction_id", iIDs...),
		)

	return t.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func NewTransactionItemSQLs() *TransactionItemSQLs {
	return new(TransactionItemSQLs)
}
