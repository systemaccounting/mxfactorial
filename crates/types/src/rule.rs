use crate::account_role::AccountRole;
use crate::time::TZTime;
use async_graphql::SimpleObject;
use postgres_types::{FromSql, ToSql};
use serde::{Deserialize, Serialize};
use tokio_postgres::Row;

/// produces transactions
/// dimensions match transaction table properties (author, author_device_latlng, author_role)
/// cron: if set, pg_cron scheduled; if null, triggered by incoming transaction
#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone, SimpleObject)]
#[graphql(rename_fields = "snake_case")]
pub struct TransactionRuleInstance {
    pub id: Option<String>,
    pub rule_name: String,
    pub rule_instance_name: String,
    pub variable_values: Vec<String>,
    pub author: Option<String>,
    pub author_device_id: Option<String>,
    pub author_device_latlng: Option<String>,
    pub author_role: Option<AccountRole>,
    pub cron: Option<String>,
    pub disabled_time: Option<TZTime>,
    pub removed_time: Option<TZTime>,
    #[serde(skip_serializing)]
    pub created_at: Option<TZTime>,
}

impl From<&Row> for TransactionRuleInstance {
    fn from(row: &Row) -> Self {
        Self {
            id: row.get(0),
            rule_name: row.get(1),
            rule_instance_name: row.get(2),
            variable_values: row.get(3),
            author: row.get(4),
            author_device_id: row.get(5),
            author_device_latlng: row.get(6),
            author_role: row.get(7),
            cron: row.get(8),
            disabled_time: row.get(9),
            removed_time: row.get(10),
            created_at: row.get(11),
        }
    }
}

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone)]
pub struct TransactionRuleInstances(pub Vec<TransactionRuleInstance>);

impl FromIterator<TransactionRuleInstance> for TransactionRuleInstances {
    fn from_iter<T: IntoIterator<Item = TransactionRuleInstance>>(iter: T) -> Self {
        let mut instances = TransactionRuleInstances::new();
        for i in iter {
            instances.add(i)
        }
        instances
    }
}

impl From<Vec<Row>> for TransactionRuleInstances {
    fn from(rows: Vec<Row>) -> Self {
        let mut instances = TransactionRuleInstances::new();
        for row in rows {
            instances.add(TransactionRuleInstance::from(&row))
        }
        instances
    }
}

impl Default for TransactionRuleInstances {
    fn default() -> Self {
        Self::new()
    }
}

impl TransactionRuleInstances {
    pub fn new() -> Self {
        Self(vec![])
    }

    pub fn add(&mut self, elem: TransactionRuleInstance) {
        self.0.push(elem)
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
}

/// produces transaction items (taxes, fees)
/// dimensions match transaction_item (item_id, price, quantity) and account_profile properties
#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone, SimpleObject)]
#[graphql(rename_fields = "snake_case")]
pub struct TransactionItemRuleInstance {
    pub id: Option<String>,
    pub rule_name: String,
    pub rule_instance_name: String,
    pub variable_values: Vec<String>,
    pub account_role: AccountRole,
    pub account_name: Option<String>,
    pub item_id: Option<String>,
    pub price: Option<String>,
    pub quantity: Option<String>,
    pub country_name: Option<String>,
    pub city_name: Option<String>,
    pub county_name: Option<String>,
    pub state_name: Option<String>,
    pub latlng: Option<String>,
    pub occupation_id: Option<String>,
    pub industry_id: Option<String>,
    pub disabled_time: Option<TZTime>,
    pub removed_time: Option<TZTime>,
    #[serde(skip_serializing)]
    pub created_at: Option<TZTime>,
}

impl From<&Row> for TransactionItemRuleInstance {
    fn from(row: &Row) -> Self {
        Self {
            id: row.get(0),
            rule_name: row.get(1),
            rule_instance_name: row.get(2),
            variable_values: row.get(3),
            account_role: row.get(4),
            account_name: row.get(5),
            item_id: row.get(6),
            price: row.get(7),
            quantity: row.get(8),
            country_name: row.get(9),
            city_name: row.get(10),
            county_name: row.get(11),
            state_name: row.get(12),
            latlng: row.get(13),
            occupation_id: row.get(14),
            industry_id: row.get(15),
            disabled_time: row.get(16),
            removed_time: row.get(17),
            created_at: row.get(18),
        }
    }
}

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone)]
pub struct TransactionItemRuleInstances(pub Vec<TransactionItemRuleInstance>);

impl FromIterator<TransactionItemRuleInstance> for TransactionItemRuleInstances {
    fn from_iter<T: IntoIterator<Item = TransactionItemRuleInstance>>(iter: T) -> Self {
        let mut instances = TransactionItemRuleInstances::new();
        for i in iter {
            instances.add(i)
        }
        instances
    }
}

