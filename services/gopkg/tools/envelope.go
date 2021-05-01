package tools

import "github.com/systemaccounting/mxfactorial/services/gopkg/types"

// CreateIntraTransaction ...
func CreateIntraTransaction(
	authAccount string,
	tr *types.Transaction,
) types.IntraTransaction {
	intraTr := types.IntraTransaction{
		types.IntraEvent{AuthAccount: authAccount},
		tr,
	}
	return intraTr
}

// CreateIntraTransaction ...
func CreateIntraTransactions(
	authAccount string,
	trs []*types.Transaction,
) types.IntraTransactions {
	intraTr := types.IntraTransactions{
		types.IntraEvent{AuthAccount: authAccount},
		trs,
	}
	return intraTr
}
