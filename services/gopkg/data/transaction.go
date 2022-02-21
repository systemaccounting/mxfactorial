package data

import (
	"context"
	"fmt"
	"log"
	"time"

	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func GetTransactionByID(db lpg.SQLDB, ID *types.ID) (*types.Transaction, error) {

	// create sql to get current transaction
	transactionSQL, transactionArgs := sqlb.SelectTransactionByIDSQL(
		ID,
	)

	// get transaction
	transactionRow := db.QueryRow(
		context.Background(),
		transactionSQL,
		transactionArgs...,
	)

	// unmarshal transaction
	transaction, err := lpg.UnmarshalTransaction(
		transactionRow,
	)
	if err != nil {
		return nil, fmt.Errorf("get transaction unmarshal error: %v", err)
	}

	return transaction, nil
}

func UpdateTransactionEquilibriumByID(
	db lpg.SQLDB,
	equilibriumTime time.Time,
	ID *types.ID,
) (*types.Transaction, error) {
	// create update transaction sql
	updTrByIDSQL, updTrByIDArgs := sqlb.UpdateTransactionByIDSQL(
		ID,
		equilibriumTime.Format("2006-01-02T15:04:05.000000Z"),
	)

	// update transaction with equilibrium values
	updTrRow := db.QueryRow(
		context.Background(),
		updTrByIDSQL,
		updTrByIDArgs...,
	)

	// unmarshal transaction with equilibrium values
	updTr, err := lpg.UnmarshalTransaction(updTrRow)
	if err != nil {
		log.Print(err)
		return nil, fmt.Errorf("update transaction unmarshal error: %v", err)
	}

	return updTr, nil
}

func CreateTransaction(
	db lpg.SQLDB,
	trRuleInstanceID *types.ID,
	trAuthor *string,
	trDeviceID *string,
	trAuthorDeviceLatlng *string,
	trAuthorRole types.Role,
	trEquilibriumTime *string,
	trSumValue *string,
) (*types.Transaction, error) {
	// create insert transaction sql
	insTrSQL, insTrArgs := sqlb.InsertTransactionSQL(
		trRuleInstanceID,
		trAuthor,
		trDeviceID,
		trAuthorDeviceLatlng,
		trAuthorRole,
		trEquilibriumTime,
		trSumValue,
	)

	// insert transaction returning id
	trRow := db.QueryRow(context.Background(), insTrSQL, insTrArgs...)

	// unmarshal transaction id
	// returned from transaction insert
	tr, err := lpg.UnmarshalTransaction(trRow)
	if err != nil {
		return nil, fmt.Errorf("create transaction unmarshal error: %v", err)
	}

	return tr, nil
}
