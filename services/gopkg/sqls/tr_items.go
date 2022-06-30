package sqls

import (
	"github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func (b *BuildInsertSQL) InsertTrItemSQL(
	sbc func() SelectSQLBuilder,
	trItem *types.TransactionItem) sqlbuilder.Builder {

	b.ib.InsertInto("transaction_item")
	b.ib.Cols(
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

	sbTr := sbc()
	sbTr.Select("id")
	sbTr.From("insert_transaction")

	b.ib.Values(
		sqlbuilder.Buildf("(%v)", sbTr),
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
		NullSQLFromStrPtr(trItem.DebitorApprovalTime),
		NullSQLFromStrPtr(trItem.CreditorApprovalTime),
		NullSQLFromStrPtr(trItem.DebitorExpirationTime),
		NullSQLFromStrPtr(trItem.CreditorExpirationTime),
	)
	retID := sqlbuilder.Buildf("%v returning id", b.ib)
	return sqlbuilder.WithFlavor(retID, sqlbuilder.PostgreSQL)
}

func (b *BuildSelectSQL) SelectTrItemsByTrIDSQL(trID *types.ID) (string, []interface{}) {
	b.sb.Select("*")
	b.sb.From("transaction_item").
		Where(
			b.sb.Equal("transaction_id", *trID),
		)
	return b.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildSelectSQL) SelectTrItemsByTrIDsSQL(trIDs []interface{}) (string, []interface{}) {
	b.sb.Select("*")
	b.sb.From("transaction_item").
		Where(
			b.sb.In("transaction_id", trIDs...),
		)
	return b.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}
