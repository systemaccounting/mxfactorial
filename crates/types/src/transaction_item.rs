#![allow(unused_imports)]
use crate::account::AccountProfiles;
use crate::{
    account_role::AccountRole,
    approval::{Approval, ApprovalError, Approvals},
    time::TZTime,
};
use async_graphql::{ComplexObject, InputObject, Object, SimpleObject};
use rust_decimal::{prelude::FromPrimitive, Decimal};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::error::Error;
use std::fmt;
use thiserror::Error;
use tokio_postgres::Row;

#[derive(Error, Debug, PartialEq, Eq)]
pub enum TransactionItemError {
    #[error("inconsistent debitor_first values")]
    InconsistentValue,
    #[error("self payment detected for {} account", .0)]
    SelfPayment(String),
    #[error("adding to non empty approvals")]
    AddingToNonEmptyApprovals,
    #[error("missing transaction_id in transaction item")]
    MissingTransactionId,
    #[error("missing id in transaction item")]
    MissingTransactionItemId,
    #[error("unmatched transaction items: {:?}", .0)]
    UnmatchedTransactionItems(Vec<TransactionItem>),
    #[error("missing transaction items: {:?}", .0)]
    MissingTransactionItems(Vec<TransactionItem>),
}

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
        self.debitor_approval_time
    }
    async fn creditor_approval_time(&self) -> Option<TZTime> {
        self.creditor_approval_time
    }
    async fn debitor_rejection_time(&self) -> Option<TZTime> {
        self.debitor_rejection_time
    }
    async fn creditor_rejection_time(&self) -> Option<TZTime> {
        self.creditor_rejection_time
    }
    async fn debitor_expiration_time(&self) -> Option<TZTime> {
        self.debitor_expiration_time
    }
    async fn creditor_expiration_time(&self) -> Option<TZTime> {
        self.creditor_expiration_time
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

    pub fn price_times_quantity(&self) -> Decimal {
        let price: Decimal = self.price.parse().unwrap();
        let quantity: Decimal = self.quantity.parse().unwrap();
        price * quantity
    }

    pub fn revenue(&self) -> Decimal {
        self.price_times_quantity()
    }

    pub fn expense(&self) -> Decimal {
        self.price_times_quantity() * Decimal::from_f32(-1.0).unwrap()
    }

    pub fn revenue_string(&self) -> String {
        format!("{:.FIXED_DECIMAL_PLACES$}", self.revenue())
    }

    pub fn expense_string(&self) -> String {
        format!("{:.FIXED_DECIMAL_PLACES$}", self.expense())
    }

    pub fn test_unique_contra_accounts(&self) -> Result<(), TransactionItemError> {
        if self.debitor != self.creditor {
            Ok(())
        } else {
            Err(TransactionItemError::SelfPayment(self.debitor.clone()))
        }
    }

    pub fn list_approvals(&self) -> Result<Approvals, ApprovalError> {
        if self.approvals.is_none() {
            return Err(ApprovalError::ZeroApprovals);
        }
        Ok(self.approvals.clone().unwrap())
    }

    pub fn test_pending_role_approval(
        &self,
        auth_account: &str,
        account_role: AccountRole,
    ) -> Result<(), ApprovalError> {
        if self.approvals.is_none() {
            return Err(ApprovalError::ZeroApprovals);
        }
        self.approvals
            .clone()
            .unwrap()
            .test_pending_role_approval(auth_account, account_role)
    }

    pub fn add_approvals(&mut self, approvals: Approvals) -> Result<(), TransactionItemError> {
        if self.approvals.is_some() {
            return Err(TransactionItemError::AddingToNonEmptyApprovals);
        }
        if self.id.is_none() {
            return Err(TransactionItemError::MissingTransactionItemId);
        }
        if self.transaction_id.is_none() {
            return Err(TransactionItemError::MissingTransactionId);
        }

        let transaction_id = self.transaction_id.clone().unwrap().parse::<i32>().unwrap();
        let transaction_item_id = self.id.clone().unwrap().parse::<i32>().unwrap();

        let filtered = approvals
            .filter_by_transaction_and_transaction_item(transaction_id, transaction_item_id)
            .unwrap();

        self.approvals = Some(filtered);

        Ok(())
    }

    pub fn test_equality(&self, other: &TransactionItem) -> bool {
        self.item_id == other.item_id
            && self.price == other.price
            && self.quantity == other.quantity
            && self.debitor_first == other.debitor_first
            && self.rule_instance_id == other.rule_instance_id
            && self.unit_of_measurement == other.unit_of_measurement
            && self.units_measured == other.units_measured
            && self.debitor == other.debitor
            && self.creditor == other.creditor
    }
}

