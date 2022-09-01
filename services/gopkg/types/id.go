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
	val, ok := v.(int64)
	if !ok {
		return fmt.Errorf("failed to scan ID var with value: %v", val)
	}
	s := ID(strconv.FormatInt(val, 10))
	*id = s
	return nil
}

type IDs []*ID

func (ids IDs) ScanRows(rows pgx.Rows) error {
	defer rows.Close()

	for rows.Next() {

		ID := new(ID)
		err := rows.Scan(&ID)
		if err != nil {
			return fmt.Errorf("IDs scan: %v", err)
		}

		ids = append(ids, ID)
	}

	err := rows.Err()
	if err != nil {
		return fmt.Errorf("IDs rows: %v ", err)
	}

	return nil
}
