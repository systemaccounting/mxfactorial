use crate::account_role::AccountRole;
use crate::time::TZTime;
#[allow(unused_imports)]
use chrono::{DateTime, Utc};
use postgres_types::{FromSql, ToSql};
use serde::{Deserialize, Serialize};
use tokio_postgres::Row;

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone)]
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

impl RuleInstance {
    pub fn from_row(row: Row) -> Self {
        RuleInstance {
            id: row.get("id"),
            rule_type: row.get("rule_type"),
            rule_name: row.get("rule_name"),
            rule_instance_name: row.get("rule_instance_name"),
            variable_values: row.get("variable_values"),
            account_role: row.get("account_role"),
            item_id: row.get("item_id"),
            price: row.get("price"),
            quantity: row.get("quantity"),
            unit_of_measurement: row.get("unit_of_measurement"),
            units_measured: row.get("units_measured"),
            account_name: row.get("account_name"),
            first_name: row.get("first_name"),
            middle_name: row.get("middle_name"),
            last_name: row.get("last_name"),
            country_name: row.get("country_name"),
            street_id: row.get("street_id"),
            street_name: row.get("street_name"),
            floor_number: row.get("floor_number"),
            unit_id: row.get("unit_id"),
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
            disabled_time: row.get("disabled_time"),
            removed_time: row.get("removed_time"),
            created_at: row.get("created_at"),
        }
    }
}

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

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone)]
pub struct RuleInstances(pub Vec<RuleInstance>);

impl RuleInstances {
    pub fn from_rows(rows: Vec<Row>) -> Self {
        Self(rows.into_iter().map(RuleInstance::from_row).collect())
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
