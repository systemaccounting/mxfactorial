package sqls

import (
	"github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type IAccountProfileSQLS interface {
	SelectProfileIDsByAccountNames([]string) (string, []interface{})
	InsertAccountProfileSQL(*types.AccountProfile) (string, []interface{})
}

type AccountProfileSQLS struct {
	SQLBuilder
}

func (ap *AccountProfileSQLS) SelectProfileIDsByAccountNames(accountNames []string) (string, []interface{}) {
	ap.Init()

	// sqlbuilder wants interface slice
	iAccts := stringToInterfaceSlice(accountNames)

	ap.sb.Select(
		"id",
		"account_name",
	)
	ap.sb.From("account_profile").
		Where(
			ap.sb.In("account_name", iAccts...),
			ap.sb.IsNull("removal_time"),
		)

	return ap.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (ap *AccountProfileSQLS) InsertAccountProfileSQL(p *types.AccountProfile) (string, []interface{}) {
	ap.Init()
	ap.ib.InsertInto("account_profile")
	ap.ib.Cols(
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
	ap.ib.Values(
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
		p.RegionName,
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
	return ap.ib.BuildWithFlavor(sqlbuilder.PostgreSQL)
}
