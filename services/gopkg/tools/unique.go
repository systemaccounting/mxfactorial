package tools

import (
	"errors"
	"fmt"

	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

// todo: switch unique functions to generic
func IsCustomIDUnique(i types.ID, l []interface{}) bool {
	for _, v := range l {
		if i == v.(types.ID) {
			return false
		}
	}
	return true
}

func IsIfaceStringUnique(s string, l []interface{}) bool {
	for _, v := range l {
		if v.(string) == s {
			return false
		}
	}
	return true
}

func IsStringUnique(s string, l []string) bool {
	for _, v := range l {
		if v == s {
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
