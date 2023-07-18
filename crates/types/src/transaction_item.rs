#[allow(unused_imports)]
use crate::{account::AccountProfiles, transaction};
use crate::{account_role::AccountRole, approval::Approvals, time::TZTime};
use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, Clone)]
pub struct TransactionItem {
    pub id: Option<String>,
    pub transaction_id: Option<String>,
    pub item_id: String,
    pub price: String,
    pub quantity: String,
    pub debitor_first: Option<bool>,
    pub rule_instance_id: Option<String>,
    pub rule_exec_ids: Option<Vec<String>>,
    pub unit_of_measurement: Option<String>,
    pub units_measured: Option<String>,
    pub debitor: String,
    pub creditor: String,
    pub debitor_profile_id: Option<String>,
    pub creditor_profile_id: Option<String>,
    pub debitor_approval_time: Option<TZTime>,
    pub creditor_approval_time: Option<TZTime>,
    pub debitor_rejection_time: Option<TZTime>,
    pub creditor_rejection_time: Option<TZTime>,
    pub debitor_expiration_time: Option<TZTime>,
    pub creditor_expiration_time: Option<TZTime>,
    pub approvals: Option<Approvals>,
}

impl TransactionItem {
    pub fn get_account_by_role(&self, account_role: AccountRole) -> String {
        match account_role {
            AccountRole::Debitor => self.debitor.to_string(),
            AccountRole::Creditor => self.creditor.to_string(),
        }
    }

    pub fn set_profile_id(&mut self, account_role: AccountRole, id: String) {
        match account_role {
            AccountRole::Debitor => self.debitor_profile_id = Some(id),
            AccountRole::Creditor => self.creditor_profile_id = Some(id),
        }
    }

    pub fn set_none_debitor_first_as_false(&mut self) {
        if self.debitor_first.is_none() {
            self.debitor_first = Some(false)
        }
    }

    pub fn set_none_rule_exec_ids_as_empty(&mut self) {
        if self.rule_exec_ids.is_none() {
            self.rule_exec_ids = Some(vec![])
        }
    }
}

#[derive(Default, Eq, PartialEq, Debug, Deserialize, Serialize, Clone)]
pub struct TransactionItems(pub Vec<TransactionItem>);

#[derive(Debug, Clone, PartialEq)]
pub struct InconsistentValueError;

impl fmt::Display for InconsistentValueError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "inconsistent debitor_first values")
    }
}

const FIXED_DECIMAL_PLACES: usize = 3;

impl TransactionItems {
    pub fn list_accounts(&self) -> Vec<String> {
        let mut accounts: Vec<String> = vec![];
        for ti in self.0.iter() {
            if !accounts.contains(&ti.creditor) {
                accounts.push(ti.creditor.clone())
            }
            if !accounts.contains(&ti.debitor) {
                accounts.push(ti.debitor.clone())
            }
        }
        accounts
    }

    pub fn list_role_accounts(&self) -> Vec<(AccountRole, String)> {
        let mut role_accounts: Vec<(AccountRole, String)> = vec![];
        for ti in self.0.iter() {
            let debitor_account = (AccountRole::Debitor, ti.debitor.clone());
            if !role_accounts.contains(&debitor_account) {
                role_accounts.push(debitor_account)
            }
            let creditor_account = (AccountRole::Creditor, ti.creditor.clone());
            if !role_accounts.contains(&creditor_account) {
                role_accounts.push(creditor_account)
            }
        }
        role_accounts
    }

    pub fn add_profile_ids(&mut self, account_profiles: AccountProfiles) {
        for ti in self.0.iter_mut() {
            if ti.debitor_profile_id.is_none() {
                let debitor_profile = account_profiles
                    .match_profile_by_account(ti.debitor.clone())
                    .unwrap();
                ti.debitor_profile_id = debitor_profile.get_id();
            }

            if ti.creditor_profile_id.is_none() {
                let creditor_profile = account_profiles
                    .match_profile_by_account(ti.creditor.clone())
                    .unwrap();
                ti.creditor_profile_id = creditor_profile.get_id();
            }
        }
    }

