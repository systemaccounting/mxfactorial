package sqlbuilder

import (
	sqlb "github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func InsertTrItemSQL(trItem *types.TransactionItem) sqlb.Builder {
	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("transaction_item")
	ib.Cols(
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

	sbTr := sqlb.NewSelectBuilder()
	sbTr.Select("id")
	sbTr.From("insert_transaction")

	ib.Values(
		sqlb.Buildf("(%v)", sbTr),
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

	return sqlb.Buildf("%v returning id", ib)
}

func SelectTrItemsByTrIDSQL(trID *types.ID) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select("*")
	sb.From("transaction_item").
		Where(
			sb.Equal("transaction_id", *trID),
		)
	return sb.Build()
}

func SelectTrItemsByTrIDsSQL(trIDs []interface{}) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select("*")
	sb.From("transaction_item").
		Where(
			sb.In("transaction_id", trIDs...),
		)
	return sb.Build()
}
