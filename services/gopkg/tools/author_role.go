package tools

import (
	"errors"

	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

const (
	DEBITOR  string = "debitor"
	CREDITOR        = "creditor"
)

var ErrAuthorNotInItems = errors.New("author not in items")

// GetAuthorRole gets author role from a transaction
func GetAuthorRole(tr *types.Transaction, author string) (string, error) {

	// test for rule added transaction author
	if (tr.RuleInstanceID == nil || *tr.RuleInstanceID == "") && tr.Author == nil && tr.AuthorRole == nil {
		return *tr.AuthorRole, nil
	}

	// if transaction is NOT rule generated
	for _, v := range tr.TransactionItems {

		// if v.RuleInstanceID.IsZero() {
		if v.RuleInstanceID == nil || *v.RuleInstanceID == "" {

			if *v.Debitor == author {
				return DEBITOR, nil
			}

			if *v.Creditor == author {
				return CREDITOR, nil
			}

		}
	}

	return "", ErrAuthorNotInItems
}
