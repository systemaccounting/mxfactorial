package postgres

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgtype"
	"github.com/jackc/pgx/v4"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type AccountModel struct {
	db *DB
	sqls.AccountSQL
}

func (a *AccountModel) InsertAccount(accountName string) error {

	// create sql
	sql, args := a.AccountSQL.InsertAccountSQL(accountName)

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
	sql, args := a.AccountSQL.DeleteOwnerAccountSQL(accountName)

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
	sql, args := a.AccountSQL.DeleteAccountSQL(accountName)

	// query
	_, err := a.db.Exec(context.Background(), sql, args...)
	if err != nil {
		return err
	}

	return nil
}

func NewAccountModel(db *DB) *AccountModel {
	m := new(AccountModel)
	m.db = db
	return m
}

type AccountBalanceModel struct {
	db *DB
	types.AccountBalance
	sqls.AccountBalanceSQLs
}

func (ab *AccountBalanceModel) GetAccountBalance(accountName string) error {

	// create sql
	sql, args := ab.AccountBalanceSQLs.SelectCurrentAccountBalanceByAccountNameSQL(accountName)

	// query
	row := ab.db.QueryRow(context.Background(), sql, args...)

	// scan row into struct field
	err := ab.AccountBalance.ScanRow(row)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewAccountBalanceModel(db *DB) *AccountBalanceModel {
	m := new(AccountBalanceModel)
	m.db = db
	return m
}

type AccountBalancesModel struct {
	db *DB
	types.AccountBalances
	sqls.AccountBalanceSQLs
}

func (abs *AccountBalancesModel) GetAccountBalances(accounts []string) error {

	// create sql
	sql, args := abs.AccountBalanceSQLs.SelectAccountBalancesSQL(accounts)

	// query
	rows, err := abs.db.Query(context.Background(), sql, args...)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// scan rows into struct field
	err = abs.AccountBalances.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (abs *AccountBalancesModel) ChangeAccountBalances(trItems types.TransactionItems) error {

	// create sql
	sql, args := abs.AccountBalanceSQLs.UpdateAccountBalancesSQL(trItems)

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

func (abs *AccountBalancesModel) InsertAccountBalance(
	accountName string,
	accountBalance decimal.Decimal,
	account types.ID,
) error {

	// create sql
	sql, args := abs.AccountBalanceSQLs.InsertAccountBalanceSQL(
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

func NewAccountBalancesModel(db *DB) *AccountBalancesModel {
	m := new(AccountBalancesModel)
	m.db = db
	return m
}

type ApprovalsModel struct {
	db *DB
	types.Approvals
	sqls.ApprovalSQLs
}

func (a *ApprovalsModel) GetApprovalsByTransactionID(id types.ID) error {

	// create sql
	sql, args := a.ApprovalSQLs.SelectApprovalsByTrIDSQL(id)

	// query
	rows, err := a.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// scan rows
	err = a.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (a *ApprovalsModel) GetApprovalsByTransactionIDs(IDs types.IDs) error {

	// create sql
	sql, args := a.ApprovalSQLs.SelectApprovalsByTrIDsSQL(IDs)

	// query
	rows, err := a.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// scan rows
	err = a.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
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

func NewApprovalsModel(db *DB) *ApprovalsModel {
	m := new(ApprovalsModel)
	m.db = db
	return m
}

type AccountProfileModel struct {
	db *DB
	types.AccountProfile
	sqls.AccountProfileSQLS
}

func (ap *AccountProfileModel) GetProfileIDsByAccountNames(
	accountNames []string,
) (types.AccountProfileIDs, error) {

	// create sql
	sql, args := ap.AccountProfileSQLS.SelectProfileIDsByAccountNames(accountNames)

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
	sql, args := ap.AccountProfileSQLS.InsertAccountProfileSQL(accountProfile)

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

func NewAccountProfileModel(db *DB) *AccountProfileModel {
	m := new(AccountProfileModel)
	m.db = db
	return m
}

type TransactionItemsModel struct {
	db *DB
	types.TransactionItems
	sqls.TransactionItemSQLs
}

func (t *TransactionItemsModel) GetTrItemsByTransactionID(ID types.ID) error {

	// create sql
	sql, args := t.TransactionItemSQLs.SelectTrItemsByTrIDSQL(ID)

	// query
	rows, err := t.db.Query(context.Background(), sql, args...)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		log.Print(err)
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (t *TransactionItemsModel) GetTrItemsByTrIDs(IDs types.IDs) error {

	// create sql
	sql, args := t.TransactionItemSQLs.SelectTrItemsByTrIDsSQL(IDs)

	// query
	rows, err := t.db.Query(context.Background(), sql, args...)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		log.Print(err)
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewTransactionItemsModel(db *DB) *TransactionItemsModel {
	m := new(TransactionItemsModel)
	m.db = db
	return m
}

type TransactionModel struct {
	db *DB
	types.Transaction
	sqls.TransactionSQLs
}

func (t *TransactionModel) GetTransactionByID(trID types.ID) error {

	// create sql
	sql, args := t.TransactionSQLs.SelectTransactionByIDSQL(trID)

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
		return err
	}

	return nil
}

func (t *TransactionModel) InsertTransactionTx(
	ruleTestedTransaction *types.Transaction,
) error {

	// begin tx
	dbtx, err := t.db.Begin(context.Background())
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	defer dbtx.Rollback(context.Background())

	// create sql
	sql, args, err := t.TransactionSQLs.CreateTransactionRequestSQL(ruleTestedTransaction)
	if err != nil {
		return fmt.Errorf("%v: %s\n%v", time.Now(), logger.Trace(), err)
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
		return err
	}

	// commit tx
	err = dbtx.Commit(context.Background())
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewTransactionModel(db *DB) *TransactionModel {
	m := new(TransactionModel)
	m.db = db
	return m
}

type TransactionsModel struct {
	db *DB
	types.Transactions
	sqls.TransactionSQLs
}

func (t *TransactionsModel) GetLastNTransactions(
	accountName string,
	recordLimit string,
) error {

	// create sql
	sql, args := t.TransactionSQLs.SelectLastNReqsOrTransByAccount(
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
		return err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (t *TransactionsModel) GetLastNRequests(
	accountName string,
	recordLimit string,
) error {

	// create sql
	sql, args := t.TransactionSQLs.SelectLastNReqsOrTransByAccount(
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
		return err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (t *TransactionsModel) GetTransactionsByIDs(trIDs types.IDs) error {

	// create sql
	sql, args := t.TransactionSQLs.SelectTransactionsByIDsSQL(trIDs)

	// query
	rows, err := t.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewTransactionsModel(db *DB) *TransactionsModel {
	m := new(TransactionsModel)
	m.db = db
	return m
}

type RuleInstanceModel struct {
	db *DB
	types.RuleInstance
	sqls.RuleInstanceSQLs
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
	sql, args := ri.RuleInstanceSQLs.SelectRuleInstanceSQL(
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
	sql, args := ri.RuleInstanceSQLs.InsertRuleInstanceSQL(
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
) error {

	// create sql
	sql, args := ri.RuleInstanceSQLs.SelectRuleInstanceSQL(
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
		return err
	}

	return nil
}

func (ri *RuleInstanceModel) InsertApproveAllCreditRuleInstance(
	accountName string,
) error {

	// create sql
	sql, args := ri.RuleInstanceSQLs.InsertRuleInstanceSQL(
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
	sql, args := ri.RuleInstanceSQLs.SelectRuleInstanceSQL(
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

func NewRuleInstanceModel(db *DB) *RuleInstanceModel {
	m := new(RuleInstanceModel)
	m.db = db
	return m
}

type TransactionNotificationModel struct {
	db *DB
	types.TransactionNotifications
	sqls.NotificationSQLs
}

func (t *TransactionNotificationModel) InsertTransactionApprovalNotifications(
	n types.TransactionNotifications,
) error {

	// create sql
	sql, args := t.NotificationSQLs.InsertTransactionNotificationsSQL(n)

	// query
	rows, err := t.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (t *TransactionNotificationModel) SelectTransNotifsByIDs(notifIDs types.IDs) error {

	// create sql
	sql, args := t.NotificationSQLs.SelectTransNotifsByIDsSQL(notifIDs)

	// query
	rows, err := t.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (t *TransactionNotificationModel) SelectTransNotifsByAccount(accountName string, recordLimit int) error {

	// create sql
	sql, args := t.NotificationSQLs.SelectTransNotifsByAccountSQL(accountName, recordLimit)

	// query
	rows, err := t.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// scan rows
	err = t.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

// a single transaction ID can delete multiple notifications
func (t *TransactionNotificationModel) DeleteTransactionApprovalNotifications(
	trID types.ID,
) error {

	// create sql
	sql, args := t.NotificationSQLs.DeleteTransNotificationsByTransIDSQL(trID)

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
	sql, args := t.NotificationSQLs.DeleteTransNotificationsByIDsSQL(notifIDs)

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

func NewTransactionNotificationModel(db *DB) *TransactionNotificationModel {
	m := new(TransactionNotificationModel)
	m.db = db
	return m
}

type WebsocketsModel struct {
	db *DB
	types.Websockets
	sqls.WebsocketSQLs
}

func (w *WebsocketsModel) UpdateWebsocketByConnID(
	accountName,
	connectionID string,
) error {

	// create sql
	sql, args := w.WebsocketSQLs.UpdateWebsocketByConnIDSQL(accountName, connectionID)

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
	sql, args := w.WebsocketSQLs.InsertWebsocketConnectionSQL(connectionID, epochCreatedAt)

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
	sql, args := w.WebsocketSQLs.DeleteWebsocketConnectionByConnectionIDSQL(connectionID)

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
	sql, args := w.WebsocketSQLs.DeleteWebsocketsByConnectionIDsSQL(connectionIDs)

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

func (w *WebsocketsModel) SelectWebsocketsByAccounts(accounts []string) error {

	// create sql
	sql, args := w.WebsocketSQLs.SelectWebsocketsByAccountsSQL(accounts)

	// query
	rows, err := w.db.Query(
		context.Background(),
		sql,
		args...,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// scan rows
	err = w.ScanRows(rows)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewWebsocketsModel(db *DB) *WebsocketsModel {
	m := new(WebsocketsModel)
	m.db = db
	return m
}
