package sqlbuilder

import (
	"strings"

	sqlb "github.com/huandu/go-sqlbuilder"
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

func InsertApprovalsSQL(alias string, approvals []*types.Approval) sqlb.Builder {
	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("approval")
	ib.Cols(
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

	sbTr := sqlb.NewSelectBuilder()
	sbTr.Select("id")
	sbTr.From("insert_transaction")

	sbTrItem := sqlb.NewSelectBuilder()
	sbTrItem.Select("id")
	sbTrItem.From(alias)

	for _, a := range approvals {
		ib.Values(
			a.RuleInstanceID,
			sqlb.Buildf("(%v)", sbTr),
			sqlb.Buildf("(%v)", sbTrItem),
			a.AccountName,
			a.AccountRole,
			a.DeviceID,
			a.DeviceLatlng,
			a.ApprovalTime,
			a.ExpirationTime,
		)
	}

	return ib
}

func SelectApprovalsByTrIDSQL(trID *types.ID) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
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
	return sb.Build()
}
