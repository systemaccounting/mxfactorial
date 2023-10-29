use async_trait::async_trait;
use postgres_types::{FromSql, ToSql};
use serde::Deserialize;
use std::error::Error;

#[async_trait]
pub trait AccountTrait {
    async fn get_account_profiles(
        &self,
        accounts: Vec<String>,
    ) -> Result<AccountProfiles, Box<dyn Error>>;
    async fn get_approvers_for_account(&self, account: String) -> Vec<String>;
}

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
    pub fn get_id(&self) -> Option<String> {
        self.id.clone()
    }
}

#[derive(Eq, PartialEq, Debug, Deserialize, FromSql, ToSql)]
pub struct AccountProfiles(pub Vec<AccountProfile>);

impl AccountProfiles {
    pub fn match_profile_by_account(&self, account_name: String) -> Option<AccountProfile> {
        for ap in self.0.iter() {
            if ap.account_name == account_name {
                return Some(ap.clone());
            }
        }
        None
    }

    fn new() -> Self {
        AccountProfiles(vec![])
    }

    fn add(&mut self, elem: AccountProfile) {
        self.0.push(elem)
    }
}

impl Default for AccountProfiles {
    #[cfg(not(tarpaulin_include))]
    fn default() -> Self {
        Self::new()
    }
}

impl FromIterator<AccountProfile> for AccountProfiles {
    fn from_iter<T: IntoIterator<Item = AccountProfile>>(iter: T) -> Self {
        let mut profiles = AccountProfiles::new();
        for i in iter {
            profiles.add(i);
        }
        profiles
    }
}

#[cfg(test)]
mod tests {
    use super::*;

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
}
