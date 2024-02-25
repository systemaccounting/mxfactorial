use crate::account_role::AccountRole;
use crate::time::TZTime;
use async_graphql::{Object, SimpleObject};
use serde::{Deserialize, Serialize};
use tokio_postgres::{
    types::{FromSql, ToSql},
    Row,
};

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone, SimpleObject)]
#[graphql(rename_fields = "snake_case")]
pub struct Approval {
    pub id: Option<String>,
    pub rule_instance_id: Option<String>,
    pub transaction_id: Option<String>,
    pub transaction_item_id: Option<String>,
    pub account_name: String,
    pub account_role: AccountRole,
    pub device_id: Option<String>,
    pub device_latlng: Option<String>,
    pub approval_time: Option<TZTime>,
    pub rejection_time: Option<TZTime>,
    pub expiration_time: Option<TZTime>,
}

impl From<Row> for Approval {
    fn from(row: Row) -> Self {
        Self {
            id: row.get(0),
            rule_instance_id: row.get(1),
            transaction_id: row.get(2),
            transaction_item_id: row.get(3),
            account_name: row.get(4),
            account_role: row.get(5),
            device_id: row.get(6),
            device_latlng: row.get(7),
            approval_time: row.get(8),
            rejection_time: row.get(9),
            expiration_time: row.get(10),
        }
    }
}

#[derive(Default, Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone)]
pub struct Approvals(pub Vec<Approval>);

impl IntoIterator for Approvals {
    type Item = Approval;
    type IntoIter = std::vec::IntoIter<Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

impl From<Vec<Row>> for Approvals {
    fn from(rows: Vec<Row>) -> Self {
        Self(
            rows.into_iter()
                .map(Approval::from)
                .collect::<Vec<Approval>>(),
        )
    }
}

impl Approvals {
    pub fn get_approvals_per_role(&self, account_role: AccountRole) -> Self {
        Approvals(
            self.0
                .clone()
                .into_iter()
                .filter(|a| a.account_role == account_role)
                .collect(),
        )
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
}

#[Object]
impl Approvals {
    async fn approvals(&self) -> Vec<Approval> {
        self.0.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_gets_approvals_per_role() {
        let want = Approvals(vec![Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("GroceryCo"),
            account_role: AccountRole::Creditor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: None,
        }]);

        let test_role = AccountRole::Creditor;

        let test_approvals = Approvals(vec![
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("JoeCarter"),
                account_role: AccountRole::Debitor,
                device_id: None,
                device_latlng: None,
                approval_time: None,
                rejection_time: None,
                expiration_time: None,
            },
            want.0[0].clone(),
        ]);

        let got = test_approvals.get_approvals_per_role(test_role);

        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_deserializes_an_approval() {
        let got: Approval = serde_json::from_str(
            r#"
    {
        "id": null,
        "rule_instance_id": null,
        "transaction_id": null,
        "transaction_item_id": null,
        "account_name": "JoeCarter",
        "account_role": "debitor",
        "device_id": null,
        "device_latlng": null,
        "approval_time": null,
        "rejection_time": null,
        "expiration_time": null
    }
    "#,
        )
        .unwrap();

        let want = Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: None,
        };

        if got != want {
            panic!("got {:#?}, want {:#?}", got, want);
        }
    }

    #[test]
    fn it_deserializes_approvals() {
        let want = Approvals(vec![
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("JacobWebb"),
                account_role: AccountRole::Debitor,
                device_id: None,
                device_latlng: None,
                approval_time: None,
                rejection_time: None,
                expiration_time: None,
            },
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("GroceryStore"),
                account_role: AccountRole::Creditor,
                device_id: None,
                device_latlng: None,
                approval_time: None,
                rejection_time: None,
                expiration_time: None,
            },
        ]);

        let got: Approvals = serde_json::from_str(
            r#"
            [
                {
                    "id": null,
                    "rule_instance_id": null,
                    "transaction_id": null,
                    "transaction_item_id": null,
                    "account_name": "JacobWebb",
                    "account_role": "debitor",
                    "device_id": null,
                    "device_latlng": null,
                    "approval_time": null,
                    "rejection_time": null,
                    "expiration_time": null
                },
                {
                    "id": null,
                    "rule_instance_id": null,
                    "transaction_id": null,
                    "transaction_item_id": null,
                    "account_name": "GroceryStore",
                    "account_role": "creditor",
                    "device_id": null,
                    "device_latlng": null,
                    "approval_time": null,
                    "rejection_time": null,
                    "expiration_time": null
                }
            ]
            "#,
        )
        .unwrap();

        assert_eq!(got, want)
    }
}
