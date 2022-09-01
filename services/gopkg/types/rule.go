package types

import (
	"fmt"

	"github.com/jackc/pgx/v4"
	"github.com/shopspring/decimal"
)

type Rule struct {
	Name          *string
	VariableNames []*string
	CreatedAt     *TZTime
}

type RuleInstance struct {
	ID                   *ID
	RuleType             *string
	RuleName             *string
	RuleInstanceName     *string
	VariableValues       []*string
	AccountRole          Role
	ItemID               *ID
	Price                decimal.NullDecimal
	Quantity             decimal.NullDecimal
	UnitOfMeasurement    *string
	UnitsMeasured        decimal.NullDecimal
	AccountName          *string
	FirstName            *string
	MiddleName           *string
	LastName             *string
	CountryName          *string
	StreetNumber         *string
	StreetName           *string
	FloorNumber          *string
	UnitNumber           *string
	CityName             *string
	CountyName           *string
	RegionName           *string
	StateName            *string
	PostalCode           *string
	Latlng               *LatLng
	EmailAddress         *string
	TelephoneCountryCode *int32
	TelephoneAreaCode    *int32
	TelephoneNumber      *int32
	OccupationID         *int32
	IndustryID           *int32
	DisabledTime         *TZTime
	RemovedTime          *TZTime
	CreatedAt            *TZTime
}

func (ri *RuleInstance) ScanRow(row pgx.Row) error {

	// only scanning currently used columns, see rule_instance.go in sqls package
	err := row.Scan(
		&ri.RuleType,
		&ri.RuleName,
		&ri.RuleInstanceName,
		&ri.VariableValues,
		&ri.AccountRole,
		&ri.AccountName,
	)
	if err != nil {
		return fmt.Errorf("RuleInstance Scan row: %v", err)
	}

	return nil
}
