#![allow(unused_imports)]
use crate::account::AccountProfiles;
use crate::{
    account_role::AccountRole,
    approval::{Approval, Approvals},
    time::TZTime,
};
use async_graphql::{ComplexObject, InputObject, Object, SimpleObject};
use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, Clone, InputObject)]
#[graphql(input_name = "TransactionItemInput", rename_fields = "snake_case")]
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
    #[graphql(skip)]
    pub approvals: Option<Approvals>,
}

// TransactionItem is both a graphql input and output type but the
// approvals field is not an input field so 1) InputObject derived
// on struct TransactionItem with 2) #[graphql(skip)] added above approvals,
// and 3) #[Object] added to impl TransactionItem
// https://async-graphql.github.io/async-graphql/en/define_complex_object.html
// Object must have a resolver defined for each field in its impl

#[Object(rename_fields = "snake_case")]
impl TransactionItem {
    async fn id(&self) -> Option<String> {
        self.id.clone()
    }
    async fn transaction_id(&self) -> Option<String> {
        self.transaction_id.clone()
    }
    async fn item_id(&self) -> String {
        self.item_id.clone()
    }
    async fn price(&self) -> String {
        self.price.clone()
    }
    async fn quantity(&self) -> String {
        self.quantity.clone()
    }
    async fn debitor_first(&self) -> Option<bool> {
        self.debitor_first
    }
    async fn rule_instance_id(&self) -> Option<String> {
        self.rule_instance_id.clone()
    }
    async fn rule_exec_ids(&self) -> Option<Vec<String>> {
        self.rule_exec_ids.clone()
    }
    async fn unit_of_measurement(&self) -> Option<String> {
        self.unit_of_measurement.clone()
    }
    async fn units_measured(&self) -> Option<String> {
        self.units_measured.clone()
    }
    async fn debitor(&self) -> String {
        self.debitor.clone()
    }
    async fn creditor(&self) -> String {
        self.creditor.clone()
    }
    async fn debitor_profile_id(&self) -> Option<String> {
        self.debitor_profile_id.clone()
    }
    async fn creditor_profile_id(&self) -> Option<String> {
        self.creditor_profile_id.clone()
    }
    async fn debitor_approval_time(&self) -> Option<TZTime> {
        self.debitor_approval_time.clone()
    }
    async fn creditor_approval_time(&self) -> Option<TZTime> {
        self.creditor_approval_time.clone()
    }
    async fn debitor_rejection_time(&self) -> Option<TZTime> {
        self.debitor_rejection_time.clone()
    }
    async fn creditor_rejection_time(&self) -> Option<TZTime> {
        self.creditor_rejection_time.clone()
    }
    async fn debitor_expiration_time(&self) -> Option<TZTime> {
        self.debitor_expiration_time.clone()
    }
    async fn creditor_expiration_time(&self) -> Option<TZTime> {
        self.creditor_expiration_time.clone()
    }
    async fn approvals(&self) -> Vec<Approval> {
        self.approvals.clone().unwrap().0
    }
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

impl From<Vec<TransactionItem>> for TransactionItems {
    fn from(transaction_items: Vec<TransactionItem>) -> Self {
        Self(transaction_items)
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
    use crate::account::AccountProfile;
    use crate::approval::Approval;
    use crate::transaction::tests::create_test_transaction;
    use serde_json;

    #[test]
    fn it_gets_creditor_account_by_role() {
        let test_creditor_role = AccountRole::Creditor;
        let test_tr_item = create_test_transaction_item();
        let got = test_tr_item.get_account_by_role(test_creditor_role);
        let want = String::from("GroceryStore");
        assert_eq!(got, want, "got {}, want {}", got, want)
    }

    #[test]
    fn it_gets_debitor_account_by_role() {
        let test_creditor_role = AccountRole::Debitor;
        let test_tr_item = create_test_transaction_item();
        let got = test_tr_item.get_account_by_role(test_creditor_role);
        let want = String::from("JacobWebb");
        assert_eq!(got, want, "got {}, want {}", got, want)
    }

    #[test]
    fn it_sets_creditor_profile_id() {
        let test_creditor_role = AccountRole::Creditor;
        let mut test_tr_item = create_test_transaction_item();
        let test_id = String::from("1");
        test_tr_item.set_profile_id(test_creditor_role, test_id.clone());
        let got = test_tr_item.creditor_profile_id.unwrap();
        let want = test_id;
        assert_eq!(got, want, "got {}, want {}", got, want)
    }

    #[test]
    fn it_sets_debitor_profile_id() {
        let test_debitor_role = AccountRole::Debitor;
        let mut test_tr_item = create_test_transaction_item();
        let test_id = String::from("1");
        test_tr_item.set_profile_id(test_debitor_role, test_id.clone());
        let got = test_tr_item.debitor_profile_id.unwrap();
        let want = test_id;
        assert_eq!(got, want, "got {}, want {}", got, want)
    }

    #[test]
    fn it_sets_debitor_first_as_false() {
        let mut test_tr_item = create_test_transaction_item();
        test_tr_item.set_none_debitor_first_as_false();
        let got = test_tr_item.debitor_first.unwrap();
        let want = false;
        assert_eq!(got, want, "got {}, want {}", got, want)
    }

    #[test]
    fn it_sets_none_rule_exec_ids_as_empty() {
        let mut test_tr_item = create_test_transaction_item();
        test_tr_item.rule_exec_ids = None;
        test_tr_item.set_none_rule_exec_ids_as_empty();
        let got = test_tr_item.rule_exec_ids.unwrap();
        let want: Vec<String> = vec![];
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_adds_profile_ids() {
        let mut test_tr_items = create_test_transaction_items();
        let want_debitor_profile_id = Some(String::from("11"));
        let want_creditor_profile_id = Some(String::from("7"));
        let test_acct_profiles = AccountProfiles(vec![
            AccountProfile {
                id: want_debitor_profile_id.clone(),
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
            },
            AccountProfile {
                id: want_creditor_profile_id.clone(),
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
            },
        ]);
        test_tr_items.add_profile_ids(test_acct_profiles);
        for t in test_tr_items.0.iter() {
            let got_debitor_profile_id = t.debitor_profile_id.clone();
            assert_eq!(
                got_debitor_profile_id,
                want_debitor_profile_id.clone(),
                "got {:?}, want {:?}",
                got_debitor_profile_id,
                want_debitor_profile_id
            );
            let got_creditor_profile_id = t.creditor_profile_id.clone();
            assert_eq!(
                got_creditor_profile_id,
                want_creditor_profile_id.clone(),
                "got {:?}, want {:?}",
                got_creditor_profile_id,
                want_creditor_profile_id
            )
        }
    }

    #[test]
    fn it_sums_value() {
        let test_tr_items = create_test_transaction_items();
        let got = test_tr_items.sum_value();
        let want = String::from("18.000");
        assert_eq!(got, want, "got {}, want {}", got, want)
    }

    #[test]
    fn it_sets_debitor_first_default() {
        let mut test_tr_items = create_test_transaction_items();
        for t in test_tr_items.0.iter_mut() {
            t.debitor_first = None
        }
        test_tr_items.set_debitor_first_default();
        for t in test_tr_items.0.iter_mut() {
            let got = t.debitor_first.clone();
            let want = Some(false);
            assert_eq!(got, want, "got {:?}, want {:?}", got, want)
        }
    }

    #[test]
    fn it_sets_empty_rule_exec_ids() {
        let mut test_tr_items = create_test_transaction_items();
        for t in test_tr_items.0.iter_mut() {
            t.rule_exec_ids = None
        }
        test_tr_items.set_empty_rule_exec_ids();
        for t in test_tr_items.0.iter_mut() {
            let got = t.rule_exec_ids.clone();
            let want = Some(vec![]);
            assert_eq!(got, want, "got {:?}, want {:?}", got, want)
        }
    }

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
    fn it_lists_accounts() {
        let test_tr_items = create_test_transaction_items();
        let got = test_tr_items.list_accounts();
        let want = vec!["GroceryStore", "JacobWebb"];
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
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
    fn it_returns_debitor_first_as_false_with_none() {
        let mut test_tr_items = create_test_debitor_first_transaction_items();
        for t in test_tr_items.0.iter_mut() {
            t.debitor_first = None;
        }
        let got = test_tr_items.is_debitor_first().unwrap();
        let want = false;
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
