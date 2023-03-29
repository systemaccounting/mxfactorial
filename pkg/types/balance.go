package types

import (
	"fmt"

	"github.com/jackc/pgx/v4"
	"github.com/shopspring/decimal"
)

type AccountBalance struct {
	AccountName    *string         `json:"account_name"`
	CurrentBalance decimal.Decimal `json:"current_balance"`
}

func (ab *AccountBalance) ScanRow(row pgx.Row) error {

	err := row.Scan(
		&ab.CurrentBalance,
	)
	if err != nil {
		return fmt.Errorf("AccountBlance Scan row: %v", err)
	}

	return nil
}

type AccountBalances []*AccountBalance

func (abs *AccountBalances) ScanRows(rows pgx.Rows) error {

	defer rows.Close()
	for rows.Next() {

		a := new(AccountBalance)

		err := rows.Scan(
			&a.AccountName,
			&a.CurrentBalance,
		)
		if err != nil {
			return fmt.Errorf("AccountBalances scan rows: %v", err)
		}

		*abs = append(*abs, a)
	}

	return nil
}
