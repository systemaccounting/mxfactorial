package data

import (
	"context"
	"fmt"

	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func GetApprovalsByTransactionID(db lpg.SQLDB, ID *types.ID) ([]*types.Approval, error) {
	// create sql to get all approvals
	apprSQL, args := sqlb.SelectApprovalsByTrIDSQL(
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
	approvals, err := lpg.UnmarshalApprovals(
		apprRows,
	)
	if err != nil {
		return nil, fmt.Errorf("unmarshal approvals error: %v", err)
	}

	return approvals, nil
}

func GetRoleApprovalsByTrItemIDs(
	db lpg.SQLDB,
	accountRole types.Role,
	trItemIDsAffectedByRoleApproval []interface{},
) ([]*types.Approval, error) {

	// create sql to get role approvers of transaction item IDs
	getApprSQL, getApprArgs := sqlb.SelectApprovalsByTrItemIDsSQL(
		accountRole,
		trItemIDsAffectedByRoleApproval,
	)

	// get role approvals affecting transaction items
	approvalsPerTrItemRows, err := db.Query(
		context.Background(),
		getApprSQL,
		getApprArgs...,
	)
	if err != nil {
		return nil, fmt.Errorf("get role approvals error: %v", err)
	}

	// unmarshal roleApprovals
	roleApprovals, err := lpg.UnmarshalApprovals(
		approvalsPerTrItemRows,
	)
	if err != nil {
		return nil, fmt.Errorf("unmarshal role approvals error: %v", err)
	}

	return roleApprovals, nil
}

func UpdateApprovalsByAccountAndRole(
	db lpg.SQLDB,
	accountName *string,
	accountRole types.Role,
	ID *types.ID,
) ([]*types.Approval, error) {
	// create update approval sql returning
	// all columns of updated approvals
	updSQL, updArgs := sqlb.UpdateApprovalsSQL(
		accountName,
		accountRole,
		ID,
	)

	// update approvals
	updatedApprovalRows, err := db.Query(
		context.Background(),
		updSQL,
		updArgs...,
	)

	if err != nil {
		return nil, fmt.Errorf("update approvals error: %v", err)
	}

	// unmarshal approvals returned from update query
	updatedApprovals, err := lpg.UnmarshalApprovals(
		updatedApprovalRows,
	)
	if err != nil {
		return nil, fmt.Errorf("unmarshal update approvals error: %v", err)
	}

	return updatedApprovals, nil
}

func CreateApprovals(
	db lpg.SQLDB,
	trID *types.ID,
	trItemsWithIDs []*types.TransactionItem,
	trItemsWithApprovals []*types.TransactionItem,
) ([]*types.Approval, error) {

	if len(trItemsWithIDs) != len(trItemsWithApprovals) {
		return nil, fmt.Errorf(
			"CreateApprovals: %v trItemsWithApprovals length not equal to %v trItemsWithApprovals length",
			len(trItemsWithIDs),
			len(trItemsWithApprovals),
		)
	}

	var insertedApprovals []*types.Approval
	for i := 0; i < len(trItemsWithIDs); i++ {

		// create sql to insert approvals per transaction id
		aprvsSQL, aprvsArgs := sqlb.InsertApprovalsSQL(
			trID,
			trItemsWithIDs[i].ID,
			trItemsWithApprovals[i].Approvals,
		)

		// insert approvals per transaction item id
		apprvRows, err := db.Query(context.Background(), aprvsSQL, aprvsArgs...)
		if err != nil {
			return nil, fmt.Errorf("create approvals error: %v", err)
		}

		// unmarshal approvals returned from insert
		apprv, err := lpg.UnmarshalApprovals(apprvRows)
		if err != nil {
			return nil, fmt.Errorf("unmarshal create approvals error: %v", err)
		}

		// add approval insert result to list
		insertedApprovals = append(insertedApprovals, apprv...)
	}
	return insertedApprovals, nil
}
