package sqlbuilder

import (
	sqlb "github.com/huandu/go-sqlbuilder"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func InsertAccountBalanceSQL(
	accountName string,
	accountBalance decimal.Decimal,
	account types.ID,
) (string, []interface{}) {
	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("account_balance")
	ib.Cols(
		"account_name",
		"current_balance",
		"current_transaction_item_id",
	)
	ib.Values(accountName, accountBalance, account)
	return ib.Build()
}

func UpdateDebitorAccountBalanceSQL(trItem *types.TransactionItem) (string, []interface{}) {
	ub := sqlb.PostgreSQL.NewUpdateBuilder()
	ub.Update("account_balance").
		Set(
			ub.Assign("current_balance", trItem.Price.Mul(trItem.Quantity).Neg()),
			ub.Assign("current_transaction_item_id", trItem.ID),
		).
		Where(
			ub.Equal("account_name", *trItem.Debitor),
		)
	return ub.Build()
}

func UpdateCreditorAccountBalanceSQL(trItem *types.TransactionItem) (string, []interface{}) {
	ub := sqlb.PostgreSQL.NewUpdateBuilder()
	ub.Update("account_balance").
		Set(
			ub.Assign("current_balance", trItem.Price.Mul(trItem.Quantity)),
			ub.Assign("current_transaction_item_id", trItem.ID),
		).
		Where(
			ub.Equal("account_name", *trItem.Creditor),
		)
	return ub.Build()
}

func SelectCurrentAccountBalanceByAccountNameSQL(
	accountName *string,
) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select("current_balance")
	sb.From("account_balance").
		Where(
			sb.Equal("account_name", *accountName),
		)
	return sb.Build()
}
