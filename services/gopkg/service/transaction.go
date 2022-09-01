package service

import (
	"github.com/jackc/pgtype"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type ITransactionService interface {
	GetTransactionByID(types.ID) (types.Transaction, error)
	InsertTransactionTx(*types.Transaction) (types.ID, error)
	GetTransactionWithTrItemsAndApprovalsByID(types.ID) (types.Transaction, error)
	GetTransactionsWithTrItemsAndApprovalsByID(types.IDs) (types.Transactions, error)
	GetLastNTransactions(string, string) (types.Transactions, error)
	GetLastNRequests(string, string) (types.Transactions, error)
	GetTrItemsAndApprovalsByTransactionIDs(types.IDs) error
	GetTrItemsByTransactionID(ID types.ID) (types.TransactionItems, error)
	GetTrItemsByTrIDs(IDs types.IDs) error
	GetApprovalsByTransactionID(ID types.ID) (types.Approvals, error)
	GetApprovalsByTransactionIDs(types.IDs) error
	AddApprovalTimesByAccountAndRole(types.ID, string, types.Role) (pgtype.Timestamptz, error)
}

type TransactionService struct {
	*postgres.TransactionModel
	*postgres.TransactionsModel
	*postgres.TransactionItemsModel
	*postgres.ApprovalsModel
}

func (t TransactionService) GetTransactionByID(ID types.ID) (types.Transaction, error) {

	err := t.TransactionModel.GetTransactionByID(ID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return types.Transaction{}, err
	}

	return t.Transaction, nil
}

func (t TransactionService) InsertTransactionTx(
	ruleTestedTransaction *types.Transaction,
) (types.ID, error) {

	err := t.TransactionModel.InsertTransactionTx(ruleTestedTransaction)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return types.ID(""), err
	}

	return *t.ID, nil
}

func (t TransactionService) GetTransactionWithTrItemsAndApprovalsByID(trID types.ID) (types.Transaction, error) {

	// get the transaction
	err := t.TransactionModel.GetTransactionByID(trID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return types.Transaction{}, err
	}

	// get the transaction items
	err = t.TransactionItemsModel.GetTrItemsByTransactionID(trID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return types.Transaction{}, err
	}

	// get the approvals
	err = t.ApprovalsModel.GetApprovalsByTransactionID(trID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return types.Transaction{}, err
	}

	// return the transaction with the transaction items and approvals attached
	return BuildTransaction(t.Transaction, t.TransactionItems, t.Approvals), nil
}

func (t TransactionService) GetTransactionsWithTrItemsAndApprovalsByID(trIDs types.IDs) (types.Transactions, error) {

	// get the transactions
	err := t.TransactionsModel.GetTransactionsByIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// get the transaction items
	err = t.TransactionItemsModel.GetTrItemsByTrIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// get the approvals
	err = t.ApprovalsModel.GetApprovalsByTransactionIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// return the transaction with the transaction items and approvals attached
	return BuildTransactions(t.Transactions, t.TransactionItems, t.Approvals), nil
}

func (t TransactionService) GetLastNTransactions(
	accountName string,
	recordLimit string,
) (types.Transactions, error) {

	err := t.TransactionsModel.GetLastNTransactions(accountName, recordLimit)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	trIDs := t.Transactions.ListIDs()

	err = t.GetTrItemsAndApprovalsByTransactionIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return BuildTransactions(t.Transactions, t.TransactionItems, t.Approvals), nil
}

func (t TransactionService) GetLastNRequests(
	accountName string,
	recordLimit string,
) (types.Transactions, error) {

	err := t.TransactionsModel.GetLastNRequests(accountName, recordLimit)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	trIDs := t.Transactions.ListIDs()

	err = t.GetTrItemsAndApprovalsByTransactionIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return BuildTransactions(t.Transactions, t.TransactionItems, t.Approvals), nil
}

func (t TransactionService) GetTrItemsAndApprovalsByTransactionIDs(trIDs types.IDs) error {

	err := t.TransactionItemsModel.GetTrItemsByTrIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	err = t.GetApprovalsByTransactionIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (t TransactionService) GetTrItemsByTransactionID(ID types.ID) (types.TransactionItems, error) {

	err := t.TransactionItemsModel.GetTrItemsByTransactionID(ID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return t.TransactionItems, nil
}

func (t TransactionService) GetTrItemsByTrIDs(IDs types.IDs) error {

	err := t.TransactionItemsModel.GetTrItemsByTrIDs(IDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (t TransactionService) GetApprovalsByTransactionID(ID types.ID) (types.Approvals, error) {

	err := t.ApprovalsModel.GetApprovalsByTransactionID(ID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return t.Approvals, nil
}

func (t TransactionService) GetApprovalsByTransactionIDs(IDs types.IDs) error {

	err := t.ApprovalsModel.GetApprovalsByTransactionIDs(IDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (t TransactionService) AddApprovalTimesByAccountAndRole(
	trID types.ID,
	accountName string,
	accountRole types.Role,
) (pgtype.Timestamptz, error) {

	equilibriumTime, err := t.ApprovalsModel.UpdateApprovalsByAccountAndRole(trID, accountName, accountRole)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return pgtype.Timestamptz{}, err
	}

	return equilibriumTime, nil
}

func NewTransactionService(db *postgres.DB) *TransactionService {
	return &TransactionService{
		TransactionModel:      postgres.NewTransactionModel(db),
		TransactionsModel:     postgres.NewTransactionsModel(db),
		TransactionItemsModel: postgres.NewTransactionItemsModel(db),
		ApprovalsModel:        postgres.NewApprovalsModel(db),
	}
}

func BuildTransactions(
	trs types.Transactions,
	trItems types.TransactionItems,
	apprvs types.Approvals,
) types.Transactions {

	var transactions types.Transactions

	for _, v := range trs {

		trWithTrItems := AttachTransactionItemsToTransaction(trItems, *v)

		trItemsWithApprvs := AttachApprovalsToTransactionItems(apprvs, trItems)

		trWithTrItems.TransactionItems = trItemsWithApprvs

		transactions = append(transactions, &trWithTrItems)

	}

	return transactions

}

func BuildTransaction(
	tr types.Transaction,
	trItems types.TransactionItems,
	apprvs types.Approvals,
) types.Transaction {

	// attach approvals to transaction items
	transactionItems := AttachApprovalsToTransactionItems(apprvs, trItems)

	// attach transaction items to transaction
	tr.TransactionItems = transactionItems

	// return transaction
	return tr
}

func AttachApprovalsToTransactionItems(
	apprvs types.Approvals,
	trItems types.TransactionItems,
) types.TransactionItems {

	for _, ti := range trItems {
		for _, ap := range apprvs {
			if *ap.TransactionItemID == *ti.ID {
				ti.Approvals = append(ti.Approvals, ap)
			}
		}
	}

	return trItems
}

// used when filtering transaction items belonging to multiple transactions
func AttachTransactionItemsToTransaction(
	trItems types.TransactionItems,
	tr types.Transaction,
) types.Transaction {

	for _, ti := range trItems {
		if *ti.TransactionID == *tr.ID {
			tr.TransactionItems = append(tr.TransactionItems, ti)
		}
	}

	return tr
}
