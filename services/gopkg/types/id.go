package types

import (
	"database/sql/driver"
	"fmt"
	"strconv"

	"github.com/jackc/pgx/v4"
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

func (id *ID) Unmarshal(r pgx.Row) error {
	err := r.Scan(id)
	if err != nil {
		return fmt.Errorf("unmarshal id error: %v", err)
	}
	return nil
}

type IDs []*ID

func (ids IDs) Unmarshal(r pgx.Rows) error {
	// https://github.com/jackc/pgx/blob/909b81a16372d7e2574b2b11e8993895bdd5a065/conn.go#L676-L677
	defer r.Close()
	for r.Next() {
		var ID *ID
		err := r.Scan(ID)
		if err != nil {
			return fmt.Errorf("unmarshal IDs error: %v", err)
		}
		ids = append(ids, ID)
	}
	err := r.Err()
	if err != nil {
		return fmt.Errorf("scan rows for IDs error: %v ", err)
	}
	return nil
}
