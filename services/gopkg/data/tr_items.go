package data

import (
	"context"
	"fmt"
	"log"

	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func GetTrItemsByTransactionID(db lpg.SQLDB, ID *types.ID) ([]*types.TransactionItem, error) {
	// create sql to get current transaction items
	trItemsSQL, trItemsArgs := sqlb.SelectTrItemsByTrIDSQL(
		ID,
	)

	// get transaction items
	preTrItemRows, err := db.Query(
		context.Background(),
		trItemsSQL,
		trItemsArgs...,
	)
	if err != nil {
		return nil, fmt.Errorf("get transaction items query error: %v", err)
	}

	// unmarshal transaction items
	trItems, err := lpg.UnmarshalTrItems(
		preTrItemRows,
	)

	if err != nil {
		log.Print(err)
		return nil, fmt.Errorf("get transaction items unmarshal error: %v", err)
	}

	return trItems, nil
}
