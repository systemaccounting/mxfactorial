package request

import (
	"time"

	"github.com/systemaccounting/mxfactorial/services/gopkg/data"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func SetEquilibrium(
	db lpg.SQLDB,
	ID *types.ID,
	equilibriumTime time.Time,
) (*types.Transaction, error) {

	transaction, err := data.UpdateTransactionEquilibriumByID(
		db,
		equilibriumTime,
		ID,
	)
	if err != nil {
		return nil, err
	}

	return transaction, nil
}

func IsEquilibrium(approvals []*types.Approval) bool {
	for _, v := range approvals {
		if v.ApprovalTime == nil {
			return false
		}
	}
	return true
}
