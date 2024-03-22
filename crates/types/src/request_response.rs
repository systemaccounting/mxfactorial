use crate::{
    account_role::AccountRole,
    transaction::{Transaction, Transactions},
};
use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, Clone, SimpleObject)]
#[graphql(rename_fields = "snake_case")]
pub struct IntraTransaction {
    pub auth_account: Option<String>,
    pub transaction: Transaction,
}

impl IntraTransaction {
    pub fn new(auth_account: String, transaction: Transaction) -> Self {
        Self {
            auth_account: Some(auth_account),
            transaction,
        }
    }

    pub fn add_rule_tested_values(&mut self, rule_tested: IntraTransaction) {
        self.transaction.set_author_role().unwrap(); // temp until value added in test data
        self.transaction.sum_value = rule_tested.transaction.sum_value;
        self.transaction.transaction_items = rule_tested.transaction.transaction_items;
    }

    // cadet todo: unit test
    pub fn from_json_string(json_string: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json_string)
    }
}

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize)]
pub struct IntraTransactions {
    pub auth_account: Option<String>,
    pub transactions: Transactions,
}

impl IntraTransactions {
    pub fn new(auth_account: String, transactions: Transactions) -> Self {
        Self {
            auth_account: Some(auth_account),
            transactions,
        }
    }
}

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize)]
pub struct RequestApprove {
    pub auth_account: String,
    pub id: String,
    pub account_name: String,
    pub account_role: AccountRole,
}

impl RequestApprove {
    pub fn new(
        auth_account: String,
        transaction_id: String,
        account_name: String,
        account_role: AccountRole,
    ) -> Self {
        Self {
            auth_account,
            id: transaction_id,
            account_name,
            account_role,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct QueryById {
    pub auth_account: String,
    pub account_name: String,
    pub id: String,
}

#[derive(Debug, Deserialize)]
pub struct QueryByAccount {
    pub auth_account: String,
    pub account_name: String,
}
