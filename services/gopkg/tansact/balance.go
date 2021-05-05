package tansact

import (
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func IsEquilibrium(t types.Transaction) bool {
	if len(*t.EquilibriumTime) == 0 {
		return false
	}
TransactionItems:
	for _, v := range t.TransactionItems {
		if len(*v.CreditorApprovalTime) > 0 && len(*v.DebitorApprovalTime) > 0 {
		Approvers:
			for _, w := range v.Approvers {
				if len(*w.ApprovalTime) > 0 {
					continue Approvers
				} else {
					return false
				}
			}
			continue TransactionItems
		} else {
			return false
		}
	}
	return true
}
