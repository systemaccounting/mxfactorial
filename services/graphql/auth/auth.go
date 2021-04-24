package auth

import (
	"github.com/systemaccounting/mxfactorial/services/graphql/graph/model"
)

// todo: convert cognito auth in https://github.com/systemaccounting/mxfactorial/blob/7735c4dcef2d9c7450aef45e0ae73d8049139583/services/graphql-faas/index.js to go

// AuthAccount returns tested account identity, currently mocking
func AuthAccount(trItems []*model.TransactionItemInput) *string {
	for _, v := range trItems {
		if v.RuleInstanceID == nil {
			return v.Creditor
		}
	}
	return nil
}
