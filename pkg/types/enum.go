package types

import (
	"database/sql/driver"
	"fmt"
	"strconv"
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

func isQuoted(s string) bool {
	if len(s) <= 1 {
		return false
	}
	firstChar := s[0]
	lastChar := s[len(s)-1]
	if firstChar == 34 && lastChar == 34 { // double quote char = 34
		return true
	}
	return false
}

func (r Role) MatchString(s string) (Role, error) {
	unquoted := s
	if isQuoted(s) {
		unq, err := strconv.Unquote(s)
		if err != nil {
			return 0, fmt.Errorf("failed to unquote %q", s)

		}
		unquoted = unq
	}
	if unquoted == DB {
		return DEBITOR, nil
	}
	if unquoted == CR {
		return CREDITOR, nil
	}
	return 0, fmt.Errorf("%q neither debitor or creditor", s)
}

func (r *Role) Set(val string) error {
	var err error
	*r, err = r.MatchString(val)
	if err != nil {
		return err
	}
	return nil
}

func (r *Role) UnmarshalJSON(data []byte) error {
	return r.Set(string(data))
}

func (r Role) MarshalJSON() ([]byte, error) {
	quoted := strconv.Quote(r.String())
	return []byte(quoted), nil
}

func (r *Role) Scan(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("failed to scan role with value: %v", str)
	}
	return r.Set(str)
}

func (r *Role) Value() (driver.Value, error) {
	return r.String(), nil
}
