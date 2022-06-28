package sqlbuilder

import (
	gsqlb "github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func (b *BuildSelectSQL) SelectProfileIDsByAccount(accountNames []interface{}) (string, []interface{}) {
	b.sb.Select(
		"id",
		"account_name",
	)
	b.sb.From("account_profile").
		Where(
			b.sb.In("account_name", accountNames...),
			b.sb.IsNull("removal_time"),
		)
	return b.sb.BuildWithFlavor(gsqlb.PostgreSQL)
}

func (b *BuildInsertSQL) InsertAccountProfileSQL(p *types.AccountProfile) (string, []interface{}) {
	b.ib.InsertInto("account_profile")
	b.ib.Cols(
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
	b.ib.Values(
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
	return b.ib.BuildWithFlavor(gsqlb.PostgreSQL)
}
