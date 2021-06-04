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

func InsertApprovalsSQL(trID, trItID types.ID, approvals []*types.Approval) (string, []interface{}) {
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
	for _, v := range approvals {
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
	ret := sqlb.Buildf(buildFInsApproval, ib)
	return sqlb.WithFlavor(ret, sqlb.PostgreSQL).Build()
}

func UpdateApprovalsSQL(account, role *string, trID *types.ID) (string, []interface{}) {
	ub := sqlb.PostgreSQL.NewUpdateBuilder()
	ub.Update("approval").
		Set(
			ub.Assign("approval_time", "NOW()"),
		).
		Where(
			ub.Equal("account_name", *account),
			ub.Equal("account_role", *role),
			ub.Equal("transaction_id", *trID),
		)
	ret := sqlb.Buildf(buildFInsApproval, ub)
	return sqlb.WithFlavor(ret, sqlb.PostgreSQL).Build()
}

func SelectApprovalsByTrItemIDsSQL(
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
	sb.From("approval").
		Where(
			sb.Equal("account_role", *role),
			sb.In("transaction_item_id", trItemIDs...),
		)
	return sb.Build()
}

func SelectApprovalsByTrIDSQL(
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
	sb.From("approval").
		Where(
			sb.Equal("transaction_id", *trID),
		)
	return sb.Build()
}
