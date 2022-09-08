package sqls

import (
	"github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type ApprovalSQLs struct {
	SQLBuilder
}

func (a *ApprovalSQLs) InsertApprovalsSQL(
	approvals types.Approvals,
	transactionAuxStmt,
	trItemAuxStatement sqlbuilder.Builder,
) sqlbuilder.Builder {
	a.Init()
	a.ib.InsertInto("approval")
	a.ib.Cols(
		"rule_instance_id",
		"transaction_id",
		"transaction_item_id",
		"account_name",
		"account_role",
		"device_id",
		"device_latlng",
		"approval_time",
		"expiration_time",
	)

	for _, ap := range approvals {
		a.ib.Values(
			ap.RuleInstanceID,
			sqlbuilder.Buildf("(%v)", transactionAuxStmt),
			sqlbuilder.Buildf("(%v)", trItemAuxStatement),
			ap.AccountName,
			ap.AccountRole,
			ap.DeviceID,
			ap.DeviceLatlng,
			ap.ApprovalTime,
			ap.ExpirationTime,
		)
	}

	return sqlbuilder.WithFlavor(a.ib, sqlbuilder.PostgreSQL)
}

func (a *ApprovalSQLs) SelectApprovalsByTrIDSQL(trID types.ID) (string, []interface{}) {
	a.Init()
	a.sb.Select("*")
	a.sb.From("approval").
		Where(
			a.sb.Equal("transaction_id", trID),
		)
	return a.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (a *ApprovalSQLs) SelectApprovalsByTrIDsSQL(trIDs types.IDs) (string, []interface{}) {
	a.Init()

	// sqlbuilder wants interface slice
	iIDs := IDtoInterfaceSlice(trIDs)

	a.sb.Select("*")
	a.sb.From("approval").
		Where(
			a.sb.In("transaction_id", iIDs...),
		)

	return a.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func NewApprovalSQLs() *ApprovalSQLs {
	return new(ApprovalSQLs)
}
