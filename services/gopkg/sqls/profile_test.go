package sqls

import (
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func TestSelectProfileIDsByAccountNames(t *testing.T) {
	testacct := "testacct"
	testaccounts := []string{testacct}
	testbuilder := AccountProfileSQLs{}
	want1 := "SELECT id, account_name FROM account_profile WHERE account_name IN ($1) AND removal_time IS NULL"
	want2 := []interface{}{testacct}
	got1, got2 := testbuilder.SelectProfileIDsByAccountNames(testaccounts)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestInsertAccountProfileSQL(t *testing.T) {
	testacct := "testacct"
	testdesc := "testdesc"
	testfirstname := "testfirstname"
	testmiddlename := "testmiddlename"
	testlastname := "testlastname"
	testcountryname := "testcountryname"
	teststreetnumber := "teststreetnumber"
	teststreetname := "teststreetname"
	testfloornumber := "testfloornumber"
	testunitnumber := "testunitnumber"
	testcityname := "testcityname"
	testcountyname := "testcountyname"
	testregionname := "testregionname"
	teststatename := "teststatename"
	testpostalcode := "testpostalcode"
	testlatlng := types.LatLng("(1,2)")
	testemailaddress := "testemailaddress"
	testtelephonecountrycode := int32(111)
	testtelephoneareacode := int32(222)
	testtelephonenumber := int32(333)
	testoccupationid := int32(1)
	testindustryid := int32(2)
	testprofile := &types.AccountProfile{
		AccountName:          &testacct,
		Description:          &testdesc,
		FirstName:            &testfirstname,
		MiddleName:           &testmiddlename,
		LastName:             &testlastname,
		CountryName:          &testcountryname,
		StreetNumber:         &teststreetnumber,
		StreetName:           &teststreetname,
		FloorNumber:          &testfloornumber,
		UnitNumber:           &testunitnumber,
		CityName:             &testcityname,
		CountyName:           &testcountyname,
		RegionName:           &testregionname,
		StateName:            &teststatename,
		PostalCode:           &testpostalcode,
		Latlng:               &testlatlng,
		EmailAddress:         &testemailaddress,
		TelephoneCountryCode: &testtelephonecountrycode,
		TelephoneAreaCode:    &testtelephoneareacode,
		TelephoneNumber:      &testtelephonenumber,
		OccupationID:         &testoccupationid,
		IndustryID:           &testindustryid,
	}
	testbuilder := AccountProfileSQLs{}
	want1 := "INSERT INTO account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)"
	want2 := []interface{}{
		&testacct,
		&testdesc,
		&testfirstname,
		&testmiddlename,
		&testlastname,
		&testcountryname,
		&teststreetnumber,
		&teststreetname,
		&testfloornumber,
		&testunitnumber,
		&testcityname,
		&testcountyname,
		&testregionname,
		&teststatename,
		&testpostalcode,
		&testlatlng,
		&testemailaddress,
		&testtelephonecountrycode,
		&testtelephoneareacode,
		&testtelephonenumber,
		&testoccupationid,
		&testindustryid,
	}
	got1, got2 := testbuilder.InsertAccountProfileSQL(testprofile)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}