    pub fn sum_value(&self) -> String {
        let mut sum: f32 = 0.0;
        for ti in self.0.iter() {
            let item_price: f32 = ti.price.parse().unwrap();
            let item_quantity: f32 = ti.quantity.parse().unwrap();
            let item_value = item_price * item_quantity;
            sum += item_value;
        }
        format!("{sum:.FIXED_DECIMAL_PLACES$}")
    }

    pub fn set_debitor_first_default(&mut self) {
        for ti in self.0.iter_mut() {
            ti.set_none_debitor_first_as_false()
        }
    }

    pub fn set_empty_rule_exec_ids(&mut self) {
        for ti in self.0.iter_mut() {
            ti.set_none_rule_exec_ids_as_empty()
        }
    }

    pub fn is_debitor_first(&self) -> std::result::Result<bool, InconsistentValueError> {
        let mut true_count = 0;
        let mut false_count = 0;

        for ti in self.0.iter() {
            if ti.debitor_first.is_some() {
                if ti.debitor_first.unwrap() {
                    true_count += 1;
                };
                // not using else for untyped json values
                if !ti.debitor_first.unwrap() {
                    false_count += 1;
                };
            } else {
                false_count += 1;
            }
        }

        let length = self.0.len();

        if false_count == length {
            Ok(false)
        } else if true_count == length {
            Ok(true)
        } else {
            Err(InconsistentValueError)
        }
    }
}

#[cfg(test)]
mod tests {

    use super::*;
    use crate::approval::Approval;
    use crate::transaction::tests::create_test_transaction;
    use serde_json;

    #[test]
    fn it_deserializes_a_transaction_item() {
        let got: TransactionItem = serde_json::from_str(
            r#"
        {
            "id": null,
            "transaction_id": null,
            "item_id": "bottled water",
            "price": "1.000",
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
            "approvals": []
        }"#,
        )
        .unwrap();

        let want = create_test_transaction_item();

        if got != want {
            panic!("got {:#?}, want {:#?}", got, want);
        }
    }

    #[test]
    fn it_deserializes_transaction_items() {
        let got: TransactionItems = serde_json::from_str(
            r#"
	[
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
	"#,
        )
        .unwrap();

        let want: TransactionItems = create_test_transaction_items();

        if got != want {
            panic!("got {:#?}, want {:#?}", got, want)
        }
    }

    #[test]
    fn it_returns_creditor_first() {
        let test_transaction = create_test_transaction();
        let got = test_transaction
            .transaction_items
            .is_debitor_first()
            .unwrap();
        let want = false;
        assert_eq!(got, want);
    }

    #[test]
    fn it_returns_debitor_first() {
        let test_transaction = create_test_debitor_first_transaction_items();
        let got = test_transaction.is_debitor_first().unwrap();
        let want = true;
        assert_eq!(got, want);
    }

    #[test]
    fn it_returns_inconsistent_err() {
        let test_transaction = create_test_inconsistent_err_transaction_items();
        let got = test_transaction.is_debitor_first().map_err(|e| e);
        let want = Err(InconsistentValueError);
        assert_eq!(got, want);
    }

    pub fn create_test_transaction_item() -> TransactionItem {
        TransactionItem {
            id: None,
            transaction_id: None,
            item_id: String::from("bottled water"),
            price: String::from("1.000"),
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
            approvals: Some(Approvals(vec![])),
        }
    }

    pub fn create_test_transaction_items() -> TransactionItems {
        TransactionItems(vec![
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
        ])
    }

    pub fn create_test_debitor_first_transaction_items() -> TransactionItems {
        TransactionItems(vec![
            TransactionItem {
                id: None,
                transaction_id: None,
                item_id: String::from("bread"),
                price: String::from("3.000"),
                quantity: String::from("2"),
                debitor_first: Some(true),
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
                debitor_first: Some(true),
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
        ])
    }

    pub fn create_test_inconsistent_err_transaction_items() -> TransactionItems {
        TransactionItems(vec![
            TransactionItem {
                id: None,
                transaction_id: None,
                item_id: String::from("bread"),
                price: String::from("3.000"),
                quantity: String::from("2"),
                debitor_first: Some(true),
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
        ])
    }
}
