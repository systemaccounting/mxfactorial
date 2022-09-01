package types

import (
	"github.com/jackc/pgx/v4"
	"github.com/shopspring/decimal"
)

type IScanRow interface {
	ScanRow(pgx.Row) error
}

type IScanRows interface {
	ScanRows(pgx.Rows) error
}

type TrItemListHelper interface {
	MapDebitorsToRequiredFunds() map[string]decimal.Decimal
	ListUniqueDebitorAccountsFromTrItems() []string
	ListUniqueAccountsFromTrItems() []interface{}
}
