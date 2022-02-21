package types

import (
	"fmt"
)

type Role int

const (
	DEBITOR  Role = 0
	CREDITOR Role = 1
)

func (r Role) String() string {
	return [...]string{"debitor", "creditor"}[r]
}

func (r Role) Set(val string) error {
	if val == "debtior" {
		r = DEBITOR
	} else if val == "creditor" {
		r = CREDITOR
	} else {
		return fmt.Errorf("%q neither debitor or creditor", val)
	}
	return nil
}
