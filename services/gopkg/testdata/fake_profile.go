package testdata

import (
	"fmt"
	"math/rand"
	"strconv"
	"unicode"

	rd "github.com/Pallinder/go-randomdata"
	"github.com/bxcodec/faker/v3"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type FakerValues struct {
	Description string  `faker:"sentence"`
	MiddleName  string  `faker:"last_name"`
	Email       string  `faker:"email"`
	Latitude    float32 `faker:"lat"`
	Longitude   float32 `faker:"long"`
}

func randomNumber(min, max int) int {
	return rand.Intn(max-min) + min
}

func GuessFirstAndLastNames(account string) (firstName, lastName string) {
	rem := account[1:]
	nextCapitalLetterIndex := 0
	for i, v := range rem {
		if unicode.IsUpper(v) {
			nextCapitalLetterIndex = i + 1
		}
	}
	if nextCapitalLetterIndex == 0 {
		nextCapitalLetterIndex = len(account) / 2
	}
	firstName = account[0:nextCapitalLetterIndex]
	lastName = account[nextCapitalLetterIndex:]
	return firstName, lastName
}

func CreateFakeProfile(accountName, firstName, lastName string) types.AccountProfile {
	f := FakerValues{}
	err := faker.FakeData(&f)
	if err != nil {
		fmt.Println(err)
	}
	testAccount := accountName
	description := f.Description[0 : len(f.Description)-1]
	middleName := f.MiddleName
	countryName := "United States of America"
	streetNumber := strconv.Itoa(randomNumber(1, 1000))
	streetName := rd.StreetForCountry("US")
	floorNumber := strconv.Itoa(randomNumber(1, 20))
	unitNumber := strconv.Itoa(randomNumber(1, 100))
	cityName := rd.City()
	countyName := fmt.Sprintf("%s County", cityName)
	region := ""
	stateName := rd.State(rd.Large)
	postalCode := rd.PostalCode("US")
	latLng := fmt.Sprintf("(%v, %v)", f.Latitude, f.Longitude)
	emailAddress := f.Email
	teleCountryCode := int32(1)
	teleAreaCode := int32(randomNumber(100, 999))
	teleNumber := int32(randomNumber(1000000, 9999999))
	occID := int32(randomNumber(1, 12))
	indID := int32(randomNumber(1, 11))

	profile := types.AccountProfile{
		AccountName:          &testAccount,
		Description:          &description,
		FirstName:            &firstName,
		MiddleName:           &middleName,
		LastName:             &lastName,
		CountryName:          &countryName,
		StreetNumber:         &streetNumber,
		StreetName:           &streetName,
		FloorNumber:          &floorNumber,
		UnitNumber:           &unitNumber,
		CityName:             &cityName,
		CountyName:           &countyName,
		RegionName:           &region,
		StateName:            &stateName,
		PostalCode:           &postalCode,
		Latlng:               &latLng,
		EmailAddress:         &emailAddress,
		TelephoneCountryCode: &teleCountryCode,
		TelephoneAreaCode:    &teleAreaCode,
		TelephoneNumber:      &teleNumber,
		OccupationID:         &occID,
		IndustryID:           &indID,
	}
	return profile
}
