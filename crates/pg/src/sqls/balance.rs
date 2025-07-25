use crate::sqls::common::*;
use tokio_postgres::types::Type;
use types::balance::AccountBalance;

const ACCOUNT_BALANCE_TABLE: &str = "account_balance";

#[derive(Debug)]
pub struct AccountBalanceTable {
    inner: Table,
}

impl TableTrait for AccountBalanceTable {
    fn new() -> AccountBalanceTable {
        Self {
            inner: Table::new::<AccountBalance>(ACCOUNT_BALANCE_TABLE),
        }
    }

    fn get_column(&self, column: &str) -> Column {
        self.inner.get_column(column)
    }

    fn get_column_name(&self, column: &str) -> String {
        self.inner.get_column(column).name().to_owned()
    }

    fn name(&self) -> &str {
        self.inner.name
    }

    fn column_count(&self) -> usize {
        self.inner.len()
    }
}

impl AccountBalanceTable {
    fn select_columns_with_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("account_name"),
            self.get_column("current_balance"),
            self.get_column("current_transaction_item_id")
                .cast_column_as(Type::TEXT),
        ])
    }

    fn insert_columns(&self) -> Columns {
        Columns(vec![
            self.get_column("account_name"),
            self.get_column("current_balance"),
            self.get_column("current_transaction_item_id"),
        ])
    }

    pub fn select_account_balances_sql(&self, accounts_count: usize) -> String {
        let columns = self.select_columns_with_casting().join_with_casting();
        let params = create_params(accounts_count, &mut 1);
        format!(
            "{} {} {} {} {} {} {} ({})",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_name").name(),
            IN,
            params
        )
    }

    pub fn select_current_account_balance_by_account_name_sql(&self) -> String {
        format!(
            "{} {} {} {} {} {} {} $1",
            SELECT,
            self.get_column("current_balance").name(),
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_name").name(),
            EQUAL
        )
    }

    pub fn insert_account_balance_sql(&self) -> String {
        let columns = self.insert_columns();
        let values = create_value_params(columns.clone(), 1, &mut 1);
        format!(
            "{} {} ({}) {} {}",
            INSERT_INTO,
            self.name(),
            columns.join(),
            VALUES,
            values
        )
    }

    // todo: add casting for current_transaction_item_id
    pub fn update_account_balance_sql(&self) -> String {
        format!(
            "{} {} {} {} = $1, {} = $2 {} {} = $3",
            UPDATE,
            self.name(),
            SET,
            self.get_column("current_balance").name(),
            self.get_column("current_transaction_item_id").name(),
            WHERE,
            self.get_column("account_name").name()
        )
    }

    pub fn update_account_balances_sql(&self, transaction_item_count: usize) -> String {
        let row_count = transaction_item_count * 2; // x 2 = 1 creditor + 1 debtor
        let mut positional_parameter = 1;
        let mut values = String::new();
        for i in 0..row_count {
            values.push_str(&format!("{ROW}("));
            for c in 0..3 {
                values.push_str(&format!("${positional_parameter}"));
                if c == 1 {
                    values.push_str(format!("::{TEXT}").as_str());
                }
                positional_parameter += 1;
                if c < 2 {
                    values.push_str(", ");
                }
            }
            values.push_str(format!(", {NULL}, {NULL}").as_str()); // add nulls for the last two columns (created_at, updated_at
            let self_name = self.name();
            values.push_str(format!(")::{self_name}").as_str());
            if i < row_count - 1 {
                values.push_str(", ");
            }
        }
        format!("{SELECT} {CHANGE_BALANCES}({values})")
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
			"SELECT account_name, current_balance, current_transaction_item_id::text FROM account_balance WHERE account_name IN ($1, $2)"
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
        let transaction_item_count = 1;
        let test_table = AccountBalanceTable::new();
        assert_eq!(
            test_table.update_account_balances_sql(transaction_item_count),
            "SELECT change_balances(ROW($1, $2::text, $3, NULL, NULL)::account_balance, ROW($4, $5::text, $6, NULL, NULL)::account_balance)"
        );
    }
}
