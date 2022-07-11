package data

import (
	"context"
	"fmt"

	"github.com/huandu/go-sqlbuilder"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func GetTransactionByID(
	db lpg.SQLDB,
	u lpg.PGUnmarshaler,
	sbc func() sqls.SelectSQLBuilder,
	ID *types.ID) (*types.Transaction, error) {

	// create sql builder from constructor
	sb := sbc()

	// create sql to get current transaction
	transactionSQL, transactionArgs := sb.SelectTransactionByIDSQL(ID)

	// get transaction
	transactionRow := db.QueryRow(
		context.Background(),
		transactionSQL,
		transactionArgs...,
	)

	// unmarshal transaction
	transaction, err := u.UnmarshalTransaction(transactionRow)
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
	ibc func() sqls.InsertSQLBuilder,
	sbc func() sqls.SelectSQLBuilder,
	b func(string, ...interface{}) sqlbuilder.Builder,
	ruleTestedTransaction *types.Transaction,
) (*types.ID, error) {

	sql, args, err := sqls.CreateTransactionRequestSQL(
		ibc,
		sbc,
		b,
		ruleTestedTransaction)
	if err != nil {
		return nil, err
	}

	trID, err := InsertTransactionTx(db, sql, args)
	if err != nil {
		return nil, err
	}

	return trID, nil
}

func GetTransactionWithTrItemsAndApprovalsByID(
	db lpg.SQLDB,
	u lpg.PGUnmarshaler,
	sbc func() sqls.SelectSQLBuilder,
	trID *types.ID) (*types.Transaction, error) {

	t, err := GetTransactionByID(db, u, sbc, trID)
	if err != nil {
		return nil, fmt.Errorf("GetTransactionByID error: %v", err)
	}

	trItems, err := GetTrItemsByTransactionID(db, u, sbc, trID)
	if err != nil {
		return nil, fmt.Errorf("GetTrItemsByTransactionID error: %v", err)
	}

	// create sql builder from constructor
	apprvs, err := GetApprovalsByTransactionID(db, u, sbc, trID)
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

func AttachTransactionItemsToTransaction(
	trItems []*types.TransactionItem,
	tr *types.Transaction,
) {
	for _, ti := range trItems {
		if *ti.TransactionID == *tr.ID {
			tr.TransactionItems = append(tr.TransactionItems, ti)
		}
	}
}

func GetTransactionsWithTrItemsAndApprovalsByID(
	db lpg.SQLDB,
	u lpg.PGUnmarshaler,
	sbc func() sqls.SelectSQLBuilder,
	selSQL string,
	selArgs []interface{}) ([]*types.Transaction, error) {

	rows, err := db.Query(context.TODO(), selSQL, selArgs...)
	if err != nil {
		return nil, err
	}

	transactions, err := u.UnmarshalTransactions(rows)
	if err != nil {
		return nil, err
	}

	reqIDs := make([]interface{}, 0)
	for _, v := range transactions {
		reqIDs = append(reqIDs, v.ID)
	}

	trItems, err := GetTrItemsByTrIDs(db, u, sbc, reqIDs)
	if err != nil {
		return nil, err
	}

	apprvs, err := GetApprovalsByTrIDs(db, u, sbc, reqIDs)
	if err != nil {
		return nil, err
	}

	AttachApprovalsToTransactionItems(apprvs, trItems)

	for _, v := range transactions {
		AttachTransactionItemsToTransaction(trItems, v)
	}

	return transactions, nil
}
