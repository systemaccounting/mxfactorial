package sqlbuilder

import (
	sqlb "github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func SelectProfileIDsByAccount(accountNames []interface{}) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select(
		"id",
		"account_name",
	)
	sb.From("account_profile").
		Where(
			sb.In("account_name", accountNames...),
			sb.IsNull("removal_time"),
		)
	return sb.Build()
}

func InsertAccountProfileSQL(p *types.AccountProfile) (string, []interface{}) {
	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("account_profile")
	ib.Cols(
		"account_name",
		"description",
		"first_name",
		"middle_name",
		"last_name",
		"country_name",
		"street_number",
		"street_name",
		"floor_number",
		"unit_number",
		"city_name",
		"county_name",
		"region_name",
		"state_name",
		"postal_code",
		"latlng",
		"email_address",
		"telephone_country_code",
		"telephone_area_code",
		"telephone_number",
		"occupation_id",
		"industry_id",
	)
	ib.Values(
		p.AccountName,
		p.Description,
		p.FirstName,
		p.MiddleName,
		p.LastName,
		p.CountryName,
		p.StreetNumber,
		p.StreetName,
		p.FloorNumber,
		p.UnitNumber,
		p.CityName,
		p.CountyName,
		NullSQLFromStrPtr(p.RegionName),
		p.StateName,
		p.PostalCode,
		p.Latlng,
		p.EmailAddress,
		p.TelephoneCountryCode,
		p.TelephoneAreaCode,
		p.TelephoneNumber,
		p.OccupationID,
		p.IndustryID,
	)
	return ib.Build()
}
