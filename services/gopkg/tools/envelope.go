package tools

import "github.com/systemaccounting/mxfactorial/services/gopkg/types"

// CreateIntraTransaction ...
func CreateIntraTransaction(
	authAccount string,
	tr *types.Transaction,
) types.IntraTransaction {
	return types.IntraTransaction{
		IntraEvent: types.IntraEvent{
			AuthAccount: authAccount,
		},
		Transaction: tr,
	}
}

// CreateIntraTransaction ...
func CreateIntraTransactions(
	authAccount string,
	trs []*types.Transaction,
) types.IntraTransactions {
	return types.IntraTransactions{
		IntraEvent: types.IntraEvent{
			AuthAccount: authAccount,
		},
		// todo: change field name to "transactions"
		Transaction: trs,
	}
}
