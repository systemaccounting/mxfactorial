package sqlbuilder

import (
	"strings"

	sqlb "github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

var buildFInsApprover string = "%v returning" + " " + strings.Join([]string{
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

func InsertApproversSQL(trID, trItID types.ID, approvers []*types.Approver) (string, []interface{}) {
	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("approver")
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
	for _, v := range approvers {
		// v.RejectionTime excluded
		ib.Values(
			v.RuleInstanceID,
			trID,
			trItID,
			v.AccountName,
			v.AccountRole,
			v.DeviceID,
			v.DeviceLatlng,
			v.ApprovalTime,
			v.ExpirationTime,
		)
	}
	ret := sqlb.Buildf(buildFInsApprover, ib)
	return sqlb.WithFlavor(ret, sqlb.PostgreSQL).Build()
}

func UpdateApproversSQL(account, role *string, trID *types.ID) (string, []interface{}) {
	ub := sqlb.PostgreSQL.NewUpdateBuilder()
	ub.Update("approver").
		Set(
			ub.Assign("approval_time", "NOW()"),
		).
		Where(
			ub.Equal("account_name", *account),
			ub.Equal("account_role", *role),
			ub.Equal("transaction_id", *trID),
		)
	ret := sqlb.Buildf(buildFInsApprover, ub)
	return sqlb.WithFlavor(ret, sqlb.PostgreSQL).Build()
}

func SelectApproversByTrItemIDsSQL(
	role *string,
	trItemIDs []interface{},
) (string, []interface{}) {
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
	sb.From("approver").
		Where(
			sb.Equal("account_role", *role),
			sb.In("transaction_item_id", trItemIDs...),
		)
	return sb.Build()
}

func SelectApproversByTrIDSQL(
	account string,
	trID *types.ID,
) (string, []interface{}) {
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
	sb.From("approver").
		Where(
			sb.Equal("transaction_id", *trID),
		)
	return sb.Build()
}
