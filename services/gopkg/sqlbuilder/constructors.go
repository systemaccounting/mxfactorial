package sqlbuilder

import (
	gsqlb "github.com/huandu/go-sqlbuilder"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type BuildInsertSQL struct {
	ib *gsqlb.InsertBuilder
}

type InsertSQLBuilder interface {
	gsqlb.Builder
	InsertAccountBalanceSQL(string, decimal.Decimal, types.ID) (string, []interface{})
	InsertAccountSQL(string) (string, []interface{})
	InsertApprovalsSQL(sbc func() SelectSQLBuilder, alias string, approvals []*types.Approval) gsqlb.Builder
	InsertTransactionSQL(*types.ID, *string, *string, *string, types.Role, *string, *string) gsqlb.Builder
	InsertTrItemSQL(sbc func() SelectSQLBuilder, trItem *types.TransactionItem) gsqlb.Builder
	InsertTransactionNotificationSQL([]*types.TransactionNotification) (string, []interface{})
	InsertAccountProfileSQL(*types.AccountProfile) (string, []interface{})
	InsertRuleInstanceSQL(string, string, string, string, string, string) (string, []interface{})
	InsertWebsocketConnectionSQL(string, int64) (string, []interface{})
}

func (b BuildInsertSQL) Build() (string, []interface{}) {
	return b.ib.Build()
}

func (b BuildInsertSQL) BuildWithFlavor(flavor gsqlb.Flavor, initialArg ...interface{}) (string, []interface{}) {
	return b.ib.BuildWithFlavor(flavor, initialArg...)
}

func NewInsertBuilder() InsertSQLBuilder {
	return &BuildInsertSQL{
		ib: gsqlb.NewInsertBuilder(),
	}
}

type BuildUpdateSQL struct {
	ub *gsqlb.UpdateBuilder
}

type UpdateSQLBuilder interface {
	gsqlb.Builder
	UpdateDebitorAccountBalanceSQL(*types.TransactionItem) (string, []interface{})
	UpdateCreditorAccountBalanceSQL(*types.TransactionItem) (string, []interface{})
	UpdateTransactionByIDSQL(*types.ID, string) (string, []interface{})
	UpdateWebsocketByConnIDSQL(string, string) (string, []interface{})
}

func (b BuildUpdateSQL) Build() (string, []interface{}) {
	return b.ub.Build()
}

func (b BuildUpdateSQL) BuildWithFlavor(flavor gsqlb.Flavor, initialArg ...interface{}) (string, []interface{}) {
	return b.ub.BuildWithFlavor(flavor, initialArg...)
}

func NewUpdateBuilder() UpdateSQLBuilder {
	return &BuildUpdateSQL{
		ub: gsqlb.NewUpdateBuilder(),
	}
}

type BuildSelectSQL struct {
	sb *gsqlb.SelectBuilder
}

type SelectSQLBuilder interface {
	gsqlb.Builder
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
	Select(...string) gsqlb.Builder
	From(...string) gsqlb.Builder
}

func (b BuildSelectSQL) Select(col ...string) gsqlb.Builder {
	return b.sb.Select(col...)
}

func (b BuildSelectSQL) From(table ...string) gsqlb.Builder {
	return b.sb.From(table...)
}

func (b BuildSelectSQL) Build() (string, []interface{}) {
	return b.sb.Build()
}

func (b BuildSelectSQL) BuildWithFlavor(flavor gsqlb.Flavor, initialArg ...interface{}) (string, []interface{}) {
	return b.sb.BuildWithFlavor(flavor, initialArg...)
}

func NewSelectBuilder() SelectSQLBuilder {
	return &BuildSelectSQL{
		sb: gsqlb.NewSelectBuilder(),
	}
}

type BuildDeleteSQL struct {
	db *gsqlb.DeleteBuilder
}

type DeleteSQLBuilder interface {
	gsqlb.Builder
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

func (b BuildDeleteSQL) BuildWithFlavor(flavor gsqlb.Flavor, initialArg ...interface{}) (string, []interface{}) {
	return b.db.BuildWithFlavor(flavor, initialArg...)
}

func NewDeleteBuilder() DeleteSQLBuilder {
	return &BuildDeleteSQL{
		db: gsqlb.NewDeleteBuilder(),
	}
}
