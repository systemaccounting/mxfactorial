use crate::account_role::AccountRole;
use crate::time::TZTime;
use async_graphql::SimpleObject;
use async_trait::async_trait;
#[allow(unused_imports)]
use chrono::{DateTime, Utc};
use postgres_types::{FromSql, ToSql};
use serde::{Deserialize, Serialize};
use tokio_postgres::Row;

#[async_trait]
pub trait RuleInstanceTrait {
    async fn get_profile_state_rule_instances(
        &self,
        account_role: AccountRole,
        state_name: String,
    ) -> RuleInstances;
    async fn get_rule_instances_by_type_role_account(
        &self,
        account_role: AccountRole,
        account: String,
    ) -> RuleInstances;
    async fn get_approval_rule_instances(
        &self,
        account_role: AccountRole,
        account: String,
    ) -> RuleInstances;
}

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone, SimpleObject)]
#[graphql(rename_fields = "snake_case")]
pub struct RuleInstance {
    pub id: Option<String>,
    pub rule_type: String,
    pub rule_name: String,
    pub rule_instance_name: String,
    pub variable_values: Vec<String>,
    pub account_role: AccountRole,
    pub item_id: Option<String>,
    pub price: Option<String>,
    pub quantity: Option<String>,
    pub unit_of_measurement: Option<String>,
    pub units_measured: Option<String>,
    pub account_name: Option<String>,
    pub first_name: Option<String>,
    pub middle_name: Option<String>,
    pub last_name: Option<String>,
    pub country_name: Option<String>,
    pub street_id: Option<String>,
    pub street_name: Option<String>,
    pub floor_number: Option<String>,
    pub unit_id: Option<String>,
    pub city_name: Option<String>,
    pub county_name: Option<String>,
    pub region_name: Option<String>,
    pub state_name: Option<String>,
    pub postal_code: Option<String>,
    pub latlng: Option<String>,
    pub email_address: Option<String>,
    pub telephone_country_code: Option<String>,
    pub telephone_area_code: Option<String>,
    pub telephone_number: Option<String>,
    pub occupation_id: Option<String>,
    pub industry_id: Option<String>,
    pub disabled_time: Option<TZTime>,
    pub removed_time: Option<TZTime>,
    pub created_at: Option<TZTime>,
}

impl From<&Row> for RuleInstance {
    fn from(row: &Row) -> Self {
        Self {
            id: row.get(0),
            rule_type: row.get(1),
            rule_name: row.get(2),
            rule_instance_name: row.get(3),
            variable_values: row.get(4),
            account_role: row.get(5),
            item_id: row.get(6),
            price: row.get(7),
            quantity: row.get(8),
            unit_of_measurement: row.get(9),
            units_measured: row.get(10),
            account_name: row.get(11),
            first_name: row.get(12),
            middle_name: row.get(13),
            last_name: row.get(14),
            country_name: row.get(15),
            street_id: row.get(16),
            street_name: row.get(17),
            floor_number: row.get(18),
            unit_id: row.get(19),
            city_name: row.get(20),
            county_name: row.get(21),
            region_name: row.get(22),
            state_name: row.get(23),
            postal_code: row.get(24),
            latlng: row.get(25),
            email_address: row.get(26),
            telephone_country_code: row.get(27),
            telephone_area_code: row.get(28),
            telephone_number: row.get(29),
            occupation_id: row.get(30),
            industry_id: row.get(31),
            disabled_time: row.get(32),
            removed_time: row.get(33),
            created_at: row.get(34),
        }
    }
}

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone)]
pub struct RuleInstances(pub Vec<RuleInstance>);

impl FromIterator<RuleInstance> for RuleInstances {
    fn from_iter<T: IntoIterator<Item = RuleInstance>>(iter: T) -> Self {
        let mut rule_instances = RuleInstances::new();
        for i in iter {
            rule_instances.add(i)
        }
        rule_instances
    }
}

impl From<Vec<Row>> for RuleInstances {
    fn from(rows: Vec<Row>) -> Self {
        let mut rule_instances = RuleInstances::new();
        for row in rows {
            rule_instances.add(RuleInstance::from(&row))
        }
        rule_instances
    }
}

impl Default for RuleInstances {
    fn default() -> Self {
        Self::new()
    }
}

impl RuleInstances {
    pub fn new() -> Self {
        Self(vec![])
    }

