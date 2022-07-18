package sqls

import (
	"github.com/huandu/go-sqlbuilder"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type BuildInsertSQL struct {
	ib *sqlbuilder.InsertBuilder
}

type InsertSQLBuilder interface {
	sqlbuilder.Builder
	InsertAccountBalanceSQL(string, decimal.Decimal, types.ID) (string, []interface{})
	InsertAccountSQL(string) (string, []interface{})
	InsertApprovalsSQL(sbc func() SelectSQLBuilder, alias string, approvals []*types.Approval) sqlbuilder.Builder
	InsertTransactionSQL(*types.ID, *string, *string, *string, types.Role, *string, *string) sqlbuilder.Builder
	InsertTrItemSQL(sbc func() SelectSQLBuilder, trItem *types.TransactionItem) sqlbuilder.Builder
	InsertTransactionNotificationSQL([]*types.TransactionNotification) (string, []interface{})
	InsertAccountProfileSQL(*types.AccountProfile) (string, []interface{})
	InsertRuleInstanceSQL(string, string, string, string, string, string) (string, []interface{})
	InsertWebsocketConnectionSQL(string, int64) (string, []interface{})
}

func (b BuildInsertSQL) Build() (string, []interface{}) {
	return b.ib.Build()
}

func (b BuildInsertSQL) BuildWithFlavor(flavor sqlbuilder.Flavor, initialArg ...interface{}) (string, []interface{}) {
	return b.ib.BuildWithFlavor(flavor, initialArg...)
}

func NewInsertBuilder() InsertSQLBuilder {
	return &BuildInsertSQL{
		ib: sqlbuilder.NewInsertBuilder(),
	}
}

type BuildUpdateSQL struct {
	ub *sqlbuilder.UpdateBuilder
}

type UpdateSQLBuilder interface {
	sqlbuilder.Builder
	UpdateDebitorAccountBalanceSQL(*types.TransactionItem) (string, []interface{})
	UpdateCreditorAccountBalanceSQL(*types.TransactionItem) (string, []interface{})
	UpdateAccountBalancesSQL([]*types.TransactionItem) (string, []interface{})
	UpdateTransactionByIDSQL(*types.ID, string) (string, []interface{})
	UpdateWebsocketByConnIDSQL(string, string) (string, []interface{})
}

func (b BuildUpdateSQL) Build() (string, []interface{}) {
	return b.ub.Build()
}

func (b BuildUpdateSQL) BuildWithFlavor(flavor sqlbuilder.Flavor, initialArg ...interface{}) (string, []interface{}) {
	return b.ub.BuildWithFlavor(flavor, initialArg...)
}

func NewUpdateBuilder() UpdateSQLBuilder {
	return &BuildUpdateSQL{
		ub: sqlbuilder.NewUpdateBuilder(),
	}
}

type BuildSelectSQL struct {
	sb *sqlbuilder.SelectBuilder
}

type SelectSQLBuilder interface {
	sqlbuilder.Builder
	SelectApprovalsByTrIDSQL(*types.ID) (string, []interface{})
	SelectApprovalsByTrIDsSQL([]interface{}) (string, []interface{})
	SelectCurrentAccountBalanceByAccountNameSQL(*string) (string, []interface{})
	SelectAccountBalancesSQL([]interface{}) (string, []interface{})
	SelectTransactionByIDSQL(*types.ID) (string, []interface{})
	SelectTransactionsByIDsSQL([]interface{}) (string, []interface{})
	SelectTrItemsByTrIDSQL(*types.ID) (string, []interface{})
	SelectTrItemsByTrIDsSQL([]interface{}) (string, []interface{})
	SelectTransNotifsByIDsSQL([]interface{}) (string, []interface{})
	SelectTransNotifsByAccountSQL(string, int) (string, []interface{})
	SelectProfileIDsByAccount([]interface{}) (string, []interface{})
	SelectRuleInstanceSQL(string, string, string, string, string, string) (string, []interface{})
	SelectWebsocketByAccountsSQL([]interface{}) (string, []interface{})
	SelectWebsocketByConnectionIDSQL(string) (string, []interface{})
	Select(...string) sqlbuilder.Builder
	From(...string) sqlbuilder.Builder
}

func (b BuildSelectSQL) Select(col ...string) sqlbuilder.Builder {
	return b.sb.Select(col...)
}

func (b BuildSelectSQL) From(table ...string) sqlbuilder.Builder {
	return b.sb.From(table...)
}

func (b BuildSelectSQL) Build() (string, []interface{}) {
	return b.sb.Build()
}

func (b BuildSelectSQL) BuildWithFlavor(flavor sqlbuilder.Flavor, initialArg ...interface{}) (string, []interface{}) {
	return b.sb.BuildWithFlavor(flavor, initialArg...)
}

func NewSelectBuilder() SelectSQLBuilder {
	return &BuildSelectSQL{
		sb: sqlbuilder.NewSelectBuilder(),
	}
}

type BuildDeleteSQL struct {
	db *sqlbuilder.DeleteBuilder
}

type DeleteSQLBuilder interface {
	sqlbuilder.Builder
	DeleteOwnerAccountSQL(string) (string, []interface{})
	DeleteAccountSQL(string) (string, []interface{})
	DeleteTransNotificationsByIDSQL([]interface{}) (string, []interface{})
	DeleteTransNotificationsByTransIDSQL(types.ID) (string, []interface{})
	DeleteWebsocketConnectionSQL(string) (string, []interface{})
	DeleteWebsocketsByConnectionIDSQL([]interface{}) (string, []interface{})
}

func (b BuildDeleteSQL) Build() (string, []interface{}) {
	return b.db.Build()
}

func (b BuildDeleteSQL) BuildWithFlavor(flavor sqlbuilder.Flavor, initialArg ...interface{}) (string, []interface{}) {
	return b.db.BuildWithFlavor(flavor, initialArg...)
}

func NewDeleteBuilder() DeleteSQLBuilder {
	return &BuildDeleteSQL{
		db: sqlbuilder.NewDeleteBuilder(),
	}
}
