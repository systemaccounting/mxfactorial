package tools

import (
	"log"
	"strconv"
	"time"

	"github.com/shopspring/decimal"
	"gopkg.in/guregu/null.v4"
)

func Int32PtrToStringPtr(i *int32) *string {
	if i == nil {
		s := ""
		return &s
	}
	s := strconv.Itoa(int(*i))
	return &s
}

// todo: audit removal
func StringPtrToInt32Ptr(s *string) (*int32, error) {
	if s == nil {
		return nil, nil
	}
	if *s == "" {
		return nil, nil
	}
	i, err := strconv.Atoi(*s)
	if err != nil {
		return nil, err
	}
	i32 := int32(i)
	return &i32, nil
}

func StringPtrToInt32(s *string) (int32, error) {
	i, err := strconv.Atoi(*s)
	if err != nil {
		return 0, err
	}
	return int32(i), nil
}

func NullTimeToString(t null.Time) *string {
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
