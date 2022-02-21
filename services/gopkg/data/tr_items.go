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

func UpdateTrItemApprovalTimesByRole(
	db lpg.SQLDB,
	accountRole types.Role,
	approvedTrItems map[types.ID]string,
) error {

	for trItemID, apprTime := range approvedTrItems {
		updTrItemSQL, updTrItemArgs := sqlb.UpdateTrItemRoleApprovalSQL(
			accountRole,
			&trItemID,
			&apprTime,
		)

		_, err := db.Exec(
			context.Background(),
			updTrItemSQL,
			updTrItemArgs...,
		)
		if err != nil {
			return fmt.Errorf("update transation item error: %v", err)
		}
	}

	return nil
}

func CreateTransactionItems(
	db lpg.SQLDB,
	trID *types.ID,
	trItems []*types.TransactionItem) ([]*types.TransactionItem, error) {

	// create insert transaction item sql
	insTrItemSQL, insTrItemArgs := sqlb.InsertTrItemsSQL(
		trID,
		trItems,
	)

	// insert transaction items returning ids
	trItemRows, err := db.Query(
		context.Background(),
		insTrItemSQL,
		insTrItemArgs...,
	)
	if err != nil {
		return nil, fmt.Errorf("create transaction items error: %v", err)
	}

	// unmarshal transaction items
	// returned from transaction item insert
	trItems, err = lpg.UnmarshalTrItems(trItemRows)
	if err != nil {
		log.Printf("unmarshal transaction items error: %v", err)
		return nil, err
	}

	return trItems, nil
}
