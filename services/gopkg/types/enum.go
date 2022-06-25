package types

import (
	"fmt"
)

type Role int

const (
	DEBITOR Role = iota
	CREDITOR
)

var (
	DB string = "debitor"
	CR        = "creditor"
)

func (r Role) String() string {
	return [...]string{DB, CR}[r]
}

func (r *Role) Set(val string) error {
	if val == DB {
		*r = DEBITOR
		return nil
	}
	if val == CR {
		*r = CREDITOR
		return nil
	}
	return fmt.Errorf("%q neither debitor or creditor", val)
}
