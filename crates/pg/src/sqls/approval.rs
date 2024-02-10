use crate::sqls::common::*;
use types::approval::Approval;

const APPROVAL_TABLE: &str = "approval";

#[derive(Debug)]
pub struct ApprovalTable {
    inner: Table,
}

impl TableTrait<ApprovalTable> for ApprovalTable {
    fn new() -> ApprovalTable {
        Self {
            inner: Table::new::<Approval>(APPROVAL_TABLE),
        }
    }

    fn get_column(&self, column: &str) -> String {
        self.inner.get_column(column)
    }

    fn name(&self) -> &str {
        self.inner.name
    }
}

impl ApprovalTable {
    fn insert_columns(&self) -> [String; 9] {
        [
            self.get_column("rule_instance_id"),
            self.get_column("transaction_id"),
            self.get_column("transaction_item_id"),
            self.get_column("account_name"),
            self.get_column("account_role"),
            self.get_column("device_id"),
            self.get_column("device_latlng"),
            self.get_column("approval_time"),
            self.get_column("expiration_time"),
        ]
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

            for c in 0..columns.len() {
                let column = &columns[c];

                let value = match column.as_str() {
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

                values.push_str(value.as_str());

                if c < columns.len() - 1 {
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
            columns.join(", "),
            VALUES,
            values
        )
    }

    pub fn insert_approvals_sql(&self, row_count: usize) -> String {
        let columns = self.insert_columns();
        let values = values_params(&columns, row_count, &mut 1);
        format!(
            "{} {} ({}) {} {}",
            INSERT_INTO,
            self.name(),
            columns.join(", "),
            VALUES,
            values
        )
    }

    pub fn select_approvals_by_transaction_id_sql(&self) -> String {
        format!(
            "{} {} {} {} {} {} {} $1",
            SELECT,
            STAR,
            FROM,
            self.name(),
            WHERE,
            self.get_column("transaction_id"),
            EQUAL
        )
    }

    pub fn select_approvals_by_transaction_ids_sql(&self, row_count: usize) -> String {
        let values = in_params(row_count);
        format!(
            "{} {} {} {} {} {} {} {}",
            SELECT,
            STAR,
            FROM,
            self.name(),
            WHERE,
            self.get_column("transaction_id"),
            IN,
            values
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_an_insert_approvals_sql() {
        let test_table = ApprovalTable::new();
        let approval_count = 2;
        assert_eq!(test_table.insert_approvals_sql(approval_count), "INSERT INTO approval (rule_instance_id, transaction_id, transaction_item_id, account_name, account_role, device_id, device_latlng, approval_time, expiration_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9), ($10, $11, $12, $13, $14, $15, $16, $17, $18)");
    }

    #[test]
    fn it_creates_a_select_approvals_by_transaction_id_sql() {
        let test_table = ApprovalTable::new();
        assert_eq!(
            test_table.select_approvals_by_transaction_id_sql(),
            "SELECT * FROM approval WHERE transaction_id = $1"
        );
    }

    #[test]
    fn it_creates_a_select_approvals_by_transaction_ids_sql() {
        let test_table = ApprovalTable::new();
        let approval_count = 2;
        assert_eq!(
            test_table.select_approvals_by_transaction_ids_sql(approval_count),
            "SELECT * FROM approval WHERE transaction_id IN ($1, $2)"
        );
    }
}
