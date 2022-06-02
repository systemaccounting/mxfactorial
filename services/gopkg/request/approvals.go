package request

import (
	"errors"
	"time"

	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

// TestPendingRoleApproval errors when 0 pending approvals
// found for current debitor or creditor account
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
		var err = errors.New("0 timestamps pending for approver. exiting")
		return err
	}

	return nil
}

func GetLastApprovalTime(approvals []*types.Approval) (time.Time, error) {
	lastApproval := time.Time{}
	for _, v := range approvals {
		apprTime, err := tools.ConvertPGTimeToGo(v.ApprovalTime)
		if err != nil {
			return time.Time{}, err
		}
		lastApproval = tools.GetLatestTime(&lastApproval, apprTime)
	}
	return lastApproval, nil
}

func MapApprovedTrItemIDsToApprovalTimes(
	trItemIDOccurrence map[types.ID]int,
	accountRole types.Role,
	approvals []*types.Approval,
) (map[types.ID]string, error) {

	// map ids of transaction items with 0 pending
	// approvals to their last approval times
	approvedTrItems := make(map[types.ID]string)

	// loop through map of transaction item ids
	// and their occurrences in approvals
	for trItemID, total := range trItemIDOccurrence {

		// count approval time stamps per transaction item id
		approvalCount := 0

		// count approvals per transaction item id
		for _, v := range approvals {
			if *v.TransactionItemID == trItemID &&
				*v.AccountRole == accountRole.String() {
				if v.ApprovalTime != nil {
					approvalCount++
				}
			}
		}

		// test current transaction item for 0 pending approvals
		if approvalCount == total {
			// init a time for last approval
			lastApprovalTime := time.Time{}
			// search through approvals seeking last approval time of each transaction item
			for _, u := range approvals {
				// match approvals with same transaction item id
				if trItemID == *u.TransactionItemID &&
					*u.AccountRole == accountRole.String() &&
					u.ApprovalTime != nil {
					// convert approval time of current
					// transaction item to go for date comparison
					apprTime, err := tools.ConvertPGTimeToGo(u.ApprovalTime)
					if err != nil {
						return nil, err
					}
					// test for latest approval time
					if apprTime.After(lastApprovalTime) {
						// set latest approval time
						lastApprovalTime = *apprTime
					}
				}
			}
			// map last approval time to transaction item id with 0 pending approvals
			approvedTrItems[trItemID] = lastApprovalTime.Format("2006-01-02T15:04:05.000000Z")
		}
	}

	return approvedTrItems, nil
}

// map transaction item id occurrence from approvals
func MapTrItemIDOccurrenceFromApprovals(
	accountRole types.Role,
	approvals []*types.Approval,
) map[types.ID]int {
	m := make(map[types.ID]int)
	for _, v := range approvals {
		if *v.AccountRole == accountRole.String() {
			m[*v.TransactionItemID] += 1
		}
	}
	return m
}
