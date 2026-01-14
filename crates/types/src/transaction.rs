use crate::{
    account_role::AccountRole,
    approval::{ApprovalError, Approvals},
    time::TZTime,
    transaction_item::{TransactionItem, TransactionItemError, TransactionItems},
};
use async_graphql::{ComplexObject, Object, SimpleObject};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::{error::Error, vec};
use thiserror::Error;
use tokio_postgres::Row;

#[derive(Error, Debug)]
pub enum TransactionError {
    #[error("adding to non empty transaction items")]
    AddingToNonEmptyTransactionItems,
    #[error("missing transaction id")]
    MissingTransactionId,
    #[error("missing author in transaction items")]
    MissingAuthorInTransactionItems,
    #[error("missing author in transaction")]
    MissingAuthorInTransaction,
    #[error("missing auth_account in transaction")]
    MissingAuthAccountInTransaction,
    #[error("missing author role in transaction")]
    MissingAuthorRoleInTransaction,
}

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
    pub fn new(
        author: String,
        equilibrium_time: Option<TZTime>,
        transaction_items: TransactionItems,
    ) -> Self {
        let mut transaction = Transaction {
            id: None,
            rule_instance_id: None,
            author: Some(author),
            author_device_id: None,
            author_device_latlng: None,
            author_role: None,
            equilibrium_time,
            sum_value: transaction_items.sum_value(),
            transaction_items,
        };
        // temp until value added in test data
        transaction.set_author_role().unwrap();
        transaction
    }

    pub fn test_unique_contra_accounts(&self) -> Result<(), Box<dyn Error>> {
        self.transaction_items.test_unique_contra_accounts()
    }

    pub fn list_approvals(&self) -> Result<Approvals, Box<dyn Error>> {
        self.transaction_items.list_approvals()
    }

    pub fn test_pending_role_approval(
        &self,
        auth_account: &str,
        account_role: AccountRole,
    ) -> Result<(), ApprovalError> {
        self.transaction_items
            .test_pending_role_approval(auth_account, account_role)
    }

    pub fn add_transaction_items(
        &mut self,
        transaction_items: TransactionItems,
    ) -> Result<(), TransactionError> {
        if self.id.is_none() {
            return Err(TransactionError::MissingTransactionId);
        }
        if !self.transaction_items.is_empty() {
            return Err(TransactionError::AddingToNonEmptyTransactionItems);
        }
        let transaction_id = self.id.clone().unwrap().parse::<i32>().unwrap();
        let filtered = transaction_items
            .filter_by_transaction(transaction_id)
            .unwrap();
        self.transaction_items = filtered;
        Ok(())
    }

    pub fn build(
        &mut self,
        mut transaction_items: TransactionItems,
        approvals: Approvals,
    ) -> Result<(), Box<dyn Error>> {
        transaction_items.add_approvals(approvals)?;
        self.add_transaction_items(transaction_items)?;
        Ok(())
    }

    pub fn set_author_role(&mut self) -> Result<(), Box<dyn Error>> {
        if self.author.is_none() {
            return Err(Box::new(TransactionError::MissingAuthorInTransaction));
        }

        let author = self.author.clone().unwrap();

        // test author role in transaction items if transaction is NOT rule generated
        for ti in self.transaction_items.0.iter() {
            if ti.debitor == author {
                self.author_role = Some(AccountRole::Debitor);
                return Ok(());
            } else if ti.creditor == author {
                self.author_role = Some(AccountRole::Creditor);
                return Ok(());
            }
        }

        Err(Box::new(TransactionError::MissingAuthorInTransactionItems))
    }

    pub fn get_sum_value(&self) -> String {
        self.transaction_items.sum_value()
    }

    pub fn test_sum_value(&self) -> Result<(), TransactionItemError> {
        let stated: Decimal = self.sum_value.parse().unwrap();
        let computed: Decimal = self.transaction_items.sum_value().parse().unwrap();
        if stated != computed {
            return Err(TransactionItemError::SumValueFailure {
                stated: stated.to_string(),
                computed: computed.to_string(),
            });
        }
        Ok(())
    }
}

impl From<Row> for Transaction {
    fn from(row: Row) -> Self {
        Self {
            id: row.get(0),
            rule_instance_id: row.get(1),
            author: row.get(2),
            author_device_id: row.get(3),
            author_device_latlng: row.get(4),
            author_role: row.get(5),
            equilibrium_time: row.get(6),
            sum_value: row.get(7),
            transaction_items: TransactionItems(vec![]),
        }
    }
}

