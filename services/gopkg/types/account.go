package types

type AccountProfile struct {
	ID                   *int32  `json:"id"`
	AccountName          *string `json:"account_name"`
	Description          *string `json:"description"`
	FirstName            *string `json:"first_name"`
	MiddleName           *string `json:"middle_name"`
	LastName             *string `json:"last_name"`
	CountryName          *string `json:"country_name"`
	StreetNumber         *string `json:"street_number"`
	StreetName           *string `json:"street_name"`
	FloorNumber          *string `json:"floor_number"`
	UnitNumber           *string `json:"unit_number"`
	CityName             *string `json:"city_name"`
	CountyName           *string `json:"county_name"`
	RegionName           *string `json:"region_name"`
	StateName            *string `json:"state_name"`
	PostalCode           *string `json:"postal_code"`
	Latlng               *string `json:"latlng"`
	EmailAddress         *string `json:"email_address"`
	TelephoneCountryCode *int32  `json:"telephone_country_code"`
	TelephoneAreaCode    *int32  `json:"telephone_area_code"`
	TelephoneNumber      *int32  `json:"telephone_number"`
	OccupationID         *int32  `json:"occupation_id"`
	IndustryID           *int32  `json:"industry_id"`
}
