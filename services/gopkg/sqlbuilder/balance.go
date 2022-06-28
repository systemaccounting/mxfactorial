package sqlbuilder

import (
	gsqlb "github.com/huandu/go-sqlbuilder"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func (b *BuildInsertSQL) InsertAccountBalanceSQL(
	accountName string,
	accountBalance decimal.Decimal,
	account types.ID,
) (string, []interface{}) {
	b.ib.InsertInto("account_balance")
	b.ib.Cols(
		"account_name",
		"current_balance",
		"current_transaction_item_id",
	)
	b.ib.Values(accountName, accountBalance, account)
	return b.ib.BuildWithFlavor(gsqlb.PostgreSQL)
}

func (b *BuildUpdateSQL) UpdateDebitorAccountBalanceSQL(trItem *types.TransactionItem) (string, []interface{}) {
	b.ub.Update("account_balance").
		Set(
			b.ub.Assign("current_balance", trItem.Price.Mul(trItem.Quantity).Neg()),
			b.ub.Assign("current_transaction_item_id", trItem.ID),
		).
		Where(
			b.ub.Equal("account_name", *trItem.Debitor),
		)
	return b.ub.BuildWithFlavor(gsqlb.PostgreSQL)
}

func (b *BuildUpdateSQL) UpdateCreditorAccountBalanceSQL(trItem *types.TransactionItem) (string, []interface{}) {
	b.ub.Update("account_balance").
		Set(
			b.ub.Assign("current_balance", trItem.Price.Mul(trItem.Quantity)),
			b.ub.Assign("current_transaction_item_id", trItem.ID),
		).
		Where(
			b.ub.Equal("account_name", *trItem.Creditor),
		)
	return b.ub.BuildWithFlavor(gsqlb.PostgreSQL)
}

func (b *BuildSelectSQL) SelectCurrentAccountBalanceByAccountNameSQL(
	accountName *string,
) (string, []interface{}) {
	b.sb.Select("current_balance")
	b.sb.From("account_balance").
		Where(
			b.sb.Equal("account_name", *accountName),
		)
	return b.sb.BuildWithFlavor(gsqlb.PostgreSQL)
}

func (b *BuildSelectSQL) SelectAccountBalancesSQL(
	accountNames []interface{},
) (string, []interface{}) {
	b.sb.Select(
		"account_name",
		"current_balance",
	)
	b.sb.From("account_balance").
		Where(
			b.sb.In("account_name", accountNames...),
		)
	return b.sb.BuildWithFlavor(gsqlb.PostgreSQL)
}
