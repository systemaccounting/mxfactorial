package tools

import (
	"testing"
	"time"

	"github.com/shopspring/decimal"
	"gopkg.in/guregu/null.v4"
)

func TestNullTimeToStringPtr(t *testing.T) {
	now := time.Now()
	nullTime := null.NewTime(now, true)
	got := NullTimeToStringPtr(nullTime)
	want := now.UTC().Format("2006-01-02T15:04:05.000000Z")
	if *got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestNullTimeToStringPtrNil(t *testing.T) {
	got := NullTimeToStringPtr(null.Time{})
	if got != nil {
		t.Errorf("got %v, want nil", got)
	}
}

func TestNullDecimalToStringNull(t *testing.T) {
	nullDecimal := decimal.NullDecimal{}
	got := NullDecimalToString(nullDecimal)
	want := ""
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestNullDecimalToString(t *testing.T) {
	const price string = "21.8"
	d, err := decimal.NewFromString(price)
	if err != nil {
		t.Fatalf("create decimal fail: %v", err)
	}
	n := decimal.NewNullDecimal(d)
	got := NullDecimalToString(n)
	want := price
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestConvertPGTimeToGo(t *testing.T) {
	pgTime := "2022-03-19T01:09:21.614577Z"
	got, err := ConvertPGTimeToGo(&pgTime)
	if err != nil {
		t.Fatalf("convert fail: %v", err)
	}
	want, err := time.Parse(time.RFC3339, pgTime)
	if err != nil {
		t.Fatalf("time parse fail: %v", err)
	}
	if *got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}
