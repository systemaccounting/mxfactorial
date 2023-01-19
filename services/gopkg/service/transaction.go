package service

import (
	"github.com/jackc/pgtype"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type ITransactionModel interface {
	GetTransactionByID(types.ID) (*types.Transaction, error)
	InsertTransactionTx(*types.Transaction) (*types.ID, error)
}

type ITransactionsModel interface {
	GetLastNTransactions(string, string) (types.Transactions, error)
	GetLastNRequests(string, string) (types.Transactions, error)
	GetTransactionsByIDs(types.IDs) (types.Transactions, error)
}

type ITransactionItemsModel interface {
	GetTrItemsByTransactionID(types.ID) (types.TransactionItems, error)
	GetTrItemsByTrIDs(types.IDs) (types.TransactionItems, error)
}

type IApprovalsModel interface {
	GetApprovalsByTransactionID(types.ID) (types.Approvals, error)
	GetApprovalsByTransactionIDs(types.IDs) (types.Approvals, error)
	UpdateApprovalsByAccountAndRole(types.ID, string, types.Role) (pgtype.Timestamptz, error)
}

type TransactionService struct {
	tm  ITransactionModel
	tsm ITransactionsModel
	tim ITransactionItemsModel
	am  IApprovalsModel
}

func (t TransactionService) GetTransactionByID(ID types.ID) (*types.Transaction, error) {

	tr, err := t.tm.GetTransactionByID(ID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return tr, nil
}

func (t TransactionService) InsertTransactionTx(
	ruleTestedTransaction *types.Transaction,
) (*types.ID, error) {

	trID, err := t.tm.InsertTransactionTx(ruleTestedTransaction)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return trID, nil
}

// todo: convert to postgres function to avoid 3 db queries
func (t TransactionService) GetTransactionWithTrItemsAndApprovalsByID(trID types.ID) (*types.Transaction, error) {

	// get the transaction
	tr, err := t.tm.GetTransactionByID(trID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// get the transaction items
	trItems, err := t.tim.GetTrItemsByTransactionID(trID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// get the approvals
	approvals, err := t.am.GetApprovalsByTransactionID(trID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// return the transaction with the
	// transaction items and approvals attached
	return BuildTransaction(tr, trItems, approvals), nil
}

// todo: convert to postgres function to avoid 3 db queries
func (t TransactionService) GetTransactionsWithTrItemsAndApprovalsByID(trIDs types.IDs) (types.Transactions, error) {

	// get the transactions
	trs, err := t.tsm.GetTransactionsByIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// get the transaction items
	trItems, err := t.tim.GetTrItemsByTrIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// get the approvals
	approvals, err := t.am.GetApprovalsByTransactionIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// return the transaction with the transaction items and approvals attached
	return BuildTransactions(trs, trItems, approvals), nil
}

func (t TransactionService) GetLastNTransactions(
	accountName string,
	recordLimit string,
) (types.Transactions, error) {

	trs, err := t.tsm.GetLastNTransactions(accountName, recordLimit)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	trIDs := trs.ListIDs()

	if len(trIDs) == 0 {
		return BuildTransactions(types.Transactions{}, types.TransactionItems{}, types.Approvals{}), nil
	}

	trItems, approvals, err := t.GetTrItemsAndApprovalsByTransactionIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return BuildTransactions(trs, trItems, approvals), nil
}

func (t TransactionService) GetLastNRequests(
	accountName string,
	recordLimit string,
) (types.Transactions, error) {

	requests, err := t.tsm.GetLastNRequests(accountName, recordLimit)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	trIDs := requests.ListIDs()

	trItems, approvals, err := t.GetTrItemsAndApprovalsByTransactionIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return BuildTransactions(requests, trItems, approvals), nil
}

func (t TransactionService) GetTrItemsAndApprovalsByTransactionIDs(trIDs types.IDs) (types.TransactionItems, types.Approvals, error) {

	trItems, err := t.tim.GetTrItemsByTrIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, nil, err
	}

	approvals, err := t.GetApprovalsByTransactionIDs(trIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, nil, err
	}

	return trItems, approvals, nil
}

func (t TransactionService) GetTrItemsByTransactionID(ID types.ID) (types.TransactionItems, error) {

	trItems, err := t.tim.GetTrItemsByTransactionID(ID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return trItems, nil
}

func (t TransactionService) GetTrItemsByTrIDs(IDs types.IDs) (types.TransactionItems, error) {

	trItems, err := t.tim.GetTrItemsByTrIDs(IDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return trItems, nil
}

func (t TransactionService) GetApprovalsByTransactionID(ID types.ID) (types.Approvals, error) {

	approvals, err := t.am.GetApprovalsByTransactionID(ID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return approvals, nil
}

func (t TransactionService) GetApprovalsByTransactionIDs(IDs types.IDs) (types.Approvals, error) {

	approvals, err := t.am.GetApprovalsByTransactionIDs(IDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return approvals, nil
}

func (t TransactionService) AddApprovalTimesByAccountAndRole(
	trID types.ID,
	accountName string,
	accountRole types.Role,
) (pgtype.Timestamptz, error) {

	equilibriumTime, err := t.am.UpdateApprovalsByAccountAndRole(trID, accountName, accountRole)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return pgtype.Timestamptz{}, err
	}

	return equilibriumTime, nil
}

func NewTransactionService(db SQLDB) *TransactionService {
	return &TransactionService{
		tm:  postgres.NewTransactionModel(db),
		tsm: postgres.NewTransactionsModel(db),
		tim: postgres.NewTransactionItemsModel(db),
		am:  postgres.NewApprovalsModel(db),
	}
}

func BuildTransactions(
	trs types.Transactions,
	trItems types.TransactionItems,
	apprvs types.Approvals,
) types.Transactions {

	for _, v := range trs {
		BuildTransaction(v, trItems, apprvs)
	}

	return trs

}

func BuildTransaction(
	tr *types.Transaction,
	trItems types.TransactionItems,
	apprvs types.Approvals,
) *types.Transaction {

	// attach transaction items to transaction
	AttachTransactionItemsToTransaction(trItems, tr)

	// attach approvals to transaction items
	AttachApprovalsToTransactionItems(apprvs, trItems)

	return tr
}

func AttachApprovalsToTransactionItems(
	apprvs types.Approvals,
	trItems types.TransactionItems,
) {

	for _, ti := range trItems {
		for _, ap := range apprvs {
			if *ap.TransactionItemID == *ti.ID {
				ti.Approvals = append(ti.Approvals, ap)
			}
		}
	}
}

// used when filtering transaction items belonging to multiple transactions
func AttachTransactionItemsToTransaction(
	trItems types.TransactionItems,
	tr *types.Transaction,
) {

	for _, ti := range trItems {
		if *ti.TransactionID == *tr.ID {
			tr.TransactionItems = append(tr.TransactionItems, ti)
		}
	}
}