impl From<&Row> for Transaction {
    fn from(row: &Row) -> Self {
        Self {
            id: row.get(0),
            rule_instance_id: row.get(1),
            author: row.get(2),
            author_device_id: row.get(3),
            author_device_latlng: row.get(4),
            author_role: row.get(5),
            equilibrium_time: row.get(6),
            sum_value: row.get(7),
            transaction_items: TransactionItems(vec![]),
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
    fn it_tests_unique_contra_accounts_on_a_transaction() {
        let transaction = create_test_transaction();
        match transaction.test_unique_contra_accounts() {
            Ok(()) => (),
            Err(e) => panic!("error: {:?}", e),
        }
    }

    #[test]
    fn it_lists_approvals_from_a_transaction() {
        let transaction = create_test_transaction();
        let test_approvals_0 = transaction.transaction_items.0[0]
            .approvals
            .clone()
            .unwrap()
            .0;
        let test_approvals_1 = transaction.transaction_items.0[1]
            .approvals
            .clone()
            .unwrap()
            .0;
        let got = transaction.list_approvals().unwrap();

        let mut all_approvals = vec![];
        all_approvals.extend(test_approvals_0);
        all_approvals.extend(test_approvals_1);
        let want = Approvals(all_approvals);

        assert_eq!(got, want)
    }

    #[test]
    fn it_tests_positive_for_pending_role_approvals() {
        let transaction = create_test_transaction();
        match transaction.test_pending_role_approval("JacobWebb", AccountRole::Debitor) {
            Ok(()) => (),
            Err(e) => panic!("error: {:?}", e),
        }
    }

    #[test]
    fn it_tests_positive_for_previously_approved_approval_on_transaction() {
        let mut test_transaction = create_test_transaction();
        let test_approval_time = TZTime::from("2023-10-30T04:56:56Z".to_string());
        let test_approvals = Approvals(vec![
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("JacobWebb"),
                account_role: AccountRole::Debitor,
                device_id: None,
                device_latlng: None,
                approval_time: Some(test_approval_time),
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
        test_transaction.transaction_items.0[0].approvals = Some(test_approvals.clone());
        test_transaction.transaction_items.0[1].approvals = Some(test_approvals);

        let got = test_transaction
            .test_pending_role_approval("JacobWebb", AccountRole::Debitor)
            .unwrap_err();

        assert_eq!(got, ApprovalError::PreviouslyApproved(test_approval_time))
    }

    #[test]
    fn it_tests_positive_for_incomplete_previous_approval_on_transaction() {
        let mut test_transaction = create_test_transaction();
        let test_approval_time = TZTime::from("2023-10-30T04:56:56Z".to_string());
        let test_approvals = Approvals(vec![
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("JacobWebb"),
                account_role: AccountRole::Debitor,
                device_id: None,
                device_latlng: None,
                approval_time: Some(test_approval_time),
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
        test_transaction.transaction_items.0[0].approvals = Some(test_approvals.clone());

        let got = test_transaction
            .test_pending_role_approval("JacobWebb", AccountRole::Debitor)
            .unwrap_err();

        assert_eq!(got, ApprovalError::IncompletePreviousApproval)
    }

    #[test]
    fn it_tests_positive_for_pending_role_approval() {
        let transaction = create_test_transaction();
        match transaction.test_pending_role_approval("JacobWebb", AccountRole::Debitor) {
            Ok(()) => (),
            Err(e) => panic!("error: {:?}", e),
        }
    }

    #[test]
    fn it_adds_transaction_items() {
        let mut test_transaction = create_test_transaction();
        test_transaction.transaction_items = TransactionItems(vec![]);
        let test_transaction_items = create_test_transaction().transaction_items;
        test_transaction
            .add_transaction_items(test_transaction_items)
            .unwrap();
        assert_eq!(test_transaction.transaction_items.len(), 2)
    }

    #[test]
    fn it_will_build_a_transaction() {
        let mut test_transaction = create_test_transaction();
        test_transaction.transaction_items = TransactionItems(vec![]);
        let mut test_transaction_items = create_test_transaction().transaction_items;
        for transaction_item in test_transaction_items.0.iter_mut() {
            transaction_item.approvals = None;
        }
        let test_approvals = create_test_transaction()
            .transaction_items
            .list_approvals()
            .unwrap();
        test_transaction
            .build(test_transaction_items, test_approvals)
            .unwrap();
        assert_eq!(test_transaction.transaction_items.len(), 2);
        for transaction_item in test_transaction.transaction_items.0 {
            assert_eq!(transaction_item.approvals.unwrap().len(), 2);
        }
    }

    #[test]
    fn it_will_build_transactions() {
        let mut test_transactions = create_test_transactions();

        let mut test_transaction_items = TransactionItems(vec![]);

        for transaction in test_transactions.0.iter_mut() {
            // add transaction items to test_transaction_items
            test_transaction_items
                .0
                .extend(transaction.transaction_items.0.clone());
            // then clear transaction items on the transaction
            transaction.transaction_items = TransactionItems(vec![]);
        }

        let mut test_approvals = Approvals(vec![]);

        for test_transaction_item in test_transaction_items.0.iter_mut() {
            // add approvals to test_approvals
            test_approvals
                .0
                .extend(test_transaction_item.approvals.clone().unwrap());
            // then clear approvals on the transaction item
            test_transaction_item.approvals = None;
        }

        test_transactions.build(test_transaction_items, test_approvals);

        for transaction in test_transactions.0 {
            assert_eq!(transaction.transaction_items.len(), 2);
            for transaction_item in transaction.transaction_items.0 {
                assert_eq!(transaction_item.approvals.unwrap().len(), 2);
            }
        }
    }

    #[test]
    fn it_will_add_transaction_items_to_transactions() {
        let mut test_transactions = create_test_transactions();
        let mut test_transaction_items = TransactionItems(vec![]);

        for transaction in test_transactions.0.iter_mut() {
            // add transaction items to test_transaction_items
            test_transaction_items
                .0
                .extend(transaction.transaction_items.0.clone());
            // then clear transaction items on the transaction
            transaction.transaction_items = TransactionItems(vec![]);
        }

        test_transactions
            .add_transaction_items(test_transaction_items)
            .unwrap();

        for transaction in test_transactions.0 {
            assert_eq!(transaction.transaction_items.len(), 2);
        }
    }

    // cadet todo: test remaining branches of get_author_role
    #[test]
    fn it_returns_author_role_found_in_transaction_items() {
        let mut test_transaction = create_test_transaction();
        test_transaction.set_author_role().unwrap();
        assert_eq!(test_transaction.author_role, Some(AccountRole::Creditor))
    }

    #[test]
    fn it_deserializes_a_transaction() {
        let got: Transaction = serde_json::from_str(
            r#"
            {
                "id": "1",
                "rule_instance_id": null,
                "author": "GroceryStore",
                "author_device_id": null,
                "author_device_latlng": null,
                "author_role": "creditor",
                "equilibrium_time": null,
                "sum_value": "21.800",
                "transaction_items": [
                    {
                        "id": "2",
                        "transaction_id": "1",
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
                                "transaction_id": "1",
                                "transaction_item_id": "2",
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
                                "transaction_id": "1",
                                "transaction_item_id": "2",
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
                        "id": "3",
                        "transaction_id": "1",
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
                                "transaction_id": "1",
                                "transaction_item_id": "3",
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
                                "transaction_id": "1",
                                "transaction_item_id": "3",
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
			"id": "1",
			"rule_instance_id": null,
			"author": "GroceryStore",
			"author_device_id": null,
			"author_device_latlng": null,
			"author_role": "creditor",
			"equilibrium_time": null,
			"sum_value": "21.800",
			"transaction_items": [
                {
                    "id": "2",
                    "transaction_id": "1",
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
                            "transaction_id": "1",
                            "transaction_item_id": "2",
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
                            "transaction_id": "1",
                            "transaction_item_id": "2",
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
                    "id": "3",
                    "transaction_id": "1",
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
                            "transaction_id": "1",
                            "transaction_item_id": "3",
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
                            "transaction_id": "1",
                            "transaction_item_id": "3",
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
			"id": "2",
			"rule_instance_id": null,
			"author": "GroceryStore",
			"author_device_id": null,
			"author_device_latlng": null,
			"author_role": "creditor",
			"equilibrium_time": null,
			"sum_value": "21.800",
			"transaction_items": [
                {
                    "id": "4",
                    "transaction_id": "2",
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
                            "transaction_id": "2",
                            "transaction_item_id": "4",
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
                            "transaction_id": "2",
                            "transaction_item_id": "4",
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
                    "id": "5",
                    "transaction_id": "2",
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
                            "transaction_id": "2",
                            "transaction_item_id": "5",
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
                            "transaction_id": "2",
                            "transaction_item_id": "5",
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
            id: Some(String::from("1")),
            rule_instance_id: None,
            author: Some(String::from("GroceryStore")),
            author_device_id: None,
            author_device_latlng: None,
            author_role: Some(AccountRole::Creditor),
            equilibrium_time: None,
            sum_value: String::from("21.800"),
            transaction_items: TransactionItems(vec![
                TransactionItem {
                    id: Some(String::from("2")),
                    transaction_id: Some(String::from("1")),
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
                            transaction_id: Some(String::from("1")),
                            transaction_item_id: Some(String::from("2")),
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
                            transaction_id: Some(String::from("1")),
                            transaction_item_id: Some(String::from("2")),
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
                    id: Some(String::from("3")),
                    transaction_id: Some(String::from("1")),
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
                            transaction_id: Some(String::from("1")),
                            transaction_item_id: Some(String::from("3")),
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
                            transaction_id: Some(String::from("1")),
                            transaction_item_id: Some(String::from("3")),
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
                id: Some(String::from("1")),
                rule_instance_id: None,
                author: Some(String::from("GroceryStore")),
                author_device_id: None,
                author_device_latlng: None,
                author_role: Some(AccountRole::Creditor),
                equilibrium_time: None,
                sum_value: String::from("21.800"),
                transaction_items: TransactionItems(vec![
                    TransactionItem {
                        id: Some(String::from("2")),
                        transaction_id: Some(String::from("1")),
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
                                transaction_id: Some(String::from("1")),
                                transaction_item_id: Some(String::from("2")),
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
                                transaction_id: Some(String::from("1")),
                                transaction_item_id: Some(String::from("2")),
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
                        id: Some(String::from("3")),
                        transaction_id: Some(String::from("1")),
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
                                transaction_id: Some(String::from("1")),
                                transaction_item_id: Some(String::from("3")),
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
                                transaction_id: Some(String::from("1")),
                                transaction_item_id: Some(String::from("3")),
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
                id: Some(String::from("2")),
                rule_instance_id: None,
                author: Some(String::from("GroceryStore")),
                author_device_id: None,
                author_device_latlng: None,
                author_role: Some(AccountRole::Creditor),
                equilibrium_time: None,
                sum_value: String::from("21.800"),
                transaction_items: TransactionItems(vec![
                    TransactionItem {
                        id: Some(String::from("4")),
                        transaction_id: Some(String::from("2")),
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
                                transaction_id: Some(String::from("2")),
                                transaction_item_id: Some(String::from("4")),
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
                                transaction_id: Some(String::from("2")),
                                transaction_item_id: Some(String::from("4")),
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
                        id: Some(String::from("5")),
                        transaction_id: Some(String::from("2")),
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
                                transaction_id: Some(String::from("2")),
                                transaction_item_id: Some(String::from("5")),
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
                                transaction_id: Some(String::from("2")),
                                transaction_item_id: Some(String::from("5")),
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

impl Transactions {
    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn build(&mut self, transaction_items: TransactionItems, approvals: Approvals) {
        for transaction in self.0.iter_mut() {
            transaction
                .build(transaction_items.clone(), approvals.clone())
                .unwrap();
        }
    }

    // cadet todo: add test
    pub fn list_ids(&self) -> Result<Vec<i32>, TransactionError> {
        let mut ids: Vec<i32> = vec![];
        for transaction in self.0.iter() {
            if transaction.id.is_none() {
                return Err(TransactionError::MissingTransactionId);
            }
            let id = transaction.id.clone().unwrap().parse::<i32>().unwrap();
            ids.push(id);
        }
        Ok(ids)
    }

    pub fn add_transaction_items(
        &mut self,
        transaction_items: TransactionItems,
    ) -> Result<(), TransactionError> {
        for transaction in self.0.iter_mut() {
            transaction.add_transaction_items(transaction_items.clone())?;
        }
        Ok(())
    }
}

#[Object]
impl Transactions {
    async fn transactions(&self) -> Vec<Transaction> {
        self.0.clone()
    }
}

impl IntoIterator for Transactions {
    type Item = Transaction;
    type IntoIter = vec::IntoIter<Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

impl From<Vec<Row>> for Transactions {
    fn from(rows: Vec<Row>) -> Self {
        Self(rows.into_iter().map(Transaction::from).collect())
    }
}
