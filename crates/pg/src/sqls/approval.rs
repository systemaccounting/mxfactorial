use crate::sqls::common::*;
use tokio_postgres::types::Type;
use types::approval::Approval;

pub const APPROVAL_TABLE: &str = "approval";

#[derive(Debug)]
pub struct ApprovalTable {
    inner: Table,
}

impl TableTrait for ApprovalTable {
    fn new() -> ApprovalTable {
        Self {
            inner: Table::new::<Approval>(APPROVAL_TABLE),
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
}

impl ApprovalTable {
    fn insert_columns(&self) -> Columns {
        Columns(vec![
            self.get_column("rule_instance_id"),
            self.get_column("transaction_id"),
            self.get_column("transaction_item_id"),
            self.get_column("account_name"),
            self.get_column("account_role"),
            self.get_column("device_id"),
            self.get_column("device_latlng").cast_value_as(Type::POINT),
            self.get_column("approval_time"),
            self.get_column("expiration_time"),
        ])
    }

    fn select_all_with_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("id").cast_column_as(Type::TEXT),
            self.get_column("rule_instance_id")
                .cast_column_as(Type::TEXT),
            self.get_column("transaction_id").cast_column_as(Type::TEXT),
            self.get_column("transaction_item_id")
                .cast_column_as(Type::TEXT),
            self.get_column("account_name"),
            self.get_column("account_role"),
            self.get_column("device_id"),
            self.get_column("device_latlng").cast_column_as(Type::TEXT),
            self.get_column("approval_time"),
            self.get_column("rejection_time"),
            self.get_column("expiration_time"),
        ])
    }

    pub fn insert_approval_cte_sql(
        &self,
        tr_aux_table: &str,
        tr_aux_column: &str,
        tr_item_aux_table: &str,
        tr_item_aux_column: &str,
        row_count: usize,
        positional_parameter: &mut i32,
    ) -> String {
        let columns = self.insert_columns();

        let mut values = String::new();

        for r in 0..row_count {
            // build values with auxilliary statements and positional parameters

            values.push('(');

            for (i, c) in columns.clone().enumerate() {
                let mut value = match c.clone().name() {
                    "transaction_id" => {
                        format!("({} {} {} {})", SELECT, tr_aux_column, FROM, tr_aux_table)
                    }
                    "transaction_item_id" => format!(
                        "({} {} {} {})",
                        SELECT, tr_item_aux_column, FROM, tr_item_aux_table
                    ),
                    _ => {
                        let value = format!("${}", positional_parameter);
                        *positional_parameter += 1;
                        value
                    }
                };

                if c.cast_value_as.is_some() {
                    value.push_str(&format!("::{}", c.cast_value_as.unwrap()));
                }

                values.push_str(value.as_str());

                if i < columns.len() - 1 {
                    values.push_str(", ");
                }
            }

            values.push(')');

            if r < row_count - 1 {
                values.push_str(", ");
            }
        }

        format!(
            "{} {} ({}) {} {}",
            INSERT_INTO,
            self.name(),
            columns.join(),
            VALUES,
            values
        )
    }

    pub fn insert_approvals_sql(&self, row_count: usize) -> String {
        let columns = self.insert_columns();
        let values = create_value_params(columns.clone(), row_count, &mut 1);
        format!(
            "{} {} ({}) {} {}",
            INSERT_INTO,
            self.name(),
            columns.join(),
            VALUES,
            values
        )
    }

    pub fn select_approvals_by_transaction_id_sql(&self) -> String {
        let columns = self.select_all_with_casting().join_with_casting();
        format!(
            "{} {} {} {} {} {} {} $1",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("transaction_id").name(),
            EQUAL
        )
    }

    pub fn select_approvals_by_transaction_ids_sql(&self, row_count: usize) -> String {
        let values = create_params(row_count);
        let columns = self.select_all_with_casting().join_with_casting();
        format!(
            "{} {} {} {} {} {} {} ({})",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("transaction_id").name(),
            IN,
            values
        )
    }

    pub fn update_approvals_by_account_and_role_sql(&self) -> String {
        // migrations/schema/000007_approval.up.sql
        // $1 transaction id
        // $2: account name
        // $3: account role
        "SELECT approve_all_role_account($1, $2, $3) AS equilibrium_time".to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_an_insert_approvals_sql() {
        let test_table = ApprovalTable::new();
        let approval_count = 2;
        assert_eq!(test_table.insert_approvals_sql(approval_count), "INSERT INTO approval (rule_instance_id, transaction_id, transaction_item_id, account_name, account_role, device_id, device_latlng, approval_time, expiration_time) VALUES ($1, $2, $3, $4, $5, $6, $7::point, $8, $9), ($10, $11, $12, $13, $14, $15, $16::point, $17, $18)");
    }

    #[test]
    fn it_creates_a_select_approvals_by_transaction_id_sql() {
        let test_table = ApprovalTable::new();
        assert_eq!(
            test_table.select_approvals_by_transaction_id_sql(),
            "SELECT id::text, rule_instance_id::text, transaction_id::text, transaction_item_id::text, account_name, account_role, device_id, device_latlng::text, approval_time, rejection_time, expiration_time FROM approval WHERE transaction_id = $1"
        );
    }

    #[test]
    fn it_creates_a_select_approvals_by_transaction_ids_sql() {
        let test_table = ApprovalTable::new();
        let approval_count = 2;
        assert_eq!(
            test_table.select_approvals_by_transaction_ids_sql(approval_count),
            "SELECT id::text, rule_instance_id::text, transaction_id::text, transaction_item_id::text, account_name, account_role, device_id, device_latlng::text, approval_time, rejection_time, expiration_time FROM approval WHERE transaction_id IN ($1, $2)"
        );
    }

    #[test]
    fn it_creates_an_update_approvals_by_account_and_role_sql() {
        let test_table = ApprovalTable::new();
        assert_eq!(
            test_table.update_approvals_by_account_and_role_sql(),
            "SELECT approve_all_role_account($1, $2, $3) AS equilibrium_time"
        );
    }
}
