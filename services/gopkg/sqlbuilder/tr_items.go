package sqlbuilder

import (
	sqlb "github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func nullSQLTime(t *string) interface{} {
	if *t == "" {
		return sqlb.Raw("NULL")
	}
	return sqlb.Raw(*t)
}

func InsertTrItemsSQL(trID int32, trItems []*types.TransactionItem) (string, []interface{}) {
	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("transaction_item")
	ib.Cols(
		"transaction_id",
		"item_id",
		"price",
		"quantity",
		"debitor_first",
		"rule_instance_id",
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
	for _, v := range trItems {
		ib.Values(
			trID,
			v.ItemID,
			v.Price,
			v.Quantity,
			v.DebitorFirst,
			v.RuleInstanceID,
			v.UnitOfMeasurement,
			v.UnitsMeasured,
			v.Debitor,
			v.Creditor,
			v.DebitorProfileID,
			v.CreditorProfileID,
			nullSQLTime(v.DebitorApprovalTime),
			nullSQLTime(v.CreditorApprovalTime),
			nullSQLTime(v.DebitorExpirationTime),
			nullSQLTime(v.CreditorExpirationTime),
		)
	}
	// format with ib arg only to avoid
	// can't scan into dest[0]: unable to assign to *int32
	ret := sqlb.Buildf("%v returning *", ib)
	return sqlb.WithFlavor(ret, sqlb.PostgreSQL).Build()
}

func SelectTrItemsByTrIDSQL(trID *int32) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select("*")
	sb.From("transaction_item").
		Where(
			sb.Equal("transaction_id", *trID),
		)
	return sb.Build()
}

func UpdateTrItemAfterApprovalSQL(colName string, trItemIDs []interface{}) (string, []interface{}) {
	ub := sqlb.PostgreSQL.NewUpdateBuilder()
	ub.Update("transaction_item").
		Set(
			ub.Assign(colName, "NOW()"),
		).
		Where(
			ub.In("id", trItemIDs...),
		)
	return ub.Build()
}
