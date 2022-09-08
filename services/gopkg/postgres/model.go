package postgres

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgtype"
	"github.com/jackc/pgx/v4"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type SQLDB interface {
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Begin(context.Context) (pgx.Tx, error)
	Close(context.Context) error
	IsClosed() bool
}

type IAccountSQL interface {
	InsertAccountSQL(string) (string, []interface{})
	DeleteOwnerAccountSQL(string) (string, []interface{})
	DeleteAccountSQL(string) (string, []interface{})
}

type AccountModel struct {
	db SQLDB
	s  IAccountSQL
}

func (a *AccountModel) InsertAccount(accountName string) error {

	// create sql
	sql, args := a.s.InsertAccountSQL(accountName)

	// query
	_, err := a.db.Exec(context.Background(), sql, args...)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (a *AccountModel) DeleteOwnerAccount(accountName string) error {

	// create sql
	sql, args := a.s.DeleteOwnerAccountSQL(accountName)

	// query
	_, err := a.db.Exec(context.Background(), sql, args...)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (a *AccountModel) DeleteAccount(accountName string) error {

	// create sql
	sql, args := a.s.DeleteAccountSQL(accountName)

	// query
	_, err := a.db.Exec(context.Background(), sql, args...)
	if err != nil {
		return err
	}

	return nil
}

func NewAccountModel(db SQLDB) *AccountModel {
	return &AccountModel{
		db: db,
		s:  sqls.NewAccountSQLs(),
	}
}

type IAccountBalanceSQLs interface {
	SelectAccountBalancesSQL([]string) (string, []interface{})
	SelectCurrentAccountBalanceByAccountNameSQL(string) (string, []interface{})
	InsertAccountBalanceSQL(string, decimal.Decimal, types.ID) (string, []interface{})
	UpdateAccountBalancesSQL(types.TransactionItems) (string, []interface{})
}

type AccountBalanceModel struct {
	db SQLDB
	s  IAccountBalanceSQLs
	types.AccountBalance
}

func (ab *AccountBalanceModel) GetAccountBalance(accountName string) (*types.AccountBalance, error) {

	// create sql
	sql, args := ab.s.SelectCurrentAccountBalanceByAccountNameSQL(accountName)

	// query
	row := ab.db.QueryRow(context.Background(), sql, args...)

	// scan row into struct field
	err := ab.AccountBalance.ScanRow(row)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return &ab.AccountBalance, nil
}

func NewAccountBalanceModel(db SQLDB) *AccountBalanceModel {
	return &AccountBalanceModel{
		db: db,
		s:  sqls.NewAccountBalanceSQLs(),
	}
}

type AccountBalancesModel struct {
	db SQLDB
	s  IAccountBalanceSQLs
	types.AccountBalances
}

func (abs *AccountBalancesModel) GetAccountBalances(accounts []string) (types.AccountBalances, error) {

	// create sql
	sql, args := abs.s.SelectAccountBalancesSQL(accounts)

	// query
	rows, err := abs.db.Query(context.Background(), sql, args...)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// scan rows into struct field
	err = abs.AccountBalances.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return abs.AccountBalances, nil
}

func (abs *AccountBalancesModel) ChangeAccountBalances(trItems types.TransactionItems) error {

	// create sql
	sql, args := abs.s.UpdateAccountBalancesSQL(trItems)

	// query
	_, err := abs.db.Exec(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

// todo: move to AccountBalanceModel
func (abs *AccountBalancesModel) InsertAccountBalance(
	accountName string,
	accountBalance decimal.Decimal,
	account types.ID,
) error {

	// create sql
	sql, args := abs.s.InsertAccountBalanceSQL(
		accountName,
		accountBalance,
		account,
	)

	// query
	_, err := abs.db.Exec(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewAccountBalancesModel(db SQLDB) *AccountBalancesModel {
	return &AccountBalancesModel{
		db: db,
		s:  sqls.NewAccountBalanceSQLs(),
	}
}

type IApprovalSQLs interface {
	InsertApprovalsSQL(types.Approvals, sqls.Builder, sqls.Builder) sqls.Builder
	SelectApprovalsByTrIDSQL(types.ID) (string, []interface{})
	SelectApprovalsByTrIDsSQL(types.IDs) (string, []interface{})
}

type ApprovalsModel struct {
	db SQLDB
	s  IApprovalSQLs
	types.Approvals
}

func (a *ApprovalsModel) GetApprovalsByTransactionID(id types.ID) (types.Approvals, error) {

	// create sql
	sql, args := a.s.SelectApprovalsByTrIDSQL(id)

	// query
	rows, err := a.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// scan rows
	err = a.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return a.Approvals, nil
}

func (a *ApprovalsModel) GetApprovalsByTransactionIDs(IDs types.IDs) (types.Approvals, error) {

	// create sql
	sql, args := a.s.SelectApprovalsByTrIDsSQL(IDs)

	// query
	rows, err := a.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// scan rows
	err = a.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return a.Approvals, nil
}

func (a *ApprovalsModel) UpdateApprovalsByAccountAndRole(
	trID types.ID,
	accountName string,
	accountRole types.Role,
) (pgtype.Timestamptz, error) {

	// begin tx
	dbtx, err := a.db.Begin(context.Background())
	if err != nil {
		logger.Log(logger.Trace(), err)
		return pgtype.Timestamptz{}, err
	}

	defer dbtx.Rollback(context.Background())

	// create sql
	sql := `SELECT approve_all_role_account($1, $2, $3) AS equilibrium_time`
	args := []interface{}{trID, accountName, accountRole}

	// query
	row := dbtx.QueryRow(
		context.Background(),
		sql,
		args...,
	)

	var equilibriumTime pgtype.Timestamptz

	// scan row
	err = row.Scan(&equilibriumTime)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return pgtype.Timestamptz{}, err
	}

	// commit tx
	err = dbtx.Commit(context.Background())
	if err != nil {
		logger.Log(logger.Trace(), err)
		return pgtype.Timestamptz{}, err
	}

	return equilibriumTime, nil
}

func NewApprovalsModel(db SQLDB) *ApprovalsModel {
	return &ApprovalsModel{
		db: db,
		s:  sqls.NewApprovalSQLs(),
	}
}

type IAccountProfileSQLS interface {
	SelectProfileIDsByAccountNames([]string) (string, []interface{})
	InsertAccountProfileSQL(*types.AccountProfile) (string, []interface{})
}

type AccountProfileModel struct {
	db SQLDB
	s  IAccountProfileSQLS
	types.AccountProfile
}

func (ap *AccountProfileModel) GetProfileIDsByAccountNames(
	accountNames []string,
) (types.AccountProfileIDs, error) {

	// create sql
	sql, args := ap.s.SelectProfileIDsByAccountNames(accountNames)

	// query
	rows, err := ap.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// assign account profile ids from db
	var profileIDs types.AccountProfileIDs
	err = profileIDs.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return profileIDs, nil
}

func (ap *AccountProfileModel) InsertAccountProfile(
	accountProfile *types.AccountProfile,
) error {

	// create sql
	sql, args := ap.s.InsertAccountProfileSQL(accountProfile)

	// query
	_, err := ap.db.Exec(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewAccountProfileModel(db SQLDB) *AccountProfileModel {
	return &AccountProfileModel{
		db: db,
		s:  sqls.NewAccountProfileSQLs(),
	}
}

type ITransactionItemSQLs interface {
	InsertTrItemSQL(*types.TransactionItem, sqls.Builder) sqls.Builder
	SelectTrItemsByTrIDSQL(types.ID) (string, []interface{})
	SelectTrItemsByTrIDsSQL(types.IDs) (string, []interface{})
}

type TransactionItemsModel struct {
	db SQLDB
	s  ITransactionItemSQLs
	types.TransactionItems
}

func (t *TransactionItemsModel) GetTrItemsByTransactionID(ID types.ID) (types.TransactionItems, error) {

	// create sql
	sql, args := t.s.SelectTrItemsByTrIDSQL(ID)

	// query
	rows, err := t.db.Query(context.Background(), sql, args...)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		log.Print(err)
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return t.TransactionItems, nil
}

func (t *TransactionItemsModel) GetTrItemsByTrIDs(IDs types.IDs) (types.TransactionItems, error) {

	// create sql
	sql, args := t.s.SelectTrItemsByTrIDsSQL(IDs)

	// query
	rows, err := t.db.Query(context.Background(), sql, args...)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		log.Print(err)
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return t.TransactionItems, nil
}

func NewTransactionItemsModel(db SQLDB) *TransactionItemsModel {
	return &TransactionItemsModel{
		db: db,
		s:  sqls.NewTransactionItemSQLs(),
	}
}

type ITransactionSQLs interface {
	InsertTransactionSQL(*types.ID, *string, *string, *string, types.Role, *string, *decimal.NullDecimal) sqls.Builder
	SelectTransactionByIDSQL(types.ID) (string, []interface{})
	SelectTransactionsByIDsSQL(types.IDs) (string, []interface{})
	UpdateTransactionByIDSQL(*types.ID, string) (string, []interface{})
	CreateTransactionRequestSQL(*types.Transaction) (string, []interface{}, error)
	SelectLastNReqsOrTransByAccount(string, bool, string) (string, []interface{})
}

type TransactionModel struct {
	db SQLDB
	s  ITransactionSQLs
	types.Transaction
}

func (t *TransactionModel) GetTransactionByID(trID types.ID) (*types.Transaction, error) {

	// create sql
	sql, args := t.s.SelectTransactionByIDSQL(trID)

	// query
	row := t.db.QueryRow(
		context.Background(),
		sql,
		args...,
	)

	// scan row
	err := t.ScanRow(row)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return &t.Transaction, nil
}

func (t *TransactionModel) InsertTransactionTx(
	ruleTestedTransaction *types.Transaction,
) (*types.ID, error) {

	// begin tx
	dbtx, err := t.db.Begin(context.Background())
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	defer dbtx.Rollback(context.Background())

	// create sql
	sql, args, err := t.s.CreateTransactionRequestSQL(ruleTestedTransaction)
	if err != nil {
		return nil, fmt.Errorf("%v: %s\n%v", time.Now(), logger.Trace(), err)
	}

	// query
	row := dbtx.QueryRow(
		context.Background(),
		sql,
		args...,
	)

	// scan id
	err = t.ScanID(row)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// commit tx
	err = dbtx.Commit(context.Background())
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return t.ID, nil
}

func NewTransactionModel(db SQLDB) *TransactionModel {
	return &TransactionModel{
		db: db,
		s:  sqls.NewTransactionSQLs(),
	}
}

type TransactionsModel struct {
	db SQLDB
	s  ITransactionSQLs
	types.Transactions
}

func (t *TransactionsModel) GetLastNTransactions(
	accountName string,
	recordLimit string,
) (types.Transactions, error) {

	// create sql
	sql, args := t.s.SelectLastNReqsOrTransByAccount(
		accountName,
		true, // get transactions
		recordLimit,
	)

	// query
	rows, err := t.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return t.Transactions, nil
}

func (t *TransactionsModel) GetLastNRequests(
	accountName string,
	recordLimit string,
) (types.Transactions, error) {

	// create sql
	sql, args := t.s.SelectLastNReqsOrTransByAccount(
		accountName,
		false, // get requests
		recordLimit,
	)

	// query
	rows, err := t.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return t.Transactions, nil
}

func (t *TransactionsModel) GetTransactionsByIDs(trIDs types.IDs) (types.Transactions, error) {

	// create sql
	sql, args := t.s.SelectTransactionsByIDsSQL(trIDs)

	// query
	rows, err := t.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return t.Transactions, nil
}

func NewTransactionsModel(db SQLDB) *TransactionsModel {
	return &TransactionsModel{
		db: db,
		s:  sqls.NewTransactionSQLs(),
	}
}

type IRuleInstanceSQLs interface {
	SelectRuleInstanceSQL(string, string, string, string, string, string) (string, []interface{})
	InsertRuleInstanceSQL(string, string, string, string, string, string) (string, []interface{})
}

type RuleInstanceModel struct {
	db SQLDB
	s  IRuleInstanceSQLs
	types.RuleInstance
}

func (ri *RuleInstanceModel) SelectRuleInstance(
	ruleType,
	ruleName,
	ruleInstanceName,
	accountRole,
	accountName,
	variableValuesArray string,
) error {

	// create sql
	sql, args := ri.s.SelectRuleInstanceSQL(
		ruleType,
		ruleName,
		ruleInstanceName,
		accountRole,
		accountName,
		variableValuesArray,
	)

	// query
	row := ri.db.QueryRow(
		context.Background(),
		sql,
		args...,
	)

	// scan row
	err := ri.ScanRow(row)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (ri *RuleInstanceModel) InsertRuleInstance(
	ruleType,
	ruleName,
	ruleInstanceName,
	accountRole,
	accountName,
	variableValuesArray string,
) error {

	// create sql
	sql, args := ri.s.InsertRuleInstanceSQL(
		ruleType,
		ruleName,
		ruleInstanceName,
		accountRole,
		accountName,
		variableValuesArray,
	)

	// query
	_, err := ri.db.Exec(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (ri *RuleInstanceModel) SelectApproveAllCreditRuleInstance(
	accountName string,
) (*types.RuleInstance, error) {

	// create sql
	sql, args := ri.s.SelectRuleInstanceSQL(
		"approval",
		"approveAnyCreditItem",
		"ApprovalAllCreditRequests",
		"creditor",
		accountName,
		fmt.Sprintf(
			"{\"%s\", \"creditor\", \"%s\"}",
			accountName,
			accountName,
		),
	)

	// query
	row := ri.db.QueryRow(
		context.Background(),
		sql,
		args...,
	)

	// scan row
	err := ri.ScanRow(row)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return &ri.RuleInstance, nil
}

func (ri *RuleInstanceModel) InsertApproveAllCreditRuleInstance(
	accountName string,
) error {

	// create sql
	sql, args := ri.s.InsertRuleInstanceSQL(
		"approval",
		"approveAnyCreditItem",
		"ApprovalAllCreditRequests",
		"creditor",
		accountName,
		fmt.Sprintf(
			"{\"%s\", \"creditor\", \"%s\"}",
			accountName,
			accountName,
		),
	)

	// query
	_, err := ri.db.Exec(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (ri *RuleInstanceModel) InsertApproveAllCreditRuleInstanceIfDoesNotExist(
	accountName string,
) error {

	// test availability of approve all credit rule instance for account
	// create sql
	sql, args := ri.s.SelectRuleInstanceSQL(
		"approval",
		"approveAnyCreditItem",
		"ApprovalAllCreditRequests",
		"creditor",
		accountName,
		fmt.Sprintf(
			"{\"%s\", \"creditor\", \"%s\"}",
			accountName,
			accountName,
		),
	)

	// query
	row := ri.db.QueryRow(
		context.Background(),
		sql,
		args...,
	)

	var testRuleInstance types.RuleInstance
	err := row.Scan(
		&testRuleInstance.RuleType,
		&testRuleInstance.RuleName,
		&testRuleInstance.RuleInstanceName,
		&testRuleInstance.AccountRole,
		&testRuleInstance.AccountName,
		&testRuleInstance.VariableValues,
	)

	if err != nil && err != pgx.ErrNoRows {
		logger.Log(logger.Trace(), err)
		return err
	}
	// insert approve all credit rule instance if not in table
	if err == pgx.ErrNoRows {

		insErr := ri.InsertApproveAllCreditRuleInstance(accountName)
		if insErr != nil {
			logger.Log(logger.Trace(), err)
			return insErr
		}
	}

	return nil
}

func NewRuleInstanceModel(db SQLDB) *RuleInstanceModel {
	return &RuleInstanceModel{
		db: db,
		s:  sqls.NewRuleInstanceSQLs(),
	}
}

type INotificationSQLs interface {
	InsertTransactionNotificationsSQL(types.TransactionNotifications) (string, []interface{})
	SelectTransNotifsByIDsSQL(types.IDs) (string, []interface{})
	DeleteTransNotificationsByIDsSQL(types.IDs) (string, []interface{})
	SelectTransNotifsByAccountSQL(string, int) (string, []interface{})
	DeleteTransNotificationsByTransIDSQL(types.ID) (string, []interface{})
}

type TransactionNotificationModel struct {
	db SQLDB
	s  INotificationSQLs
	types.TransactionNotifications
}

func (t *TransactionNotificationModel) InsertTransactionApprovalNotifications(
	n types.TransactionNotifications,
) (types.IDs, error) {

	// create sql
	sql, args := t.s.InsertTransactionNotificationsSQL(n)

	// query
	rows, err := t.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// scan rows
	err = t.ScanIDs(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return t.TransactionNotifications.ListIDs(), nil
}

func (t *TransactionNotificationModel) SelectTransNotifsByIDs(notifIDs types.IDs) (types.TransactionNotifications, error) {

	// create sql
	sql, args := t.s.SelectTransNotifsByIDsSQL(notifIDs)

	// query
	rows, err := t.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return t.TransactionNotifications, nil
}

func (t *TransactionNotificationModel) SelectTransNotifsByAccount(accountName string, recordLimit int) (types.TransactionNotifications, error) {

	// create sql
	sql, args := t.s.SelectTransNotifsByAccountSQL(accountName, recordLimit)

	// query
	rows, err := t.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return t.TransactionNotifications, nil
}

// a single transaction ID can delete multiple notifications
func (t *TransactionNotificationModel) DeleteTransactionApprovalNotifications(
	trID types.ID,
) error {

	// create sql
	sql, args := t.s.DeleteTransNotificationsByTransIDSQL(trID)

	// query
	_, err := t.db.Exec(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (t *TransactionNotificationModel) DeleteTransNotificationsByIDs(
	notifIDs types.IDs,
) error {

	// create sql
	sql, args := t.s.DeleteTransNotificationsByIDsSQL(notifIDs)

	// query
	_, err := t.db.Exec(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewTransactionNotificationModel(db SQLDB) *TransactionNotificationModel {
	return &TransactionNotificationModel{
		db: db,
		s:  sqls.NewNotificationSQLs(),
	}
}

type IWebsocketSQLs interface {
	InsertWebsocketConnectionSQL(string, int64) (string, []interface{})
	DeleteWebsocketConnectionByConnectionIDSQL(string) (string, []interface{})
	DeleteWebsocketsByConnectionIDsSQL([]string) (string, []interface{})
	SelectWebsocketsByAccountsSQL([]string) (string, []interface{})
	SelectWebsocketByConnectionIDSQL(string) (string, []interface{})
	UpdateWebsocketByConnIDSQL(string, string) (string, []interface{})
}

type WebsocketsModel struct {
	db SQLDB
	s  IWebsocketSQLs
	types.Websockets
}

func (w *WebsocketsModel) UpdateWebsocketByConnID(
	accountName,
	connectionID string,
) error {

	// create sql
	sql, args := w.s.UpdateWebsocketByConnIDSQL(accountName, connectionID)

	// query
	_, err := w.db.Exec(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (w *WebsocketsModel) InsertWebsocketConnection(
	epochCreatedAt int64,
	connectionID string,
) error {

	// create sql
	sql, args := w.s.InsertWebsocketConnectionSQL(connectionID, epochCreatedAt)

	// query
	_, err := w.db.Exec(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (w *WebsocketsModel) DeleteWebsocketConnection(connectionID string) error {

	// create sql
	sql, args := w.s.DeleteWebsocketConnectionByConnectionIDSQL(connectionID)

	// query
	_, err := w.db.Exec(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (w *WebsocketsModel) DeleteWebsocketsByConnectionIDs(connectionIDs []string) error {

	// create sql
	sql, args := w.s.DeleteWebsocketsByConnectionIDsSQL(connectionIDs)

	// query
	_, err := w.db.Exec(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (w *WebsocketsModel) SelectWebsocketsByAccounts(accounts []string) (types.Websockets, error) {

	// create sql
	sql, args := w.s.SelectWebsocketsByAccountsSQL(accounts)

	// query
	rows, err := w.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	// scan rows
	err = w.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return w.Websockets, nil
}

func NewWebsocketsModel(db SQLDB) *WebsocketsModel {
	return &WebsocketsModel{
		db: db,
		s:  sqls.NewWebsocketSQLs(),
	}
}
