package types

import (
	"database/sql/driver"
	"errors"

	"github.com/jackc/pgtype"
)

type LatLng string // fmt.Sprintf("(%v,%v)", latitude, longitude)

func (l LatLng) Value() (driver.Value, error) {
	if l == "" {
		return nil, nil
	}
	var latlng pgtype.Point
	err := latlng.Set(string(l))
	if err != nil {
		return nil, err
	}
	return latlng, nil
}

func (l *LatLng) Scan(v interface{}) error {
	var p pgtype.Point
	err := p.Scan(v)
	if err != nil {
		return errors.New("failed to scan LatLng type")
	}
	j, err := p.MarshalJSON()
	if err != nil {
		return errors.New("failed to marshal pgtype.Point")
	}
	*l = LatLng(string(j))
	return nil
}
