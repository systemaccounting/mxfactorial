use crate::{
    account_role::AccountRole,
    time::TZTime,
    transaction_item::{TransactionItem, TransactionItems},
};
use async_graphql::{ComplexObject, Object, SimpleObject};
use serde::{Deserialize, Serialize};

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, Clone, SimpleObject)]
#[graphql(rename_fields = "snake_case", complex)]
pub struct Transaction {
    pub id: Option<String>,
    pub rule_instance_id: Option<String>,
    pub author: Option<String>,
    pub author_device_id: Option<String>,
    pub author_device_latlng: Option<String>,
    pub author_role: Option<AccountRole>,
    pub equilibrium_time: Option<TZTime>,
    pub sum_value: String,
    #[graphql(skip)]
    pub transaction_items: TransactionItems,
}

#[ComplexObject]
impl Transaction {
    #[graphql(name = "transaction_items")]
    async fn transaction_items(&self) -> Vec<TransactionItem> {
        self.transaction_items.clone().0
    }
}

impl Transaction {
    pub fn new(author: String, transaction_items: TransactionItems) -> Self {
        Self {
            id: None,
            rule_instance_id: None,
            author: Some(author),
            author_device_id: None,
            author_device_latlng: None,
            author_role: None,
            equilibrium_time: None,
            sum_value: "0.000".to_string(), // used in integration tests
            transaction_items,
        }
    }
}

#[cfg(test)]
pub mod tests {

    use super::*;
    use crate::{
        approval::{Approval, Approvals},
        transaction_item::{TransactionItem, TransactionItems},
    };

