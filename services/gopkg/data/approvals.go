package data

import (
	"context"
	"fmt"

	"github.com/jackc/pgtype"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

const ApproveAllRoleAccountSQL string = "SELECT approve_all_role_account($1, $2, $3) AS equilibrium_time"

func GetApprovalsByTransactionID(
	db lpg.SQLDB,
	u lpg.PGUnmarshaler,
	sbc func() sqls.SelectSQLBuilder,
	ID *types.ID) ([]*types.Approval, error) {

	sb := sbc()

	// create sql to get all approvals
	apprSQL, args := sb.SelectApprovalsByTrIDSQL(
		ID,
	)

	// get transaction approvers
	apprRows, err := db.Query(
		context.Background(),
		apprSQL,
		args...,
	)
	if err != nil {
		return nil, fmt.Errorf("get approvals error: %v", err)
	}

	// unmarshal transaction approvals
	approvals, err := u.UnmarshalApprovals(
		apprRows,
	)
	if err != nil {
		return nil, fmt.Errorf("unmarshal approvals error: %v", err)
	}

	return approvals, nil
}

func GetApprovalsByTrIDs(
	db lpg.SQLDB,
	u lpg.PGUnmarshaler,
	sbc func() sqls.SelectSQLBuilder,
	IDs []interface{}) ([]*types.Approval, error) {

	// create sql builder from constructor
	sb := sbc()

	// create sql to get all approvals
	apprSQL, args := sb.SelectApprovalsByTrIDsSQL(IDs)

	// get transaction approvers
	apprRows, err := db.Query(
		context.Background(),
		apprSQL,
		args...,
	)
	if err != nil {
		return nil, fmt.Errorf("get approvals error: %v", err)
	}

	// unmarshal transaction approvals
	approvals, err := u.UnmarshalApprovals(
		apprRows,
	)
	if err != nil {
		return nil, fmt.Errorf("unmarshal approvals error: %v", err)
	}

	return approvals, nil
}

func AddApprovalTimesByAccountAndRole(
	db lpg.SQLDB,
	accountName *string,
	accountRole types.Role,
	ID *types.ID,
) (pgtype.Timestamptz, error) {

	dbtx, err := db.Begin(context.TODO())
	if err != nil {
		return pgtype.Timestamptz{}, fmt.Errorf("begin error: %v", err)
	}

	defer dbtx.Rollback(context.TODO())

	// update approvals with approve_all_role_account pg function
	row := dbtx.QueryRow(
		context.Background(),
		ApproveAllRoleAccountSQL,
		[]interface{}{ID, accountName, accountRole}...,
	)

	var equilibriumTime pgtype.Timestamptz

	err = row.Scan(&equilibriumTime)
	if err != nil {
		return pgtype.Timestamptz{}, fmt.Errorf("update approvals error: %v", err)
	}

	err = dbtx.Commit(context.TODO())
	if err != nil {
		return pgtype.Timestamptz{}, fmt.Errorf("commit error: %v", err)
	}

	return equilibriumTime, nil
}
