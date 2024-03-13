use crate::time::TZTime;
use async_graphql::SimpleObject;
use async_trait::async_trait;
use serde::Deserialize;
use std::error::Error;
use tokio_postgres::{Row, types::{FromSql, ToSql}};

#[async_trait]
pub trait AccountTrait {
    async fn get_account_profiles(
        &self,
        accounts: Vec<String>,
    ) -> Result<AccountProfiles, Box<dyn Error>>;
    async fn get_approvers_for_account(&self, account: String) -> Vec<String>;
}

#[derive(Eq, PartialEq, Debug, Deserialize, ToSql, FromSql, Clone, SimpleObject)]
#[graphql(rename_fields = "snake_case")]
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
    pub removal_time: Option<TZTime>,
}

impl AccountProfile {
    pub fn get_id(&self) -> Option<String> {
        self.id.clone()
    }
}

impl From<&Row> for AccountProfile {
    fn from(row: &Row) -> Self {
        AccountProfile {
            id: row.get(0),
            account_name: row.get(1),
            description: row.get(2),
            first_name: row.get(3),
            middle_name: row.get(4),
            last_name: row.get(5),
            country_name: row.get(6),
            street_number: row.get(7),
            street_name: row.get(8),
            floor_number: row.get(9),
            unit_number: row.get(10),
            city_name: row.get(11),
            county_name: row.get(12),
            region_name: row.get(13),
            state_name: row.get(14),
            postal_code: row.get(15),
            latlng: row.get(16),
            email_address: row.get(17),
            telephone_country_code: row.get(18),
            telephone_area_code: row.get(19),
            telephone_number: row.get(20),
            occupation_id: row.get(21),
            industry_id: row.get(22),
            removal_time: row.get(23),
        }
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

impl From<Vec<Row>> for AccountProfiles {
    fn from(rows: Vec<Row>) -> Self {
        let mut profiles = AccountProfiles::new();
        for row in rows {
            profiles.add(AccountProfile::from(&row));
        }
        profiles
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_matches_profile_by_account() {
        let test_acct = String::from("GroceryStore");

        let want = AccountProfile {
            id: Some(String::from("7")),
            account_name: test_acct.clone(),
            description: Some(String::from("Sells groceries")),
            first_name: Some(String::from("Grocery")),
            middle_name: None,
            last_name: Some(String::from("Store")),
            country_name: String::from("United States of America"),
            street_number: Some(String::from("8701")),
            street_name: Some(String::from("Lincoln Blvd")),
            floor_number: None,
            unit_number: None,
            city_name: String::from("Los Angeles"),
            county_name: Some(String::from("Los Angeles County")),
            region_name: None,
            state_name: String::from("California"),
            postal_code: String::from("90045"),
            latlng: Some(String::from("(33.958050,-118.418388)")),
            email_address: String::from("grocerystore@address.xz"),
            telephone_country_code: Some(String::from("1")),
            telephone_area_code: Some(String::from("310")),
            telephone_number: Some(String::from("5555555")),
            occupation_id: Some(String::from("11")),
            industry_id: Some(String::from("11")),
            removal_time: None,
        };

        let test_acct_profiles = AccountProfiles(vec![
            AccountProfile {
                id: Some(String::from("11")),
                account_name: String::from("JacobWebb"),
                description: Some(String::from("Soccer coach")),
                first_name: Some(String::from("Jacob")),
                middle_name: Some(String::from("Curtis")),
                last_name: Some(String::from("Webb")),
                country_name: String::from("United States of America"),
                street_number: Some(String::from("205")),
                street_name: Some(String::from("N Mccarran Blvd")),
                floor_number: None,
                unit_number: None,
                city_name: String::from("Sparks"),
                county_name: Some(String::from("Washoe County")),
                region_name: None,
                state_name: String::from("Nevada"),
                postal_code: String::from("89431"),
                latlng: Some(String::from("(39.534552,-119.737825)")),
                email_address: String::from("jacob@address.xz"),
                telephone_country_code: Some(String::from("1")),
                telephone_area_code: Some(String::from("775")),
                telephone_number: Some(String::from("5555555")),
                occupation_id: Some(String::from("7")),
                industry_id: Some(String::from("7")),
                removal_time: None,
            },
            want.clone(),
        ]);

        let got = test_acct_profiles
            .match_profile_by_account(test_acct)
            .unwrap();
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_matches_profile_by_account_with_none() {
        let test_acct_profiles = AccountProfiles(vec![
            AccountProfile {
                id: Some(String::from("11")),
                account_name: String::from("JacobWebb"),
                description: Some(String::from("Soccer coach")),
                first_name: Some(String::from("Jacob")),
                middle_name: Some(String::from("Curtis")),
                last_name: Some(String::from("Webb")),
                country_name: String::from("United States of America"),
                street_number: Some(String::from("205")),
                street_name: Some(String::from("N Mccarran Blvd")),
                floor_number: None,
                unit_number: None,
                city_name: String::from("Sparks"),
                county_name: Some(String::from("Washoe County")),
                region_name: None,
                state_name: String::from("Nevada"),
                postal_code: String::from("89431"),
                latlng: Some(String::from("(39.534552,-119.737825)")),
                email_address: String::from("jacob@address.xz"),
                telephone_country_code: Some(String::from("1")),
                telephone_area_code: Some(String::from("775")),
                telephone_number: Some(String::from("5555555")),
                occupation_id: Some(String::from("7")),
                industry_id: Some(String::from("7")),
                removal_time: None,
            },
            AccountProfile {
                id: Some(String::from("7")),
                account_name: String::from("GroceryStore"),
                description: Some(String::from("Sells groceries")),
                first_name: Some(String::from("Grocery")),
                middle_name: None,
                last_name: Some(String::from("Store")),
                country_name: String::from("United States of America"),
                street_number: Some(String::from("8701")),
                street_name: Some(String::from("Lincoln Blvd")),
                floor_number: None,
                unit_number: None,
                city_name: String::from("Los Angeles"),
                county_name: Some(String::from("Los Angeles County")),
                region_name: None,
                state_name: String::from("California"),
                postal_code: String::from("90045"),
                latlng: Some(String::from("(33.958050,-118.418388)")),
                email_address: String::from("grocerystore@address.xz"),
                telephone_country_code: Some(String::from("1")),
                telephone_area_code: Some(String::from("310")),
                telephone_number: Some(String::from("5555555")),
                occupation_id: Some(String::from("11")),
                industry_id: Some(String::from("11")),
                removal_time: None,
            },
        ]);

        let got = test_acct_profiles.match_profile_by_account(String::from("DoesntExist"));
        let want = None;
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_creates_new_account_profiles() {
        assert_eq!(AccountProfiles::new(), AccountProfiles(vec![]))
    }

    #[test]
    fn it_adds_account_profile() {
        let mut got = AccountProfiles::new();
        let want = AccountProfiles(vec![AccountProfile {
            id: Some(String::from("7")),
            account_name: String::from("GroceryStore"),
            description: Some(String::from("Sells groceries")),
            first_name: Some(String::from("Grocery")),
            middle_name: None,
            last_name: Some(String::from("Store")),
            country_name: String::from("United States of America"),
            street_number: Some(String::from("8701")),
            street_name: Some(String::from("Lincoln Blvd")),
            floor_number: None,
            unit_number: None,
            city_name: String::from("Los Angeles"),
            county_name: Some(String::from("Los Angeles County")),
            region_name: None,
            state_name: String::from("California"),
            postal_code: String::from("90045"),
            latlng: Some(String::from("(33.958050,-118.418388)")),
            email_address: String::from("grocerystore@address.xz"),
            telephone_country_code: Some(String::from("1")),
            telephone_area_code: Some(String::from("310")),
            telephone_number: Some(String::from("5555555")),
            occupation_id: Some(String::from("11")),
            industry_id: Some(String::from("11")),
            removal_time: None,
        }]);
        got.add(want.0[0].clone());
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_implements_from_iterator_on_account_profiles() {
        let want = AccountProfiles(vec![AccountProfile {
            id: Some(String::from("7")),
            account_name: String::from("GroceryStore"),
            description: Some(String::from("Sells groceries")),
            first_name: Some(String::from("Grocery")),
            middle_name: None,
            last_name: Some(String::from("Store")),
            country_name: String::from("United States of America"),
            street_number: Some(String::from("8701")),
            street_name: Some(String::from("Lincoln Blvd")),
            floor_number: None,
            unit_number: None,
            city_name: String::from("Los Angeles"),
            county_name: Some(String::from("Los Angeles County")),
            region_name: None,
            state_name: String::from("California"),
            postal_code: String::from("90045"),
            latlng: Some(String::from("(33.958050,-118.418388)")),
            email_address: String::from("grocerystore@address.xz"),
            telephone_country_code: Some(String::from("1")),
            telephone_area_code: Some(String::from("310")),
            telephone_number: Some(String::from("5555555")),
            occupation_id: Some(String::from("11")),
            industry_id: Some(String::from("11")),
            removal_time: None,
        }]);
        // create iterator
        let test_account_profiles = std::iter::repeat(want.0[0].clone()).take(1);
        // test method
        let got = AccountProfiles::from_iter(test_account_profiles);
        // assert
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
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
            removal_time: None,
        };

        if got != want {
            panic!("got {:#?}, want {:#?}", got, want);
        }
    }
}

#[derive(Eq, PartialEq, Debug, Deserialize)]
pub struct AccountOwner {
    id: String,
    owner_account: String,
    owned_account: String,
    owner_subaccount: String,
    owned_subaccount: String,
    removed_by: String,
    removed_time: Option<TZTime>,
}
