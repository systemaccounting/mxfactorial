package sqlbuilder

import (
	"strings"

	gsqlb "github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

var buildFInsApproval string = "%v returning" + " " + strings.Join([]string{
	"id",
	"rule_instance_id",
	"transaction_id",
	"transaction_item_id",
	"account_name",
	"account_role",
	"device_id",
	"device_latlng",
	"approval_time",
	"expiration_time",
}, ", ")

func (b *BuildInsertSQL) InsertApprovalsSQL(sbc func() SelectSQLBuilder, alias string, approvals []*types.Approval) gsqlb.Builder {
	b.ib.InsertInto("approval")
	b.ib.Cols(
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

	sbTr := sbc()
	sbTr.Select("id")
	sbTr.From("insert_transaction")

	sbTrItem := sbc()
	sbTrItem.Select("id")
	sbTrItem.From(alias)

	for _, a := range approvals {
		b.ib.Values(
			a.RuleInstanceID,
			gsqlb.Buildf("(%v)", sbTr),
			gsqlb.Buildf("(%v)", sbTrItem),
			a.AccountName,
			a.AccountRole,
			a.DeviceID,
			a.DeviceLatlng,
			a.ApprovalTime,
			a.ExpirationTime,
		)
	}

	return gsqlb.WithFlavor(b.ib, gsqlb.PostgreSQL)
}

func (b *BuildSelectSQL) SelectApprovalsByTrIDSQL(trID *types.ID) (string, []interface{}) {
	sb := gsqlb.PostgreSQL.NewSelectBuilder()
	sb.Select(
		"id",
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
	sb.From("approval").
		Where(
			sb.Equal("transaction_id", *trID),
		)
	return sb.BuildWithFlavor(gsqlb.PostgreSQL)
}

func (b *BuildSelectSQL) SelectApprovalsByTrIDsSQL(trIDs []interface{}) (string, []interface{}) {
	sb := gsqlb.PostgreSQL.NewSelectBuilder()
	sb.Select(
		"id",
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
	sb.From("approval").
		Where(
			sb.In("transaction_id", trIDs...),
		)
	return sb.BuildWithFlavor(gsqlb.PostgreSQL)
}
