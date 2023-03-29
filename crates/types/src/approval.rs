use crate::account_role::AccountRole;
use crate::time::TZTime;
use postgres_types::{FromSql, ToSql};
use serde::{Deserialize, Serialize};
use tokio_postgres::Row;

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone)]
pub struct Approval {
    pub id: Option<String>,
    pub rule_instance_id: Option<String>,
    pub transaction_id: Option<String>,
    pub transaction_item_id: Option<String>,
    pub account_name: String,
    pub account_role: AccountRole,
    pub device_id: Option<String>,
    pub device_latlng: Option<TZTime>,
    pub approval_time: Option<TZTime>,
    pub rejection_time: Option<TZTime>,
    pub expiration_time: Option<TZTime>,
}

impl Approval {
    pub fn from_row(row: Row) -> Self {
        Approval {
            id: row.get("id"),
            rule_instance_id: row.get("rule_instance_id"),
            transaction_id: row.get("transaction_id"),
            transaction_item_id: row.get("transaction_item_id"),
            account_name: row.get("account_name"),
            account_role: row.get("account_role"),
            device_id: row.get("device_id"),
            device_latlng: row.get("device_latlng"),
            approval_time: row.get("approval_time"),
            rejection_time: row.get("rejection_time"),
            expiration_time: row.get("expiration_time"),
        }
    }
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

#[derive(Default, Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone)]
pub struct Approvals(pub Vec<Approval>);

impl Approvals {
    pub fn from_rows(rows: Vec<Row>) -> Self {
        Self(rows.into_iter().map(Approval::from_row).collect())
    }

    pub fn get_approvals_per_role(&self, account_role: AccountRole) -> Self {
        Approvals(
            self.0
                .clone()
                .into_iter()
                .filter(|a| a.account_role == account_role)
                .collect(),
        )
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