impl From<Row> for TransactionItem {
    fn from(row: Row) -> Self {
        Self {
            id: row.get(0),
            transaction_id: row.get(1),
            item_id: row.get(2),
            price: row.get(3),
            quantity: row.get(4),
            debitor_first: row.get(5),
            rule_instance_id: row.get(6),
            rule_exec_ids: row.get(7),
            unit_of_measurement: row.get(8),
            units_measured: row.get(9),
            debitor: row.get(10),
            creditor: row.get(11),
            debitor_profile_id: row.get(12),
            creditor_profile_id: row.get(13),
            debitor_approval_time: row.get(14),
            creditor_approval_time: row.get(15),
            debitor_rejection_time: row.get(16),
            creditor_rejection_time: row.get(17),
            debitor_expiration_time: row.get(18),
            creditor_expiration_time: row.get(19),
            approvals: Some(Approvals(vec![])),
        }
    }
}

#[derive(Default, Eq, PartialEq, Debug, Deserialize, Serialize, Clone)]
pub struct TransactionItems(pub Vec<TransactionItem>);

impl From<Vec<TransactionItem>> for TransactionItems {
    fn from(transaction_items: Vec<TransactionItem>) -> Self {
        Self(transaction_items)
    }
}

impl IntoIterator for TransactionItems {
    type Item = TransactionItem;
    type IntoIter = std::vec::IntoIter<Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
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

    pub fn is_debitor_first(&self) -> Result<bool, TransactionItemError> {
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
            Err(TransactionItemError::InconsistentValue)
        }
    }

    pub fn list_unique_debitors(&self) -> Vec<String> {
        let mut debit_accounts: Vec<String> = vec![];
        for ti in self.0.iter() {
            if !debit_accounts.contains(&ti.debitor) {
                debit_accounts.push(ti.debitor.clone())
            }
        }
        debit_accounts
    }

    pub fn map_required_funds_from_debitors(&self) -> HashMap<String, Decimal> {
        let mut required_funds: HashMap<String, Decimal> = HashMap::new();
        for ti in self.0.iter() {
            // skip debitors who already paid
            if ti.debitor_approval_time.is_some() {
                continue;
            }
            let debitor = ti.debitor.clone();
            let price: Decimal = ti.price.parse().unwrap();
            let quantity: Decimal = ti.quantity.parse().unwrap();
            let value = price * quantity;
            if required_funds.contains_key(&debitor) {
                let current_value = required_funds.get(&debitor).unwrap();
                let new_value = current_value + value;
                required_funds.insert(debitor, new_value);
            } else {
                required_funds.insert(debitor, value);
            }
        }
        required_funds
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn test_unique_contra_accounts(&self) -> Result<(), Box<dyn Error>> {
        for ti in self.0.iter() {
            ti.test_unique_contra_accounts()?
        }
        Ok(())
    }

    pub fn list_approvals(&self) -> Result<Approvals, Box<dyn Error>> {
        let mut approvals: Vec<Approval> = vec![];
        for ti in self.0.iter() {
            let ti_approvals = ti.list_approvals()?;
            for a in ti_approvals.0.iter() {
                approvals.push(a.clone())
            }
        }
        Ok(Approvals(approvals))
    }

    pub fn test_pending_role_approval(
        &self,
        auth_account: &str,
        account_role: AccountRole,
    ) -> Result<(), ApprovalError> {
        for ti in self.0.iter() {
            ti.test_pending_role_approval(auth_account, account_role)?
        }
        Ok(())
    }

    pub fn filter_by_transaction(
        &self,
        transaction_id: i32,
    ) -> Result<TransactionItems, TransactionItemError> {
        let mut filtered: Vec<TransactionItem> = vec![];
        for ti in self.0.iter() {
            if ti.transaction_id.is_none() {
                return Err(TransactionItemError::MissingTransactionId);
            }
            let tr_item_tr_id = ti.transaction_id.clone().unwrap().parse::<i32>().unwrap();
            if tr_item_tr_id == transaction_id {
                filtered.push(ti.clone())
            }
        }
        Ok(TransactionItems(filtered))
    }

    pub fn add_approvals(&mut self, approvals: Approvals) -> Result<(), TransactionItemError> {
        for ti in self.0.iter_mut() {
            ti.add_approvals(approvals.clone())?
        }
        Ok(())
    }

    // cadet todo: unit test
    pub fn to_json_string(&self) -> String {
        serde_json::to_string(&self).unwrap()
    }

    pub fn remove_unauthorized_values(&self) -> Self {
        let mut authrorized: Vec<TransactionItem> = vec![];
        for ti in self.0.iter() {
            authrorized.push(TransactionItem {
                id: None,
                transaction_id: None,
                item_id: ti.item_id.clone(),
                price: ti.price.clone(),
                quantity: ti.quantity.clone(),
                debitor_first: ti.debitor_first,
                rule_instance_id: ti.rule_instance_id.clone(),
                rule_exec_ids: None,
                unit_of_measurement: ti.unit_of_measurement.clone(),
                units_measured: ti.units_measured.clone(),
                debitor: ti.debitor.clone(),
                creditor: ti.creditor.clone(),
                debitor_profile_id: None,
                creditor_profile_id: None,
                debitor_approval_time: None,
                creditor_approval_time: None,
                debitor_rejection_time: None,
                creditor_rejection_time: None,
                debitor_expiration_time: None,
                creditor_expiration_time: None,
                approvals: None,
            })
        }
        Self(authrorized)
    }

    pub fn filter_user_added(&self) -> Self {
        let mut filtered: Vec<TransactionItem> = vec![];
        for ti in self.0.iter() {
            if ti.rule_instance_id.is_none() {
                filtered.push(ti.clone())
            }
        }
        Self(filtered)
    }

    pub fn test_equality(&self, other: TransactionItems) -> Result<(), TransactionItemError> {
        let mut missing_items = Vec::new();
        let mut unmatched_items = Vec::new();

        for item in &self.0 {
            if other
                .0
                .iter()
                .any(|other_item| item.test_equality(other_item))
            {
                // do nothing for matching item
            } else {
                // add to missing_items for when item missing
                missing_items.push(item.clone());
            }
        }

        for item in &other.0 {
            if self.0.iter().any(|self_item| item.test_equality(self_item)) {
                // do nothing for matching item
            } else {
                // add to unmatched_items when item unmatched
                unmatched_items.push(item.clone());
            }
        }

        if !missing_items.is_empty() {
            return Err(TransactionItemError::MissingTransactionItems(missing_items));
        }

        if !unmatched_items.is_empty() {
            return Err(TransactionItemError::UnmatchedTransactionItems(
                unmatched_items,
            ));
        }

        Ok(())
    }
}