    #[test]
    fn it_deserializes_a_transaction() {
        let got: Transaction = serde_json::from_str(
            r#"
            {
                "id": null,
                "rule_instance_id": null,
                "author": "GroceryCo",
                "author_device_id": null,
                "author_device_latlng": null,
                "author_role": "creditor",
                "equilibrium_time": null,
                "sum_value": "21.800",
                "transaction_items": [
                    {
                        "id": null,
                        "transaction_id": null,
                        "item_id": "bread",
                        "price": "3.000",
                        "quantity": "2",
                        "debitor_first": false,
                        "rule_instance_id": null,
                        "rule_exec_ids": [],
                        "unit_of_measurement": null,
                        "units_measured": null,
                        "debitor": "JacobWebb",
                        "creditor": "GroceryStore",
                        "debitor_profile_id": null,
                        "creditor_profile_id": null,
                        "debitor_approval_time": null,
                        "creditor_approval_time": null,
                        "debitor_expiration_time": null,
                        "creditor_expiration_time": null,
                        "debitor_rejection_time": null,
                        "creditor_rejection_time": null,
                        "approvals": [
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
                    },
                    {
                        "id": null,
                        "transaction_id": null,
                        "item_id": "milk",
                        "price": "4.000",
                        "quantity": "3",
                        "debitor_first": false,
                        "rule_instance_id": null,
                        "rule_exec_ids": [],
                        "unit_of_measurement": null,
                        "units_measured": null,
                        "debitor": "JacobWebb",
                        "creditor": "GroceryStore",
                        "debitor_profile_id": null,
                        "creditor_profile_id": null,
                        "debitor_approval_time": null,
                        "creditor_approval_time": null,
                        "debitor_expiration_time": null,
                        "creditor_expiration_time": null,
                        "debitor_rejection_time": null,
                        "creditor_rejection_time": null,
                        "approvals": [
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
                    }
                ]
            }
            "#,
        )
        .unwrap();

        let want = create_test_transaction();

        if got != want {
            panic!("got {:#?}, want {:#?}", got, want);
        }
    }

    #[test]
    fn it_deserializes_transactions() {
        let got: Transactions = serde_json::from_str(
            r#"
    [
        {
			"id": null,
			"rule_instance_id": null,
			"author": "GroceryCo",
			"author_device_id": null,
			"author_device_latlng": null,
			"author_role": "creditor",
			"equilibrium_time": null,
			"sum_value": "21.800",
			"transaction_items": [
                {
                    "id": null,
                    "transaction_id": null,
                    "item_id": "bread",
                    "price": "3.000",
                    "quantity": "2",
                    "debitor_first": false,
                    "rule_instance_id": null,
                    "rule_exec_ids": [],
                    "unit_of_measurement": null,
                    "units_measured": null,
                    "debitor": "JacobWebb",
                    "creditor": "GroceryStore",
                    "debitor_profile_id": null,
                    "creditor_profile_id": null,
                    "debitor_approval_time": null,
                    "creditor_approval_time": null,
                    "debitor_expiration_time": null,
                    "creditor_expiration_time": null,
                    "debitor_rejection_time": null,
                    "creditor_rejection_time": null,
                    "approvals": [
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
                },
                {
                    "id": null,
                    "transaction_id": null,
                    "item_id": "milk",
                    "price": "4.000",
                    "quantity": "3",
                    "debitor_first": false,
                    "rule_instance_id": null,
                    "rule_exec_ids": [],
                    "unit_of_measurement": null,
                    "units_measured": null,
                    "debitor": "JacobWebb",
                    "creditor": "GroceryStore",
                    "debitor_profile_id": null,
                    "creditor_profile_id": null,
                    "debitor_approval_time": null,
                    "creditor_approval_time": null,
                    "debitor_expiration_time": null,
                    "creditor_expiration_time": null,
                    "debitor_rejection_time": null,
                    "creditor_rejection_time": null,
                    "approvals": [
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
                }
            ]
		},
        {
			"id": null,
			"rule_instance_id": null,
			"author": "GroceryCo",
			"author_device_id": null,
			"author_device_latlng": null,
			"author_role": "creditor",
			"equilibrium_time": null,
			"sum_value": "21.800",
			"transaction_items": [
                {
                    "id": null,
                    "transaction_id": null,
                    "item_id": "bread",
                    "price": "3.000",
                    "quantity": "2",
                    "debitor_first": false,
                    "rule_instance_id": null,
                    "rule_exec_ids": [],
                    "unit_of_measurement": null,
                    "units_measured": null,
                    "debitor": "JacobWebb",
                    "creditor": "GroceryStore",
                    "debitor_profile_id": null,
                    "creditor_profile_id": null,
                    "debitor_approval_time": null,
                    "creditor_approval_time": null,
                    "debitor_expiration_time": null,
                    "creditor_expiration_time": null,
                    "debitor_rejection_time": null,
                    "creditor_rejection_time": null,
                    "approvals": [
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
                },
                {
                    "id": null,
                    "transaction_id": null,
                    "item_id": "milk",
                    "price": "4.000",
                    "quantity": "3",
                    "debitor_first": false,
                    "rule_instance_id": null,
                    "rule_exec_ids": [],
                    "unit_of_measurement": null,
                    "units_measured": null,
                    "debitor": "JacobWebb",
                    "creditor": "GroceryStore",
                    "debitor_profile_id": null,
                    "creditor_profile_id": null,
                    "debitor_approval_time": null,
                    "creditor_approval_time": null,
                    "debitor_expiration_time": null,
                    "creditor_expiration_time": null,
                    "debitor_rejection_time": null,
                    "creditor_rejection_time": null,
                    "approvals": [
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
                }
            ]
		}
    ]"#,
        )
        .unwrap();

        let want = create_test_transactions();
        assert_eq!(got, want)
    }

    pub fn create_test_transaction() -> Transaction {
        Transaction {
            id: None,
            rule_instance_id: None,
            author: Some(String::from("GroceryCo")),
            author_device_id: None,
            author_device_latlng: None,
            author_role: Some(AccountRole::Creditor),
            equilibrium_time: None,
            sum_value: String::from("21.800"),
            transaction_items: TransactionItems(vec![
                TransactionItem {
                    id: None,
                    transaction_id: None,
                    item_id: String::from("bread"),
                    price: String::from("3.000"),
                    quantity: String::from("2"),
                    debitor_first: Some(false),
                    rule_instance_id: None,
                    rule_exec_ids: Some(vec![]),
                    unit_of_measurement: None,
                    units_measured: None,
                    debitor: String::from("JacobWebb"),
                    creditor: String::from("GroceryStore"),
                    debitor_profile_id: None,
                    creditor_profile_id: None,
                    debitor_approval_time: None,
                    creditor_approval_time: None,
                    debitor_rejection_time: None,
                    creditor_rejection_time: None,
                    debitor_expiration_time: None,
                    creditor_expiration_time: None,
                    approvals: Some(Approvals(vec![
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
                    ])),
                },
                TransactionItem {
                    id: None,
                    transaction_id: None,
                    item_id: String::from("milk"),
                    price: String::from("4.000"),
                    quantity: String::from("3"),
                    debitor_first: Some(false),
                    rule_instance_id: None,
                    rule_exec_ids: Some(vec![]),
                    unit_of_measurement: None,
                    units_measured: None,
                    debitor: String::from("JacobWebb"),
                    creditor: String::from("GroceryStore"),
                    debitor_profile_id: None,
                    creditor_profile_id: None,
                    debitor_approval_time: None,
                    creditor_approval_time: None,
                    debitor_rejection_time: None,
                    creditor_rejection_time: None,
                    debitor_expiration_time: None,
                    creditor_expiration_time: None,
                    approvals: Some(Approvals(vec![
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
                    ])),
                },
            ]),
        }
    }

    pub fn create_test_transactions() -> Transactions {
        Transactions(vec![
            Transaction {
                id: None,
                rule_instance_id: None,
                author: Some(String::from("GroceryCo")),
                author_device_id: None,
                author_device_latlng: None,
                author_role: Some(AccountRole::Creditor),
                equilibrium_time: None,
                sum_value: String::from("21.800"),
                transaction_items: TransactionItems(vec![
                    TransactionItem {
                        id: None,
                        transaction_id: None,
                        item_id: String::from("bread"),
                        price: String::from("3.000"),
                        quantity: String::from("2"),
                        debitor_first: Some(false),
                        rule_instance_id: None,
                        rule_exec_ids: Some(vec![]),
                        unit_of_measurement: None,
                        units_measured: None,
                        debitor: String::from("JacobWebb"),
                        creditor: String::from("GroceryStore"),
                        debitor_profile_id: None,
                        creditor_profile_id: None,
                        debitor_approval_time: None,
                        creditor_approval_time: None,
                        debitor_rejection_time: None,
                        creditor_rejection_time: None,
                        debitor_expiration_time: None,
                        creditor_expiration_time: None,
                        approvals: Some(Approvals(vec![
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
                        ])),
                    },
                    TransactionItem {
                        id: None,
                        transaction_id: None,
                        item_id: String::from("milk"),
                        price: String::from("4.000"),
                        quantity: String::from("3"),
                        debitor_first: Some(false),
                        rule_instance_id: None,
                        rule_exec_ids: Some(vec![]),
                        unit_of_measurement: None,
                        units_measured: None,
                        debitor: String::from("JacobWebb"),
                        creditor: String::from("GroceryStore"),
                        debitor_profile_id: None,
                        creditor_profile_id: None,
                        debitor_approval_time: None,
                        creditor_approval_time: None,
                        debitor_rejection_time: None,
                        creditor_rejection_time: None,
                        debitor_expiration_time: None,
                        creditor_expiration_time: None,
                        approvals: Some(Approvals(vec![
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
                        ])),
                    },
                ]),
            },
            Transaction {
                id: None,
                rule_instance_id: None,
                author: Some(String::from("GroceryCo")),
                author_device_id: None,
                author_device_latlng: None,
                author_role: Some(AccountRole::Creditor),
                equilibrium_time: None,
                sum_value: String::from("21.800"),
                transaction_items: TransactionItems(vec![
                    TransactionItem {
                        id: None,
                        transaction_id: None,
                        item_id: String::from("bread"),
                        price: String::from("3.000"),
                        quantity: String::from("2"),
                        debitor_first: Some(false),
                        rule_instance_id: None,
                        rule_exec_ids: Some(vec![]),
                        unit_of_measurement: None,
                        units_measured: None,
                        debitor: String::from("JacobWebb"),
                        creditor: String::from("GroceryStore"),
                        debitor_profile_id: None,
                        creditor_profile_id: None,
                        debitor_approval_time: None,
                        creditor_approval_time: None,
                        debitor_rejection_time: None,
                        creditor_rejection_time: None,
                        debitor_expiration_time: None,
                        creditor_expiration_time: None,
                        approvals: Some(Approvals(vec![
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
                        ])),
                    },
                    TransactionItem {
                        id: None,
                        transaction_id: None,
                        item_id: String::from("milk"),
                        price: String::from("4.000"),
                        quantity: String::from("3"),
                        debitor_first: Some(false),
                        rule_instance_id: None,
                        rule_exec_ids: Some(vec![]),
                        unit_of_measurement: None,
                        units_measured: None,
                        debitor: String::from("JacobWebb"),
                        creditor: String::from("GroceryStore"),
                        debitor_profile_id: None,
                        creditor_profile_id: None,
                        debitor_approval_time: None,
                        creditor_approval_time: None,
                        debitor_rejection_time: None,
                        creditor_rejection_time: None,
                        debitor_expiration_time: None,
                        creditor_expiration_time: None,
                        approvals: Some(Approvals(vec![
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
                        ])),
                    },
                ]),
            },
        ])
    }
}

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize)] // clone, default
pub struct Transactions(pub Vec<Transaction>);

#[Object]
impl Transactions {
    async fn transactions(&self) -> Vec<Transaction> {
        self.0.clone()
    }
}
