package request

import (
	"errors"

	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

// TestPendingRoleApproval errors when 0 pending
// approvals found for current debitor or creditor account
func TestPendingRoleApproval(
	accountName *string,
	accountRole types.Role,
	approvals []*types.Approval,
) error {

	approvalTimeStampsPending := 0

	for _, v := range approvals {
		if *v.AccountName == *accountName &&
			*v.AccountRole == accountRole.String() &&
			v.ApprovalTime == nil {
			approvalTimeStampsPending++
		}
	}

	if approvalTimeStampsPending == 0 {
		return errors.New("0 timestamps pending for approver. skipping approval")
	}

	return nil
}
