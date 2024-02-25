use rust_decimal::Decimal;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct AccountBalance {
    pub account_name: String,
    pub current_balance: Decimal,
    pub current_transaction_item_id: String,
}
