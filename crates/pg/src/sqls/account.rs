use crate::sqls::common::*;
use types::account::AccountOwner;

const ACCOUNT_TABLE: &str = "account";
const ACCOUNT_OWNER_TABLE: &str = "account_owner";

pub fn insert_account_sql() -> String {
    let columns = Columns(vec![Column::new("name")]);
    let values = create_value_params(columns.clone(), 1, &mut 1);
    format!(
        "{} {} ({}) {} {} {} {}",
        INSERT_INTO,
        ACCOUNT_TABLE,
        columns.join(),
        VALUES,
        values,
        ON_CONFLICT,
        DO_NOTHING,
    )
}

pub fn delete_owner_account_sql() -> String {
    let column = "owner_account";
    format!("{DELETE_FROM} {ACCOUNT_OWNER_TABLE} {WHERE} {column} {EQUAL} $1")
}

pub fn delete_account_sql() -> String {
    let column = "name";
    format!("{DELETE_FROM} {ACCOUNT_TABLE} {WHERE} {column} {EQUAL} $1")
}

pub struct AccountOwnerTable {
    inner: Table,
}

impl TableTrait for AccountOwnerTable {
    fn new() -> Self {
        Self {
            inner: Table::new::<AccountOwner>(ACCOUNT_OWNER_TABLE),
        }
    }

    fn get_column(&self, column: &str) -> Column {
        self.inner.get_column(column)
    }

    fn get_column_name(&self, column: &str) -> String {
        self.inner.get_column_name(column)
    }

    fn name(&self) -> &str {
        self.inner.name
    }

    fn column_count(&self) -> usize {
        self.inner.len()
    }
}

impl AccountOwnerTable {
    pub fn select_approvers_sql(&self) -> String {
        let column_alias = "approver";
        let table = self.name();
        let table_alias = "ao";
        format!(
            "{} {} {}({}, '') {} {}({}, '') {} {} {} {} {} {} {}.{} {} $1 {} {}.{} {} $1",
            SELECT,
            DISTINCT,
            COALESCE,
            self.get_column("owner_account").name(),
            CONCAT,
            COALESCE,
            self.get_column("owner_subaccount").name(),
            AS,
            column_alias,
            FROM,
            table,
            table_alias,
            WHERE,
            table_alias,
            self.get_column("owned_account").name(),
            EQUAL,
            OR,
            table_alias,
            self.get_column("owned_subaccount").name(),
            EQUAL
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_an_insert_account_sql() {
        assert_eq!(
            insert_account_sql(),
            "INSERT INTO account (name) VALUES ($1) ON CONFLICT DO NOTHING"
        );
    }

    #[test]
    fn it_creates_a_delete_owner_account_sql() {
        assert_eq!(
            delete_owner_account_sql(),
            "DELETE FROM account_owner WHERE owner_account = $1"
        );
    }

    #[test]
    fn it_creates_a_delete_account_sql() {
        assert_eq!(delete_account_sql(), "DELETE FROM account WHERE name = $1");
    }

    #[test]
    fn it_creates_a_select_approvers_sql() {
        let test_table = AccountOwnerTable::new();
        let expected = "SELECT DISTINCT coalesce(owner_account, '') || coalesce(owner_subaccount, '') AS approver FROM account_owner ao WHERE ao.owned_account = $1 OR ao.owned_subaccount = $1";
        assert_eq!(test_table.select_approvers_sql(), expected);
    }
}
