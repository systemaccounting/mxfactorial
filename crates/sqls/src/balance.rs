use crate::common::*;
use types::balance::AccountBalance;

const ACCOUNT_BALANCE_TABLE: &str = "account_balance";

#[derive(Debug)]
pub struct AccountBalanceTable {
    inner: Table,
}

impl TableTrait<AccountBalanceTable> for AccountBalanceTable {
    fn new() -> AccountBalanceTable {
        Self {
            inner: Table::new::<AccountBalance>(ACCOUNT_BALANCE_TABLE),
        }
    }

    fn get_column(&self, column: &str) -> String {
        self.inner.get_column(column)
    }

    fn name(&self) -> &str {
        self.inner.name
    }
}

impl AccountBalanceTable {
    fn select_columns(&self) -> [String; 2] {
        [
            self.get_column("account_name"),
            self.get_column("current_balance"),
        ]
    }

    fn insert_columns(&self) -> [String; 3] {
        [
            self.get_column("account_name"),
            self.get_column("current_balance"),
            self.get_column("current_transaction_item_id"),
        ]
    }

    pub fn select_account_balances_sql(&self, accounts_count: usize) -> String {
        let columns = self.select_columns();
        let params = in_params(accounts_count);
        format!(
            "{} {} {} {} {} {} {} {}",
            SELECT,
            columns.join(", "),
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_name"),
            IN,
            params
        )
    }

    pub fn select_current_account_balance_by_account_name_sql(&self) -> String {
        format!(
            "{} {} {} {} {} {} {} $1",
            SELECT,
            self.get_column("current_balance"),
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_name"),
            EQUAL
        )
    }

    pub fn insert_account_balance_sql(&self) -> String {
        let columns = self.insert_columns();
        let values = values_params(&columns, 1, &mut 1);
        format!(
            "{} {} ({}) {} {}",
            INSERT_INTO,
            self.name(),
            columns.join(", "),
            VALUES,
            values
        )
    }

    pub fn update_account_balance_sql(&self) -> String {
        format!(
            "{} {} {} {} = $1, {} = $2 {} {} = $3",
            UPDATE,
            self.name(),
            SET,
            self.get_column("current_balance"),
            self.get_column("current_transaction_item_id"),
            WHERE,
            self.get_column("account_name")
        )
    }

    pub fn update_account_balances_sql(transaction_item_count: usize) -> String {
        let values = balance_change_params(transaction_item_count);
        format!("{} {}({})", SELECT, CHANGE_ACCOUNT_BALANCES, values)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_a_select_account_balances_sql() {
        let account_count = 2;
        let test_table = AccountBalanceTable::new();
        assert_eq!(
			test_table.select_account_balances_sql(account_count),
			"SELECT account_name, current_balance FROM account_balance WHERE account_name IN ($1, $2)"
		);
    }

    #[test]
    fn it_creates_a_select_current_account_balance_by_account_name_sql() {
        let test_table = AccountBalanceTable::new();
        assert_eq!(
            test_table.select_current_account_balance_by_account_name_sql(),
            "SELECT current_balance FROM account_balance WHERE account_name = $1"
        );
    }

    #[test]
    fn it_creates_an_insert_account_balance_sql() {
        let test_table = AccountBalanceTable::new();
        assert_eq!(
			test_table.insert_account_balance_sql(),
			"INSERT INTO account_balance (account_name, current_balance, current_transaction_item_id) VALUES ($1, $2, $3)"
		);
    }

    #[test]
    fn it_creates_an_update_account_balance_sql() {
        let test_table = AccountBalanceTable::new();
        assert_eq!(
			test_table.update_account_balance_sql(),
			"UPDATE account_balance SET current_balance = $1, current_transaction_item_id = $2 WHERE account_name = $3"
		);
    }

    #[test]
    fn it_creates_an_update_account_balances_sql() {
        let transaction_item_count = 2;
        assert_eq!(
            AccountBalanceTable::update_account_balances_sql(transaction_item_count),
            "SELECT change_account_balances(($1, $2, $3), ($4, $5, $6))"
        );
    }
}
