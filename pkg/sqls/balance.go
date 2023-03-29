package sqls

import (
	"fmt"
	"strings"

	"github.com/huandu/go-sqlbuilder"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

type AccountBalanceSQLs struct {
	SQLBuilder
}

func (ab *AccountBalanceSQLs) SelectAccountBalancesSQL(
	accountNames []string,
) (string, []interface{}) {
	ab.Init()

	// sqlbuilder wants interface slice
	accts := stringToInterfaceSlice(accountNames)

	ab.sb.Select(
		"account_name",
		"current_balance",
	)

	ab.sb.From("account_balance").
		Where(
			ab.sb.In("account_name", accts...),
		)

	return ab.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (ab *AccountBalanceSQLs) SelectCurrentAccountBalanceByAccountNameSQL(
	accountName string,
) (string, []interface{}) {
	ab.Init()

	ab.sb.Select("current_balance")
	ab.sb.From("account_balance").
		Where(
			ab.sb.Equal("account_name", accountName),
		)

	return ab.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (ab *AccountBalanceSQLs) InsertAccountBalanceSQL(
	accountName string,
	accountBalance decimal.Decimal,
	account types.ID,
) (string, []interface{}) {
	ab.Init()
	ab.ib.InsertInto("account_balance")
	ab.ib.Cols(
		"account_name",
		"current_balance",
		"current_transaction_item_id",
	)
	ab.ib.Values(accountName, accountBalance, account)
	return ab.ib.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (ab *AccountBalanceSQLs) UpdateDebitorAccountBalanceSQL(trItem *types.TransactionItem) (string, []interface{}) {
	ab.Init()
	ab.ub.Update("account_balance").
		Set(
			ab.ub.Assign("current_balance", trItem.Price.Mul(trItem.Quantity).Neg()),
			ab.ub.Assign("current_transaction_item_id", trItem.ID),
		).
		Where(
			ab.ub.Equal("account_name", *trItem.Debitor),
		)
	return ab.ub.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (ab *AccountBalanceSQLs) UpdateCreditorAccountBalanceSQL(trItem *types.TransactionItem) (string, []interface{}) {
	ab.Init()
	ab.ub.Update("account_balance").
		Set(
			ab.ub.Assign("current_balance", trItem.Price.Mul(trItem.Quantity)),
			ab.ub.Assign("current_transaction_item_id", trItem.ID),
		).
		Where(
			ab.ub.Equal("account_name", *trItem.Creditor),
		)
	return ab.ub.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

// creates sql for plpgsql function accepting
// variadic "balance_change" composite type parameter
// in migrations/schema/000008_account_balance.up.sql
// e.g. SELECT change_account_balances('(PaulClayton, -10, 8)', '(CharlesPike, -10, 8)', '(JoseGarcia, 20, 8)');
// *exclude single quotes in go -> postgres
func (AccountBalanceSQLs) UpdateAccountBalancesSQL(trItems types.TransactionItems) (string, []interface{}) {

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
		args = append(args, v.Price.Mul(v.Quantity).Neg())
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

func NewAccountBalanceSQLs() *AccountBalanceSQLs {
	return new(AccountBalanceSQLs)
}
