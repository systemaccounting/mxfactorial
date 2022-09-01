package types

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/jackc/pgtype"
)

const MILLI_TZ_FORMAT = "2006-01-02T15:04:05.000Z"

type TZTime struct {
	time.Time
}

func (tz TZTime) Value() (driver.Value, error) {
	if tz.IsZero() {
		return nil, nil
	}
	var t pgtype.Timestamptz
	t.Set(tz.Time)
	return t.Value()
}

func (tz *TZTime) Scan(v interface{}) error {
	var t pgtype.Timestamptz
	err := t.Scan(v)
	if err != nil {
		return fmt.Errorf("TZTime failed to scan pgtype.Timestamptz %v", err)
	}
	tz.Time = t.Time
	return nil
}

// didnt move to ../postgres, promoted?
func (tz *TZTime) UnmarshalJSON(b []byte) error {

	s, err := strconv.Unquote(string(b))
	if err != nil {
		return fmt.Errorf("TZTime UnmarshalJSON unquote error: %v", err)
	}

	t, err := time.Parse(MILLI_TZ_FORMAT, s)
	if err != nil {
		return fmt.Errorf("TZTime UnmarshalJSON parse error: %v", err)
	}

	tz.Time = t

	return nil
}

func (tz TZTime) MarshalJSON() ([]byte, error) {
	if tz.IsZero() {
		j, err := json.Marshal(nil)
		if err != nil {
			return nil, fmt.Errorf("TZTime MarshalJSON nil: %v", err)
		}
		return j, nil
	}
	unQuotedTime := tz.Time.Format(MILLI_TZ_FORMAT)
	t := strconv.Quote(unQuotedTime)
	return []byte(t), nil
}