    pub fn add(&mut self, elem: RuleInstance) {
        self.0.push(elem)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_deserializes_a_rule_instance() {
        let date_str = "2023-02-28T04:21:08.363Z";
        let got: RuleInstance = serde_json::from_str(&format!(
            r#"
            {{
                "id": "1",
                "rule_type": "transaction_item",
                "rule_name": "multiplyItemValue",
                "rule_instance_name": "NinePercentSalesTax",
                "variable_values": ["ANY", "StateOfCalifornia", "9% state sales tax", "0.09"],
                "account_role": "creditor",
                "item_id": null,
                "price": null,
                "quantity": null,
                "unit_of_measurement": null,
                "units_measured": null,
                "account_name": null,
                "first_name": null,
                "middle_name": null,
                "last_name": null,
                "country_name": null,
                "street_id": null,
                "street_name": null,
                "floor_number": null,
                "unit_id": null,
                "city_name": null,
                "county_name": null,
                "region_name": null,
                "state_name": "California",
                "postal_code": null,
                "latlng": null,
                "email_address": null,
                "telephone_country_code": null,
                "telephone_area_code": null,
                "telephone_number": null,
                "occupation_id": null,
                "industry_id": null,
                "disabled_time": null,
                "removed_time": null,
                "created_at": "{}"
            }}
            "#,
            date_str,
        ))
        .unwrap();

        let want = RuleInstance {
            id: Some(String::from("1")),
            rule_type: String::from("transaction_item"),
            rule_name: String::from("multiplyItemValue"),
            rule_instance_name: String::from("NinePercentSalesTax"),
            variable_values: vec![
                String::from("ANY"),
                String::from("StateOfCalifornia"),
                String::from("9% state sales tax"),
                String::from("0.09"),
            ],
            account_role: AccountRole::Creditor,
            item_id: None,
            price: None,
            quantity: None,
            unit_of_measurement: None,
            units_measured: None,
            account_name: None,
            first_name: None,
            middle_name: None,
            last_name: None,
            country_name: None,
            street_id: None,
            street_name: None,
            floor_number: None,
            unit_id: None,
            city_name: None,
            county_name: None,
            region_name: None,
            state_name: Some(String::from("California")),
            postal_code: None,
            latlng: None,
            email_address: None,
            telephone_country_code: None,
            telephone_area_code: None,
            telephone_number: None,
            occupation_id: None,
            industry_id: None,
            disabled_time: None,
            removed_time: None,
            created_at: Some(TZTime(
                DateTime::parse_from_rfc3339(date_str)
                    .unwrap()
                    .with_timezone(&Utc),
            )),
        };

        if got != want {
            panic!("got {:#?}, want {:#?}", got, want)
        }
    }

    #[test]
    fn it_deserializes_rule_instances() {
        let date_str_1 = "2023-02-28T04:21:08.363Z";
        let date_str_2 = "2024-02-28T04:21:08.363Z";
        let got: RuleInstances = serde_json::from_str(&format!(
            r#"
            [
                {{
                    "id": "1",
                    "rule_type": "transaction_item",
                    "rule_name": "multiplyItemValue",
                    "rule_instance_name": "NinePercentSalesTax",
                    "variable_values": ["ANY", "StateOfCalifornia", "9% state sales tax", "0.09"],
                    "account_role": "creditor",
                    "item_id": null,
                    "price": null,
                    "quantity": null,
                    "unit_of_measurement": null,
                    "units_measured": null,
                    "account_name": null,
                    "first_name": null,
                    "middle_name": null,
                    "last_name": null,
                    "country_name": null,
                    "street_id": null,
                    "street_name": null,
                    "floor_number": null,
                    "unit_id": null,
                    "city_name": null,
                    "county_name": null,
                    "region_name": null,
                    "state_name": "California",
                    "postal_code": null,
                    "latlng": null,
                    "email_address": null,
                    "telephone_country_code": null,
                    "telephone_area_code": null,
                    "telephone_number": null,
                    "occupation_id": null,
                    "industry_id": null,
                    "disabled_time": null,
                    "removed_time": null,
                    "created_at": "{}"
                }},
                {{
                    "id": "1",
                    "rule_type": "transaction_item",
                    "rule_name": "multiplyItemValue",
                    "rule_instance_name": "NinePercentSalesTax",
                    "variable_values": ["ANY", "StateOfCalifornia", "9% state sales tax", "0.09"],
                    "account_role": "creditor",
                    "item_id": null,
                    "price": null,
                    "quantity": null,
                    "unit_of_measurement": null,
                    "units_measured": null,
                    "account_name": null,
                    "first_name": null,
                    "middle_name": null,
                    "last_name": null,
                    "country_name": null,
                    "street_id": null,
                    "street_name": null,
                    "floor_number": null,
                    "unit_id": null,
                    "city_name": null,
                    "county_name": null,
                    "region_name": null,
                    "state_name": "California",
                    "postal_code": null,
                    "latlng": null,
                    "email_address": null,
                    "telephone_country_code": null,
                    "telephone_area_code": null,
                    "telephone_number": null,
                    "occupation_id": null,
                    "industry_id": null,
                    "disabled_time": null,
                    "removed_time": null,
                    "created_at": "{}"
                }}
            ]
            "#,
            date_str_1, date_str_2,
        ))
        .unwrap();

        let want = RuleInstances(vec![
            RuleInstance {
                id: Some(String::from("1")),
                rule_type: String::from("transaction_item"),
                rule_name: String::from("multiplyItemValue"),
                rule_instance_name: String::from("NinePercentSalesTax"),
                variable_values: vec![
                    String::from("ANY"),
                    String::from("StateOfCalifornia"),
                    String::from("9% state sales tax"),
                    String::from("0.09"),
                ],
                account_role: AccountRole::Creditor,
                item_id: None,
                price: None,
                quantity: None,
                unit_of_measurement: None,
                units_measured: None,
                account_name: None,
                first_name: None,
                middle_name: None,
                last_name: None,
                country_name: None,
                street_id: None,
                street_name: None,
                floor_number: None,
                unit_id: None,
                city_name: None,
                county_name: None,
                region_name: None,
                state_name: Some(String::from("California")),
                postal_code: None,
                latlng: None,
                email_address: None,
                telephone_country_code: None,
                telephone_area_code: None,
                telephone_number: None,
                occupation_id: None,
                industry_id: None,
                disabled_time: None,
                removed_time: None,
                created_at: Some(TZTime(
                    DateTime::parse_from_rfc3339(date_str_1)
                        .unwrap()
                        .with_timezone(&Utc),
                )),
            },
            RuleInstance {
                id: Some(String::from("1")),
                rule_type: String::from("transaction_item"),
                rule_name: String::from("multiplyItemValue"),
                rule_instance_name: String::from("NinePercentSalesTax"),
                variable_values: vec![
                    String::from("ANY"),
                    String::from("StateOfCalifornia"),
                    String::from("9% state sales tax"),
                    String::from("0.09"),
                ],
                account_role: AccountRole::Creditor,
                item_id: None,
                price: None,
                quantity: None,
                unit_of_measurement: None,
                units_measured: None,
                account_name: None,
                first_name: None,
                middle_name: None,
                last_name: None,
                country_name: None,
                street_id: None,
                street_name: None,
                floor_number: None,
                unit_id: None,
                city_name: None,
                county_name: None,
                region_name: None,
                state_name: Some(String::from("California")),
                postal_code: None,
                latlng: None,
                email_address: None,
                telephone_country_code: None,
                telephone_area_code: None,
                telephone_number: None,
                occupation_id: None,
                industry_id: None,
                disabled_time: None,
                removed_time: None,
                created_at: Some(TZTime(
                    DateTime::parse_from_rfc3339(date_str_2)
                        .unwrap()
                        .with_timezone(&Utc),
                )),
            },
        ]);

        if got != want {
            panic!("got {:#?}, want {:#?}", got, want)
        }
    }

    #[test]
    fn it_implements_from_iterator_on_rule_instances() {
        let want = RuleInstances(vec![RuleInstance {
            id: Some(String::from("1")),
            rule_type: String::from("transaction_item"),
            rule_name: String::from("multiplyItemValue"),
            rule_instance_name: String::from("NinePercentSalesTax"),
            variable_values: vec![
                String::from("ANY"),
                String::from("StateOfCalifornia"),
                String::from("9% state sales tax"),
                String::from("0.09"),
            ],
            account_role: AccountRole::Creditor,
            item_id: None,
            price: None,
            quantity: None,
            unit_of_measurement: None,
            units_measured: None,
            account_name: None,
            first_name: None,
            middle_name: None,
            last_name: None,
            country_name: None,
            street_id: None,
            street_name: None,
            floor_number: None,
            unit_id: None,
            city_name: None,
            county_name: None,
            region_name: None,
            state_name: Some(String::from("California")),
            postal_code: None,
            latlng: None,
            email_address: None,
            telephone_country_code: None,
            telephone_area_code: None,
            telephone_number: None,
            occupation_id: None,
            industry_id: None,
            disabled_time: None,
            removed_time: None,
            created_at: Some(TZTime(
                DateTime::parse_from_rfc3339("2023-02-28T04:21:08.363Z")
                    .unwrap()
                    .with_timezone(&Utc),
            )),
        }]);
        // create iterator
        let test_rule_instances = std::iter::repeat(want.0[0].clone()).take(1);
        // test method
        let got = RuleInstances::from_iter(test_rule_instances);
        // assert
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }
}