impl From<Vec<Row>> for TransactionItems {
    fn from(rows: Vec<Row>) -> Self {
        let mut transaction_items: Vec<TransactionItem> = vec![];
        for row in rows {
            transaction_items.push(TransactionItem::from(row))
        }
        Self(transaction_items)
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
                removal_time: None,
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
                removal_time: None,
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
    fn it_lists_unique_debitors() {
        let test_tr_items = create_test_transaction_items();
        let got = test_tr_items.list_unique_debitors();
        let want = vec!["JacobWebb"];
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_maps_required_funds_from_pending_debitors() {
        let test_tr_items = create_test_transaction_items();
        let got = test_tr_items.map_required_funds_from_debitors();
        let mut want = HashMap::new();
        want.insert(String::from("JacobWebb"), Decimal::from_f32(18.0).unwrap());
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_does_not_map_required_funds_from_paid_debitors() {
        let mut test_tr_items = create_test_transaction_items();
        for t in test_tr_items.0.iter_mut() {
            t.debitor_approval_time = Some(TZTime::now());
        }
        let got = test_tr_items.map_required_funds_from_debitors();
        let want = HashMap::new();
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_errors_when_a_transaction_item_detects_self_payment() {
        let mut test_tr_items = create_test_transaction_items();
        let mut test_tr_item = create_test_transaction_item();
        test_tr_item.debitor = String::from("GroceryStore");
        test_tr_item.creditor = String::from("GroceryStore");
        test_tr_items.0.push(test_tr_item);

        assert_eq!(
            test_tr_items
                .clone()
                .test_unique_contra_accounts()
                .unwrap_err()
                .to_string(),
            "self payment detected for GroceryStore account".to_string()
        )
    }

    #[test]
    fn it_lists_approvals_from_a_transaction_item() {
        let test_tr_item = create_test_transaction_item();
        let got = test_tr_item.list_approvals().unwrap();
        let want = Approvals(vec![]);
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_errors_with_zero_approvals_when_listing_transaction_item_approvals() {
        let mut test_tr_item = create_test_transaction_item();
        test_tr_item.approvals = None;
        assert_eq!(
            test_tr_item.list_approvals().unwrap_err().to_string(),
            "zero approvals".to_string()
        )
    }

    #[test]
    fn it_adds_approvals_to_a_transaction_item() {
        let mut test_tr_item = create_test_transaction_item();
        test_tr_item.approvals = None;
        let test_approvals = create_test_approvals();
        let mut with_unmatched = test_approvals.clone();
        with_unmatched.0.append(&mut vec![
            // add an approval with an unmatched transaction_item_id
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
        ]);
        test_tr_item.add_approvals(with_unmatched.clone()).unwrap();
        let got = test_tr_item.approvals.clone().unwrap();
        let want = test_approvals; // without unmatched
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_errors_with_adding_to_non_empty_approvals_on_a_transaction_item() {
        let mut test_tr_item = create_test_transaction_item();
        let test_approvals = create_test_approvals();
        assert_eq!(
            test_tr_item
                .add_approvals(test_approvals)
                .unwrap_err()
                .to_string(),
            "adding to non empty approvals".to_string()
        )
    }

    #[test]
    fn it_errors_with_missing_transaction_id() {
        let mut test_tr_item = create_test_transaction_item();
        test_tr_item.transaction_id = None;
        test_tr_item.approvals = None;
        let test_approvals = create_test_approvals();
        assert_eq!(
            test_tr_item
                .add_approvals(test_approvals)
                .unwrap_err()
                .to_string(),
            "missing transaction_id in transaction item".to_string()
        )
    }

    #[test]
    fn it_errors_with_missing_id() {
        let mut test_tr_item = create_test_transaction_item();
        test_tr_item.id = None;
        test_tr_item.approvals = None;
        let test_approvals = create_test_approvals();
        assert_eq!(
            test_tr_item
                .add_approvals(test_approvals)
                .unwrap_err()
                .to_string(),
            "missing id in transaction item".to_string()
        )
    }

    #[test]
    fn it_will_test_equality_as_negative_on_a_transaction_item() {
        let test_tr_item = create_test_transaction_item();
        let mut test_other = create_test_transaction_item();
        test_other.item_id = String::from("eggs");
        assert_eq!(
            test_tr_item.test_equality(&test_other),
            false,
            "got {}, want {}",
            test_tr_item.test_equality(&test_other),
            false
        )
    }

    #[test]
    fn it_will_test_equality_as_positive_on_a_transaction_item() {
        let test_tr_item = create_test_transaction_item();
        let test_other = create_test_transaction_item();
        assert_eq!(
            test_tr_item.test_equality(&test_other),
            true,
            "got {}, want {}",
            test_tr_item.test_equality(&test_other),
            true
        )
    }

    #[test]
    fn it_lists_approvals_from_transaction_items() {
        let test_tr_items = create_test_transaction_items();
        let got = test_tr_items.list_approvals().unwrap();
        let want = Approvals(vec![
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
        ]);
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_will_filter_by_transaction() {
        let test_tr_items = create_test_transaction_items();
        let mut with_unmatched = test_tr_items.clone();
        with_unmatched.0.append(&mut vec![
            // add an unmatched transaction_id
            TransactionItem {
                id: Some(String::from("3")),
                transaction_id: Some(String::from("2")),
                item_id: String::from("eggs"),
                price: String::from("2.500"),
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
                        transaction_id: Some(String::from("2")),
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
        ]);
        let got = with_unmatched.filter_by_transaction(1).unwrap();
        let want = create_test_transaction_items();
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_will_remove_unauthorized_values() {
        let test_tr_items = create_test_transaction_items();
        let want = TransactionItems(vec![
            TransactionItem {
                id: None,
                transaction_id: None,
                item_id: String::from("bread"),
                price: String::from("3.000"),
                quantity: String::from("2"),
                debitor_first: Some(false),
                rule_instance_id: None,
                rule_exec_ids: None,
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
                approvals: None,
            },
            TransactionItem {
                id: None,
                transaction_id: None,
                item_id: String::from("milk"),
                price: String::from("4.000"),
                quantity: String::from("3"),
                debitor_first: Some(false),
                rule_instance_id: None,
                rule_exec_ids: None,
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
                approvals: None,
            },
        ]);
        let got = test_tr_items.remove_unauthorized_values();
        assert_eq!(got, want, "got {:#?}, want {:#?}", got, want)
    }

    #[test]
    fn it_will_filter_user_added_transaction_items() {
        let mut test_tr_items = create_test_transaction_items();
        test_tr_items.0.push(TransactionItem {
            id: None,
            transaction_id: None,
            item_id: String::from("9% state sales tax"),
            price: String::from("0.270"),
            quantity: String::from("2.000"),
            debitor_first: Some(false),
            rule_instance_id: Some(String::from("9% state sales tax")),
            rule_exec_ids: Some(vec![]),
            unit_of_measurement: None,
            units_measured: None,
            debitor: String::from("JacobWebb"),
            creditor: String::from("StateOfCalifornia"),
            debitor_profile_id: None,
            creditor_profile_id: None,
            debitor_approval_time: None,
            creditor_approval_time: None,
            debitor_rejection_time: None,
            creditor_rejection_time: None,
            debitor_expiration_time: None,
            creditor_expiration_time: None,
            approvals: None,
        });
        let want = create_test_transaction_items();
        let got = test_tr_items.filter_user_added();
        assert_eq!(got, want, "got {:#?}, want {:#?}", got, want)
    }

    #[test]
    fn it_will_test_equality_and_error_with_missing_transaction_items() {
        let mut test_tr_items = create_test_transaction_items();
        let test_other = create_test_transaction_items();
        test_tr_items.0.push(TransactionItem {
            id: None,
            transaction_id: None,
            item_id: String::from("eggs"),
            price: String::from("2.500"),
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
            approvals: None,
        });
        assert_eq!(
            test_tr_items.test_equality(test_other).unwrap_err().to_string(),
            "missing transaction items: [TransactionItem { id: None, transaction_id: None, item_id: \"eggs\", price: \"2.500\", quantity: \"2\", debitor_first: Some(false), rule_instance_id: None, rule_exec_ids: Some([]), unit_of_measurement: None, units_measured: None, debitor: \"JacobWebb\", creditor: \"GroceryStore\", debitor_profile_id: None, creditor_profile_id: None, debitor_approval_time: None, creditor_approval_time: None, debitor_rejection_time: None, creditor_rejection_time: None, debitor_expiration_time: None, creditor_expiration_time: None, approvals: None }]".to_string()
        )
    }

    #[test]
    fn it_will_test_equality_and_error_with_unmatched_transaction_items() {
        let test_tr_items = create_test_transaction_items();
        let mut test_other = create_test_transaction_items();
        test_other.0.push(TransactionItem {
            id: None,
            transaction_id: None,
            item_id: String::from("eggs"),
            price: String::from("2.500"),
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
            approvals: None,
        });
        assert_eq!(
            test_tr_items.test_equality(test_other).unwrap_err().to_string(),
            "unmatched transaction items: [TransactionItem { id: None, transaction_id: None, item_id: \"eggs\", price: \"2.500\", quantity: \"2\", debitor_first: Some(false), rule_instance_id: None, rule_exec_ids: Some([]), unit_of_measurement: None, units_measured: None, debitor: \"JacobWebb\", creditor: \"GroceryStore\", debitor_profile_id: None, creditor_profile_id: None, debitor_approval_time: None, creditor_approval_time: None, debitor_rejection_time: None, creditor_rejection_time: None, debitor_expiration_time: None, creditor_expiration_time: None, approvals: None }]".to_string()
        )
    }

    #[test]
    fn it_will_test_equality_as_positive_on_transaction_items() {
        let test_tr_items = create_test_transaction_items();
        let test_other = create_test_transaction_items();
        assert_eq!(test_tr_items.test_equality(test_other).unwrap(), ())
    }

    #[test]
    fn it_deserializes_a_transaction_item() {
        let got: TransactionItem = serde_json::from_str(
            r#"
        {
            "id": "2",
            "transaction_id": "1",
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
        assert_eq!(got, Err(TransactionItemError::InconsistentValue));
    }

    pub fn create_test_approvals() -> Approvals {
        Approvals(vec![
            Approval {
                id: Some(String::from("3")),
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
                id: Some(String::from("4")),
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
        ])
    }

    pub fn create_test_transaction_item() -> TransactionItem {
        TransactionItem {
            id: Some(String::from("2")),
            transaction_id: Some(String::from("1")),
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
