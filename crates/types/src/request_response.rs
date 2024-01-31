use crate::{
    account_role::AccountRole,
    transaction::{Transaction, Transactions},
};
use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, SimpleObject)]
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
}

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize)]
pub struct IntraTransactions {
    pub auth_account: Option<String>,
    pub transactions: Transactions,
}

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize)]
pub struct RequestApprove {
    auth_account: String,
    id: String,
    account_name: String,
    account_role: AccountRole,
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
