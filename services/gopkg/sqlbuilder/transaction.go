package sqlbuilder

import (
	sqlb "github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func InsertTransactionSQL(
	t types.Transaction,
) (string, []interface{}) {
	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("transaction")
	ib.Cols(
		"rule_instance_id",
		"author",
		"author_device_id",
		"author_device_latlng",
		"author_role",
		"equilibrium_time",
		"sum_value",
	)
	ib.Values(
		t.RuleInstanceID,
		t.Author,
		t.AuthorDeviceID,
		t.AuthorDeviceLatlng,
		t.AuthorRole,
		t.EquilibriumTime,
		t.SumValue,
	)
	// format with ib arg only to avoid
	// can't scan into dest[0]: unable to assign to *int32
	retID := sqlb.Buildf("%v returning *", ib)
	return sqlb.WithFlavor(retID, sqlb.PostgreSQL).Build()
}

func SelectTransactionByIDSQL(trID *types.ID) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select("*")
	sb.From("transaction").
		Where(
			sb.Equal("id", *trID),
		)
	return sb.Build()
}

func SelectTransactionsByIDsSQL(IDs []interface{}) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select("*")
	sb.From("transaction").
		Where(
			sb.In("id", IDs...),
		)
	return sb.Build()
}

func UpdateTransactionByIDSQL(trID *types.ID, equilTime string) (string, []interface{}) {
	ub := sqlb.PostgreSQL.NewUpdateBuilder()
	ub.Update("transaction").
		Set(
			ub.Assign("equilibrium_time", equilTime),
		).
		Where(
			ub.Equal("id", *trID),
		)
	// format with ub arg only to avoid
	// can't scan into dest[0]: unable to assign to *int32
	retID := sqlb.Buildf("%v returning *", ub)
	return sqlb.WithFlavor(retID, sqlb.PostgreSQL).Build()
}
