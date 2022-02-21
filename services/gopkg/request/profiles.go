package request

import "github.com/systemaccounting/mxfactorial/services/gopkg/types"

func MapProfileIDsToAccounts(profiles []*types.AccountProfileID) map[string]types.ID {
	profileIDs := make(map[string]types.ID)
	for _, v := range profiles {
		profileIDs[*v.AccountName] = *v.ID
	}
	return profileIDs
}

func AddProfileIDsToTrItems(
	trItems []*types.TransactionItem,
	accountProfileIDs map[string]types.ID,
) []*types.TransactionItem {
	for _, v := range trItems {
		v.DebitorProfileID = new(types.ID)
		*v.DebitorProfileID = accountProfileIDs[*v.Debitor]
		v.CreditorProfileID = new(types.ID)
		*v.CreditorProfileID = accountProfileIDs[*v.Creditor]
	}
	return trItems
}
