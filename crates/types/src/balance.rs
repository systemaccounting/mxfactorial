use std::ops::Index;

use rust_decimal::Decimal;
use serde::Deserialize;
use tokio_postgres::Row;

#[derive(Debug, Deserialize, Eq, PartialEq, Clone)]
pub struct AccountBalance {
    pub account_name: String,
    pub current_balance: Decimal,
    pub current_transaction_item_id: Option<String>,
}

impl From<Row> for AccountBalance {
    fn from(row: Row) -> Self {
        AccountBalance {
            account_name: row.get(0),
            current_balance: row.get(1),
            current_transaction_item_id: row.get(2),
        }
    }
}

#[derive(Debug, Deserialize, Clone, Default)]
pub struct AccountBalances(Vec<AccountBalance>);

impl AccountBalances {
    pub fn new() -> Self {
        AccountBalances::default()
    }

    pub fn push(&mut self, account_balance: AccountBalance) {
        self.0.push(account_balance);
    }
}

impl IntoIterator for AccountBalances {
    type Item = AccountBalance;
    type IntoIter = std::vec::IntoIter<Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

impl From<Vec<Row>> for AccountBalances {
    fn from(rows: Vec<Row>) -> Self {
        let mut account_balances = AccountBalances::new();
        for row in rows {
            account_balances.push(AccountBalance::from(row));
        }
        account_balances
    }
}

impl Index<usize> for AccountBalances {
    type Output = AccountBalance;

    fn index(&self, index: usize) -> &Self::Output {
        &self.0[index]
    }
}