impl From<Vec<Row>> for TransactionItemRuleInstances {
    fn from(rows: Vec<Row>) -> Self {
        let mut instances = TransactionItemRuleInstances::new();
        for row in rows {
            instances.add(TransactionItemRuleInstance::from(&row))
        }
        instances
    }
}

impl Default for TransactionItemRuleInstances {
    fn default() -> Self {
        Self::new()
    }
}

impl TransactionItemRuleInstances {
    pub fn new() -> Self {
        Self(vec![])
    }

    pub fn add(&mut self, elem: TransactionItemRuleInstance) {
        self.0.push(elem)
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
}

/// produces approvals
/// dimensions: account_role, account_name
#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone, SimpleObject)]
#[graphql(rename_fields = "snake_case")]
pub struct ApprovalRuleInstance {
    pub id: Option<String>,
    pub rule_name: String,
    pub rule_instance_name: String,
    pub variable_values: Vec<String>,
    pub account_role: AccountRole,
    pub account_name: String, // required
    pub disabled_time: Option<TZTime>,
    pub removed_time: Option<TZTime>,
    #[serde(skip_serializing)]
    pub created_at: Option<TZTime>,
}

impl From<&Row> for ApprovalRuleInstance {
    fn from(row: &Row) -> Self {
        Self {
            id: row.get(0),
            rule_name: row.get(1),
            rule_instance_name: row.get(2),
            variable_values: row.get(3),
            account_role: row.get(4),
            account_name: row.get(5),
            disabled_time: row.get(6),
            removed_time: row.get(7),
            created_at: row.get(8),
        }
    }
}

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone)]
pub struct ApprovalRuleInstances(pub Vec<ApprovalRuleInstance>);

impl FromIterator<ApprovalRuleInstance> for ApprovalRuleInstances {
    fn from_iter<T: IntoIterator<Item = ApprovalRuleInstance>>(iter: T) -> Self {
        let mut instances = ApprovalRuleInstances::new();
        for i in iter {
            instances.add(i)
        }
        instances
    }
}

impl From<Vec<Row>> for ApprovalRuleInstances {
    fn from(rows: Vec<Row>) -> Self {
        let mut instances = ApprovalRuleInstances::new();
        for row in rows {
            instances.add(ApprovalRuleInstance::from(&row))
        }
        instances
    }
}

impl Default for ApprovalRuleInstances {
    fn default() -> Self {
        Self::new()
    }
}

impl ApprovalRuleInstances {
    pub fn new() -> Self {
        Self(vec![])
    }

