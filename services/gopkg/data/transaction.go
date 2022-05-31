package data

import (
	"context"
	"fmt"

	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func GetTransactionByID(db lpg.SQLDB, ID *types.ID) (*types.Transaction, error) {

	// create sql to get current transaction
	transactionSQL, transactionArgs := sqlb.SelectTransactionByIDSQL(ID)

	// get transaction
	transactionRow := db.QueryRow(
		context.Background(),
		transactionSQL,
		transactionArgs...,
	)

	// unmarshal transaction
	transaction, err := lpg.UnmarshalTransaction(transactionRow)
	if err != nil {
		return nil, fmt.Errorf("get transaction unmarshal error: %v", err)
	}

	return transaction, nil
}

func InsertTransactionTx(db lpg.SQLDB, trSQL string, args []interface{}) (*types.ID, error) {

	dbtx, err := db.Begin(context.TODO())
	if err != nil {
		return nil, fmt.Errorf("begin error: %v", err)
	}

	defer dbtx.Rollback(context.TODO())

	row := dbtx.QueryRow(context.TODO(), trSQL, args...)

	var trID types.ID
	err = row.Scan(&trID)
	if err != nil {
		return nil, fmt.Errorf("insert error: %v", err)
	}

	err = dbtx.Commit(context.TODO())
	if err != nil {
		return nil, fmt.Errorf("commit error: %v", err)
	}

	return &trID, nil
}

func RequestCreate(
	db lpg.SQLDB,
	ruleTestedTransaction *types.Transaction,
) (*types.ID, error) {

	sql, args, err := sqlb.CreateTransactionRequestSQL(ruleTestedTransaction)
	if err != nil {
		return nil, err
	}

	trID, err := InsertTransactionTx(db, sql, args)
	if err != nil {
		return nil, err
	}

	return trID, nil
}

func GetTransactionWithTrItemsAndApprovalsByID(db lpg.SQLDB, trID *types.ID) (*types.Transaction, error) {

	t, err := GetTransactionByID(db, trID)
	if err != nil {
		return nil, fmt.Errorf("GetTransactionByID error: %v", err)
	}

	trItems, err := GetTrItemsByTransactionID(db, trID)
	if err != nil {
		return nil, fmt.Errorf("GetTrItemsByTransactionID error: %v", err)
	}

	apprvs, err := GetApprovalsByTransactionID(db, trID)
	if err != nil {
		return nil, fmt.Errorf("GetApprovalsByTransactionID error: %v", err)
	}

	t.TransactionItems = trItems

	AttachApprovalsToTransactionItems(apprvs, t.TransactionItems)

	return t, nil
}

func AttachApprovalsToTransactionItems(
	apprvs []*types.Approval,
	trItems []*types.TransactionItem,
) {
	for _, ti := range trItems {
		for _, ap := range apprvs {
			if *ap.TransactionItemID == *ti.ID {
				ti.Approvals = append(ti.Approvals, ap)
			}
		}
	}
}
