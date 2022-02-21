package tools

import (
	"errors"
	"fmt"

	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func IsCustomIDUnique(i types.ID, l []interface{}) bool {
	for _, v := range l {
		if i == v.(types.ID) {
			return false
		}
	}
	return true
}

func IsStringUnique(s string, l []interface{}) bool {
	for _, v := range l {
		if v.(string) == s {
			return false
		}
	}
	return true
}

func IsIntUnique(i types.ID, l []interface{}) bool {
	for _, v := range l {
		if v.(types.ID) == i {
			return false
		}
	}
	return true
}

func IsEachContraAccountUnique(trItems []*types.TransactionItem) error {
	for _, v := range trItems {
		if *v.Creditor == *v.Debitor {
			var errMsg = fmt.Sprintf("same debitor and creditor in transaction_item. exiting %v", v.Creditor)
			var err = errors.New(errMsg)
			return err
		}
	}
	return nil
}

func ListUniqueAccountsFromTrItems(trItems []*types.TransactionItem) []interface{} {
	var uniqueAccounts []interface{}
	for _, v := range trItems {
		if IsStringUnique(*v.Debitor, uniqueAccounts) {
			uniqueAccounts = append(uniqueAccounts, *v.Debitor)
		}
		if IsStringUnique(*v.Creditor, uniqueAccounts) {
			uniqueAccounts = append(uniqueAccounts, *v.Creditor)
		}
	}
	return uniqueAccounts
}
