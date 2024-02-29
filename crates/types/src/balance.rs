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

impl AccountBalance {
    pub fn sufficient_balance(&self, payment: Decimal) -> bool {
        self.current_balance >= payment
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

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn get_account_balance(&self, account_name: &str) -> Option<&AccountBalance> {
        self.0
            .iter()
            .find(|account_balance| account_balance.account_name == account_name)
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
