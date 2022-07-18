package sqls

import (
	"fmt"
	"strings"

	"github.com/huandu/go-sqlbuilder"
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
	return b.ib.BuildWithFlavor(sqlbuilder.PostgreSQL)
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
	return b.ub.BuildWithFlavor(sqlbuilder.PostgreSQL)
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
	return b.ub.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

// todo: down in make resetdocker

// creates sql for plpgsql function accepting
// variadic "balance_change" composite type parameter
// in migrations/schema/000008_account_balance.up.sql
// e.g. SELECT change_account_balances('(PaulClayton, -10, 8)', '(CharlesPike, -10, 8)', '(JoseGarcia, 20, 8)');
// *exclude single quotes in go -> postgres
func (b *BuildUpdateSQL) UpdateAccountBalancesSQL(trItems []*types.TransactionItem) (string, []interface{}) {
	updSQL := `SELECT change_account_balances(`
	args := []interface{}{}
	paramCount := 1
	for _, v := range trItems {
		// begin creditor composite literal
		updSQL += `(`
		// add creditor account name to sql args
		args = append(args, *v.Creditor)
		// add positional parameter for creditor account name to sql
		updSQL += fmt.Sprintf("$%d", paramCount)
		// increment param counter
		paramCount++
		// comma delimeter in composite literal
		updSQL += `, `
		// add revenue earned by creditor to sql args
		args = append(args, v.Price.Mul(v.Quantity))
		// add positional parameter for revenue earned by creditor
		updSQL += fmt.Sprintf("$%d", paramCount)
		// increment param counter
		paramCount++
		// comma delim in composite literal
		updSQL += `, `
		// add transaction_item.id to sql args
		args = append(args, string(*v.ID))
		// add positional param for transaction_item.id
		updSQL += fmt.Sprintf("$%d", paramCount)
		// increment param counter
		paramCount++
		// end creditor composite literal
		updSQL += `), `
		// begin debitor composite literal
		updSQL += `(`
		args = append(args, *v.Debitor)
		updSQL += fmt.Sprintf("$%d", paramCount)
		paramCount++
		updSQL += `, `
		args = append(args, fmt.Sprintf("-%s", v.Price.Mul(v.Quantity)))
		updSQL += fmt.Sprintf("$%d", paramCount)
		paramCount++
		updSQL += `, `
		args = append(args, string(*v.ID))
		updSQL += fmt.Sprintf("$%d", paramCount)
		paramCount++
		updSQL += `), `
	}
	updSQL = strings.TrimSuffix(updSQL, `, `)
	updSQL += `)`

	return updSQL, args
}

func (b *BuildSelectSQL) SelectCurrentAccountBalanceByAccountNameSQL(
	accountName *string,
) (string, []interface{}) {
	b.sb.Select("current_balance")
	b.sb.From("account_balance").
		Where(
			b.sb.Equal("account_name", *accountName),
		)
	return b.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
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
	return b.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}
