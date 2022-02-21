package tools

import (
	"errors"

	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

var ErrAuthorNotInItems = errors.New("author not in items")

// GetAuthorRole gets author role from a transaction
func GetAuthorRole(tr *types.Transaction, author string) (types.Role, error) {

	// test for rule added transaction author
	if tr.RuleInstanceID != nil && len(*tr.RuleInstanceID) > 0 {
		var authorRole *types.Role
		authorRole.Set(*tr.AuthorRole)
		return *authorRole, nil
	}

	// if transaction is NOT rule generated
	for _, v := range tr.TransactionItems {

		if v.RuleInstanceID == nil || *v.RuleInstanceID == "" {

			if *v.Debitor == author {
				return types.DEBITOR, nil
			}

			if *v.Creditor == author {
				return types.CREDITOR, nil
			}

		}
	}

	return 0, ErrAuthorNotInItems
}
