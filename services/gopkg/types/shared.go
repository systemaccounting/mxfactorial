package types

import (
	"database/sql/driver"
	"fmt"
	"strconv"
)

type ID string

func (id *ID) Value() (driver.Value, error) {
	if id == nil {
		return nil, nil
	}
	if *id == "" {
		return nil, nil
	}
	s := string(*id)
	i, err := strconv.Atoi(s)
	if err != nil {
		return nil, err
	}
	i32 := int32(i)
	return &i32, nil
}

func (id *ID) Scan(v interface{}) error {
	if v == nil {
		*id = ID("")
		return nil
	}
	switch val := v.(type) {
	case int:
		s := strconv.Itoa(val)
		*id = ID(s)
		return nil
	case int32:
		i := int(val)
		s := strconv.Itoa(i)
		*id = ID(s)
		return nil
	case int64: // listing int32,int64 together returns "need type assertion" error
		i := int(val)
		s := strconv.Itoa(i)
		*id = ID(s)
		return nil
	default:
		return fmt.Errorf("failed to scan ID var with value: %v", val)
	}
}
