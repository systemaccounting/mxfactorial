use crate::sqls::common::*;
use tokio_postgres::types::Type;
use types::rule::{ApprovalRuleInstance, TransactionItemRuleInstance, TransactionRuleInstance};

// transaction_rule_instance table

const TRANSACTION_RULE_INSTANCE_TABLE: &str = "transaction_rule_instance";

pub struct TransactionRuleInstanceTable {
    inner: Table,
}

impl TableTrait for TransactionRuleInstanceTable {
    fn new() -> TransactionRuleInstanceTable {
        Self {
            inner: Table::new::<TransactionRuleInstance>(TRANSACTION_RULE_INSTANCE_TABLE),
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

impl TransactionRuleInstanceTable {
    fn select_all_with_text_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("id").cast_column_as(Type::TEXT),
            self.get_column("rule_name"),
            self.get_column("rule_instance_name"),
            self.get_column("variable_values"),
            self.get_column("author"),
            self.get_column("author_device_id"),
            self.get_column("author_device_latlng")
                .cast_column_as(Type::TEXT),
            self.get_column("author_role"),
            self.get_column("cron"),
            self.get_column("disabled_time"),
            self.get_column("removed_time"),
            self.get_column("created_at"),
        ])
    }

    pub fn select_by_author_sql(&self) -> String {
        let columns = self.select_all_with_text_casting().join_with_casting();
        format!(
            "{} {} {} {} {} {} {} $1",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("author").name(),
            EQUAL
        )
    }
}

// transaction_item_rule_instance table

const TRANSACTION_ITEM_RULE_INSTANCE_TABLE: &str = "transaction_item_rule_instance";

pub struct TransactionItemRuleInstanceTable {
    inner: Table,
}

impl TableTrait for TransactionItemRuleInstanceTable {
    fn new() -> TransactionItemRuleInstanceTable {
        Self {
            inner: Table::new::<TransactionItemRuleInstance>(TRANSACTION_ITEM_RULE_INSTANCE_TABLE),
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

impl TransactionItemRuleInstanceTable {
    fn select_all_with_text_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("id").cast_column_as(Type::TEXT),
            self.get_column("rule_name"),
            self.get_column("rule_instance_name"),
            self.get_column("variable_values"),
            self.get_column("account_role"),
            self.get_column("account_name"),
            self.get_column("item_id"),
            self.get_column("price").cast_column_as(Type::TEXT),
            self.get_column("quantity").cast_column_as(Type::TEXT),
            self.get_column("country_name"),
            self.get_column("city_name"),
            self.get_column("county_name"),
            self.get_column("state_name"),
            self.get_column("latlng").cast_column_as(Type::TEXT),
            self.get_column("occupation_id").cast_column_as(Type::TEXT),
            self.get_column("industry_id").cast_column_as(Type::TEXT),
            self.get_column("disabled_time"),
            self.get_column("removed_time"),
            self.get_column("created_at"),
        ])
    }

    pub fn select_by_role_account_sql(&self) -> String {
        let columns = self.select_all_with_text_casting().join_with_casting();
        format!(
            "{} {} {} {} {} {} {} $1 {} {} {} $2",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_role").name(),
            EQUAL,
            AND,
            self.get_column("account_name").name(),
            EQUAL
        )
    }

    pub fn select_by_role_state_sql(&self) -> String {
        let columns = self.select_all_with_text_casting().join_with_casting();
        format!(
            "{} {} {} {} {} {} {} $1 {} {} {} $2",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_role").name(),
            EQUAL,
            AND,
            self.get_column("state_name").name(),
            EQUAL
        )
    }
}

// approval_rule_instance table

const APPROVAL_RULE_INSTANCE_TABLE: &str = "approval_rule_instance";

pub struct ApprovalRuleInstanceTable {
    inner: Table,
}

impl TableTrait for ApprovalRuleInstanceTable {
    fn new() -> ApprovalRuleInstanceTable {
        Self {
            inner: Table::new::<ApprovalRuleInstance>(APPROVAL_RULE_INSTANCE_TABLE),
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

impl ApprovalRuleInstanceTable {
    fn select_all_with_text_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("id").cast_column_as(Type::TEXT),
            self.get_column("rule_name"),
            self.get_column("rule_instance_name"),
            self.get_column("variable_values"),
            self.get_column("account_role"),
            self.get_column("account_name"),
            self.get_column("disabled_time"),
            self.get_column("removed_time"),
            self.get_column("created_at"),
        ])
    }

