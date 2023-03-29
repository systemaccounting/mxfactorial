use postgres_types::{FromSql, ToSql};
use serde::Deserialize;
use tokio_postgres::Row;

#[derive(Eq, PartialEq, Debug, Deserialize, ToSql, FromSql, Clone)]
pub struct AccountProfile {
    pub id: Option<String>,
    pub account_name: String,
    pub description: Option<String>,
    pub first_name: Option<String>,
    pub middle_name: Option<String>,
    pub last_name: Option<String>,
    pub country_name: String,
    pub street_number: Option<String>,
    pub street_name: Option<String>,
    pub floor_number: Option<String>,
    pub unit_number: Option<String>,
    pub city_name: String,
    pub county_name: Option<String>,
    pub region_name: Option<String>,
    pub state_name: String,
    pub postal_code: String,
    pub latlng: Option<String>,
    pub email_address: String,
    pub telephone_country_code: Option<String>,
    pub telephone_area_code: Option<String>,
    pub telephone_number: Option<String>,
    pub occupation_id: Option<String>,
    pub industry_id: Option<String>,
}

impl AccountProfile {
    pub fn from_row(row: Row) -> Self {
        AccountProfile {
            id: row.get("id"),
            account_name: row.get("account_name"),
            description: row.get("description"),
            first_name: row.get("first_name"),
            middle_name: row.get("middle_name"),
            last_name: row.get("last_name"),
            country_name: row.get("country_name"),
            street_number: row.get("street_number"),
            street_name: row.get("street_name"),
            floor_number: row.get("floor_number"),
            unit_number: row.get("unit_number"),
            city_name: row.get("city_name"),
            county_name: row.get("county_name"),
            region_name: row.get("region_name"),
            state_name: row.get("state_name"),
            postal_code: row.get("postal_code"),
            latlng: row.get("latlng"),
            email_address: row.get("email_address"),
            telephone_country_code: row.get("telephone_country_code"),
            telephone_area_code: row.get("telephone_area_code"),
            telephone_number: row.get("telephone_number"),
            occupation_id: row.get("occupation_id"),
            industry_id: row.get("industry_id"),
        }
    }

    pub fn get_id(&self) -> Option<String> {
        self.id.clone()
    }
}

#[test]
fn it_deserializes_an_account_profile() {
    let got: AccountProfile = serde_json::from_str(
        r#"
		{
			"id": null,
			"account_name": "AaronHill",
			"description": "Shortwave radio operator",
			"first_name": "Aaron",
			"middle_name": "Baker",
			"last_name": "Hill",
			"country_name": "United States of America",
			"street_number": "2344",
			"street_name": "Central Ave",
			"floor_number": null,
			"unit_number": null,
			"city_name": "Billings",
			"county_name": "Yellowstone County",
			"region_name": null,
			"state_name": "Montana",
			"postal_code": "59102",
			"latlng": "(45.769540, -108.575760)",
			"email_address": "aaron@address.xz",
			"telephone_country_code": "1",
			"telephone_area_code": "406",
			"telephone_number": "5555555",
			"occupation_id": "4",
			"industry_id": "4"
		}
		"#,
    )
    .unwrap();

    let want = AccountProfile {
        id: None,
        account_name: String::from("AaronHill"),
        description: Some(String::from("Shortwave radio operator")),
        first_name: Some(String::from("Aaron")),
        middle_name: Some(String::from("Baker")),
        last_name: Some(String::from("Hill")),
        country_name: String::from("United States of America"),
        street_number: Some(String::from("2344")),
        street_name: Some(String::from("Central Ave")),
        floor_number: None,
        unit_number: None,
        city_name: String::from("Billings"),
        county_name: Some(String::from("Yellowstone County")),
        region_name: None,
        state_name: String::from("Montana"),
        postal_code: String::from("59102"),
        latlng: Some(String::from("(45.769540, -108.575760)")),
        email_address: String::from("aaron@address.xz"),
        telephone_country_code: Some(String::from("1")),
        telephone_area_code: Some(String::from("406")),
        telephone_number: Some(String::from("5555555")),
        occupation_id: Some(String::from("4")),
        industry_id: Some(String::from("4")),
    };

    if got != want {
        panic!("got {:#?}, want {:#?}", got, want);
    }
}

#[derive(Eq, PartialEq, Debug, Deserialize, FromSql, ToSql)]
pub struct AccountProfiles (pub Vec<AccountProfile>);

impl AccountProfiles {
    pub fn from_rows(rows: Vec<Row>) -> Self {
        Self (rows
                .into_iter()
                .map(AccountProfile::from_row)
                .collect())
    }

    pub fn match_profile_by_account(&self, account_name: String) -> Option<AccountProfile> {
        for ap in self.0.iter() {
            if ap.account_name == account_name {
                return Some(ap.clone())
            }
        }
        None
    }
}

#[derive(Eq, PartialEq, Debug, Deserialize, FromSql, ToSql)]
pub struct AccountOwner {
    pub owner: String,
    pub account: String,
}

impl AccountOwner {
    pub fn from_row(row: Row) -> Self {
        AccountOwner {
            owner: row.get("owner"),
            account: row.get("account")
        }
    }
}


#[derive(Eq, PartialEq, Debug, Deserialize, FromSql, ToSql)]
pub struct AccountOwners(Vec<AccountOwner>);

impl AccountOwners {
    pub fn from_rows(rows: Vec<Row>) -> Self {
        Self(rows
                .into_iter()
                .map(AccountOwner::from_row)
                .collect())
    }
}