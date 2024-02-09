use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct AccountBalance {
    pub account_name: String,
    pub current_balance: String,
    pub current_transaction_item_id: String,
}