    pub fn insert_columns(&self) -> Columns {
        Columns(vec![
            self.get_column("rule_name"),
            self.get_column("rule_instance_name"),
            self.get_column("account_role"),
            self.get_column("account_name"),
            self.get_column("variable_values"),
        ])
    }

    pub fn select_by_role_account_sql(&self) -> String {
        let columns = self.select_all_with_text_casting().join_with_casting();
        format!(
            "{} {} {} {} {} {} {} $1 {} {} {} $2",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_role").name(),
            EQUAL,
            AND,
            self.get_column("account_name").name(),
            EQUAL
        )
    }

    pub fn select_exists_sql(&self) -> String {
        format!(
            "{} {}({} {} {} {} {} {} {} $1 {} {} {} $2 {} {} {} $3 {} {} {} $4 {} {} {} $5);",
            SELECT,
            EXISTS,
            SELECT,
            "1",
            FROM,
            self.name(),
            WHERE,
            self.get_column("rule_name").name(),
            EQUAL,
            AND,
            self.get_column("rule_instance_name").name(),
            EQUAL,
            AND,
            self.get_column("account_role").name(),
            EQUAL,
            AND,
            self.get_column("account_name").name(),
            EQUAL,
            AND,
            self.get_column("variable_values").name(),
            EQUAL
        )
    }

    pub fn insert_sql(&self) -> String {
        let columns = self.insert_columns();
        let values = create_value_params(columns.clone(), 1, &mut 1);
        format!(
            "{} {} ({}) {} {}",
            INSERT_INTO,
            self.name(),
            columns.join(),
            VALUES,
            values,
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_a_select_by_author_sql() {
        let test_table = TransactionRuleInstanceTable::new();
        assert_eq!(
            test_table.select_by_author_sql(),
            "SELECT id::text, rule_name, rule_instance_name, variable_values, author, author_device_id, author_device_latlng::text, author_role, cron, disabled_time, removed_time, created_at FROM transaction_rule_instance WHERE author = $1"
        );
    }

    #[test]
    fn it_creates_a_select_by_role_account_sql_for_transaction_item() {
        let test_table = TransactionItemRuleInstanceTable::new();
        assert_eq!(
            test_table.select_by_role_account_sql(),
            "SELECT id::text, rule_name, rule_instance_name, variable_values, account_role, account_name, item_id, price::text, quantity::text, country_name, city_name, county_name, state_name, latlng::text, occupation_id::text, industry_id::text, disabled_time, removed_time, created_at FROM transaction_item_rule_instance WHERE account_role = $1 AND account_name = $2"
        );
    }

    #[test]
    fn it_creates_a_select_by_role_state_sql() {
        let test_table = TransactionItemRuleInstanceTable::new();
        assert_eq!(
            test_table.select_by_role_state_sql(),
            "SELECT id::text, rule_name, rule_instance_name, variable_values, account_role, account_name, item_id, price::text, quantity::text, country_name, city_name, county_name, state_name, latlng::text, occupation_id::text, industry_id::text, disabled_time, removed_time, created_at FROM transaction_item_rule_instance WHERE account_role = $1 AND state_name = $2"
        );
    }

    #[test]
    fn it_creates_a_select_by_role_account_sql_for_approval() {
        let test_table = ApprovalRuleInstanceTable::new();
        assert_eq!(
            test_table.select_by_role_account_sql(),
            "SELECT id::text, rule_name, rule_instance_name, variable_values, account_role, account_name, disabled_time, removed_time, created_at FROM approval_rule_instance WHERE account_role = $1 AND account_name = $2"
        );
    }

    #[test]
    fn it_creates_a_select_exists_sql() {
        let test_table = ApprovalRuleInstanceTable::new();
        let expected = "SELECT EXISTS(SELECT 1 FROM approval_rule_instance WHERE rule_name = $1 AND rule_instance_name = $2 AND account_role = $3 AND account_name = $4 AND variable_values = $5);";
        assert_eq!(test_table.select_exists_sql(), expected);
    }

    #[test]
    fn it_creates_an_insert_sql() {
        let test_table = ApprovalRuleInstanceTable::new();
        let expected = "INSERT INTO approval_rule_instance (rule_name, rule_instance_name, account_role, account_name, variable_values) VALUES ($1, $2, $3, $4, $5)";
        assert_eq!(test_table.insert_sql(), expected);
    }
}
