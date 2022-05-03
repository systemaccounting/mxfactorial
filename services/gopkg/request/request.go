package request

import (
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func EmptyStringIfNilPtr(v *string) string {
	if v == nil {
		return ""
	}
	return *v
}

func FalseIfNilPtr(v *bool) bool {
	if v == nil {
		return false
	}
	return *v
}

func RemoveUnauthorizedValues(trItems []*types.TransactionItem) []*types.TransactionItem {
	var authorized []*types.TransactionItem

	for _, v := range trItems {

		debitorFirst := FalseIfNilPtr(v.DebitorFirst)
		debitorRejectionTime := EmptyStringIfNilPtr(v.DebitorRejectionTime)
		creditorRejectionTime := EmptyStringIfNilPtr(v.CreditorRejectionTime)
		debitorExpirationTime := EmptyStringIfNilPtr(v.DebitorExpirationTime)
		creditorExpirationTime := EmptyStringIfNilPtr(v.CreditorExpirationTime)

		authorized = append(authorized, &types.TransactionItem{
			ID:                     nil,
			TransactionID:          nil,
			ItemID:                 v.ItemID,
			Price:                  v.Price,
			Quantity:               v.Quantity,
			DebitorFirst:           &debitorFirst,
			RuleInstanceID:         v.RuleInstanceID,
			RuleExecIDs:            []*string{},
			UnitOfMeasurement:      nil,
			UnitsMeasured:          v.UnitsMeasured,
			Debitor:                v.Debitor,
			Creditor:               v.Creditor,
			DebitorProfileID:       nil,
			CreditorProfileID:      nil,
			DebitorApprovalTime:    nil,
			CreditorApprovalTime:   nil,
			DebitorRejectionTime:   &debitorRejectionTime,
			CreditorRejectionTime:  &creditorRejectionTime,
			DebitorExpirationTime:  &debitorExpirationTime,
			CreditorExpirationTime: &creditorExpirationTime,
			Approvals:              []*types.Approval{},
		})
	}

	return authorized
}
