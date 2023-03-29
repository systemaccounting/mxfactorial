use crate::transaction;
use serde::{Deserialize, Serialize};

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize)]
pub struct IntraTransaction {
    pub auth_account: Option<String>,
    pub transaction: transaction::Transaction,
}