    pub fn add(&mut self, elem: ApprovalRuleInstance) {
        self.0.push(elem)
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{DateTime, Utc};

    #[test]
    fn it_deserializes_a_transaction_item_rule_instance() {
        let date_str = "2023-02-28T04:21:08.363Z";
        let got: TransactionItemRuleInstance = serde_json::from_str(&format!(
            r#"
            {{
                "id": "1",
                "rule_name": "multiplyItemValue",
                "rule_instance_name": "NinePercentSalesTax",
                "variable_values": ["ANY", "StateOfCalifornia", "9% state sales tax", "0.09"],
                "account_role": "creditor",
                "account_name": null,
                "item_id": null,
                "price": null,
                "quantity": null,
                "country_name": null,
                "city_name": null,
                "county_name": null,
                "state_name": "California",
                "latlng": null,
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

        let want = TransactionItemRuleInstance {
            id: Some(String::from("1")),
            rule_name: String::from("multiplyItemValue"),
            rule_instance_name: String::from("NinePercentSalesTax"),
            variable_values: vec![
                String::from("ANY"),
                String::from("StateOfCalifornia"),
                String::from("9% state sales tax"),
                String::from("0.09"),
            ],
            account_role: AccountRole::Creditor,
            account_name: None,
            item_id: None,
            price: None,
            quantity: None,
            country_name: None,
            city_name: None,
            county_name: None,
            state_name: Some(String::from("California")),
            latlng: None,
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

        assert_eq!(got, want);
    }

    #[test]
    fn it_deserializes_an_approval_rule_instance() {
        let date_str = "2023-02-28T04:21:08.363Z";
        let got: ApprovalRuleInstance = serde_json::from_str(&format!(
            r#"
            {{
                "id": "1",
                "rule_name": "approveAnyCreditItem",
                "rule_instance_name": "ApprovalAllCreditRequests",
                "variable_values": ["JacobWebb", "creditor", "JacobWebb"],
                "account_role": "creditor",
                "account_name": "JacobWebb",
                "disabled_time": null,
                "removed_time": null,
                "created_at": "{}"
            }}
            "#,
            date_str,
        ))
        .unwrap();

        let want = ApprovalRuleInstance {
            id: Some(String::from("1")),
            rule_name: String::from("approveAnyCreditItem"),
            rule_instance_name: String::from("ApprovalAllCreditRequests"),
            variable_values: vec![
                String::from("JacobWebb"),
                String::from("creditor"),
                String::from("JacobWebb"),
            ],
            account_role: AccountRole::Creditor,
            account_name: String::from("JacobWebb"),
            disabled_time: None,
            removed_time: None,
            created_at: Some(TZTime(
                DateTime::parse_from_rfc3339(date_str)
                    .unwrap()
                    .with_timezone(&Utc),
            )),
        };

        assert_eq!(got, want);
    }

    #[test]
    fn it_deserializes_a_transaction_rule_instance() {
        let date_str = "2023-02-28T04:21:08.363Z";
        let got: TransactionRuleInstance = serde_json::from_str(&format!(
            r#"
            {{
                "id": "1",
                "rule_name": "minSumTransact",
                "rule_instance_name": "CharityDonation",
                "variable_values": ["100.000", "ANY", "CharityOrg", "donation", "1.000"],
                "author": "JacobWebb",
                "author_device_id": null,
                "author_device_latlng": null,
                "author_role": "debitor",
                "cron": null,
                "disabled_time": null,
                "removed_time": null,
                "created_at": "{}"
            }}
            "#,
            date_str,
        ))
        .unwrap();

        let want = TransactionRuleInstance {
            id: Some(String::from("1")),
            rule_name: String::from("minSumTransact"),
            rule_instance_name: String::from("CharityDonation"),
            variable_values: vec![
                String::from("100.000"),
                String::from("ANY"),
                String::from("CharityOrg"),
                String::from("donation"),
                String::from("1.000"),
            ],
            author: Some(String::from("JacobWebb")),
            author_device_id: None,
            author_device_latlng: None,
            author_role: Some(AccountRole::Debitor),
            cron: None,
            disabled_time: None,
            removed_time: None,
            created_at: Some(TZTime(
                DateTime::parse_from_rfc3339(date_str)
                    .unwrap()
                    .with_timezone(&Utc),
            )),
        };

        assert_eq!(got, want);
    }

    #[test]
    fn it_implements_from_iterator_on_transaction_item_rule_instances() {
        let instance = TransactionItemRuleInstance {
            id: Some(String::from("1")),
            rule_name: String::from("multiplyItemValue"),
            rule_instance_name: String::from("NinePercentSalesTax"),
            variable_values: vec![String::from("0.09")],
            account_role: AccountRole::Creditor,
            account_name: None,
            item_id: None,
            price: None,
            quantity: None,
            country_name: None,
            city_name: None,
            county_name: None,
            state_name: Some(String::from("California")),
            latlng: None,
            occupation_id: None,
            industry_id: None,
            disabled_time: None,
            removed_time: None,
            created_at: None,
        };
        let want = TransactionItemRuleInstances(vec![instance.clone()]);
        let got = TransactionItemRuleInstances::from_iter(std::iter::once(instance));
        assert_eq!(got, want);
    }

    #[test]
    fn it_implements_from_iterator_on_approval_rule_instances() {
        let instance = ApprovalRuleInstance {
            id: Some(String::from("1")),
            rule_name: String::from("approveAnyCreditItem"),
            rule_instance_name: String::from("ApprovalAllCreditRequests"),
            variable_values: vec![String::from("JacobWebb")],
            account_role: AccountRole::Creditor,
            account_name: String::from("JacobWebb"),
            disabled_time: None,
            removed_time: None,
            created_at: None,
        };
        let want = ApprovalRuleInstances(vec![instance.clone()]);
        let got = ApprovalRuleInstances::from_iter(std::iter::once(instance));
        assert_eq!(got, want);
    }

    #[test]
    fn it_implements_from_iterator_on_transaction_rule_instances() {
        let instance = TransactionRuleInstance {
            id: Some(String::from("1")),
            rule_name: String::from("minSumTransact"),
            rule_instance_name: String::from("CharityDonation"),
            variable_values: vec![String::from("100.000")],
            author: None,
            author_device_id: None,
            author_device_latlng: None,
            author_role: None,
            cron: None,
            disabled_time: None,
            removed_time: None,
            created_at: None,
        };
        let want = TransactionRuleInstances(vec![instance.clone()]);
        let got = TransactionRuleInstances::from_iter(std::iter::once(instance));
        assert_eq!(got, want);
    }
}
