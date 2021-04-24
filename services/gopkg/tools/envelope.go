package tools

import "github.com/systemaccounting/mxfactorial/services/gopkg/types"

// CreateIntraTransaction ...
func CreateIntraTransaction(
	authAccount string,
	tr *types.Transaction,
	trItems []*types.TransactionItem,
) types.IntraTransaction {
	intraTr := types.IntraTransaction{
		types.IntraEvent{AuthAccount: authAccount},
		tr,
	}
	intraTr.Transaction.TransactionItems = trItems
	return intraTr
}
