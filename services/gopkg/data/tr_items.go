package data

import (
	"context"
	"fmt"
	"log"

	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func GetTrItemsByTransactionID(
	db lpg.SQLDB,
	u lpg.PGUnmarshaler,
	sbc func() sqls.SelectSQLBuilder,
	ID *types.ID) ([]*types.TransactionItem, error) {

	// create sql builder from constructor
	sb := sbc()

	// create sql to get current transaction items
	trItemsSQL, trItemsArgs := sb.SelectTrItemsByTrIDSQL(
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
	trItems, err := u.UnmarshalTrItems(preTrItemRows)

	if err != nil {
		log.Print(err)
		return nil, fmt.Errorf("get transaction items unmarshal error: %v", err)
	}

	return trItems, nil
}

func GetTrItemsByTrIDs(
	db lpg.SQLDB,
	u lpg.PGUnmarshaler,
	sbc func() sqls.SelectSQLBuilder,
	IDs []interface{}) ([]*types.TransactionItem, error) {

	// create sql builder from constructor
	sb := sbc()

	// create sql to get current transaction items
	selectSQL, selectARGs := sb.SelectTrItemsByTrIDsSQL(IDs)

	// get transaction items
	trItemsRows, err := db.Query(
		context.Background(),
		selectSQL,
		selectARGs...,
	)
	if err != nil {
		return nil, fmt.Errorf("get transaction items query error: %v", err)
	}

	// unmarshal transaction items
	trItems, err := u.UnmarshalTrItems(trItemsRows)

	if err != nil {
		log.Print(err)
		return nil, fmt.Errorf("get transaction items unmarshal error: %v", err)
	}

	return trItems, nil
}
