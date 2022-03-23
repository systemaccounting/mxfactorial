package tools

import (
	"log"
	"time"

	"github.com/shopspring/decimal"
	"gopkg.in/guregu/null.v4"
)

func NullTimeToStringPtr(t null.Time) *string {
	pgTime := t.ValueOrZero()
	if pgTime.IsZero() {
		return nil
	}
	f := pgTime.UTC().Format("2006-01-02T15:04:05.000000Z")
	return &f
}

func NullDecimalToString(n decimal.NullDecimal) string {
	if n.Valid {
		return n.Decimal.String()
	}
	return ""
}

func ConvertPGTimeToGo(pgTime *string) (*time.Time, error) {
	t, err := time.Parse(time.RFC3339, *pgTime)
	if err != nil {
		log.Print(err)
		return nil, err
	}
	return &t, nil
}
