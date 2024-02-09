use crate::common::*;
use types::transaction_item::TransactionItem;

const TRANSACTION_ITEM_TABLE: &str = "transaction_item";

#[derive(Debug)]
pub struct TransactionItemTable {
    inner: Table,
}

impl TableTrait<TransactionItemTable> for TransactionItemTable {
    fn new() -> TransactionItemTable {
        Self {
            inner: Table::new::<TransactionItem>(TRANSACTION_ITEM_TABLE),
        }
    }

    fn get_column(&self, column: &str) -> String {
        self.inner.get_column(column)
    }

    fn name(&self) -> &str {
        self.inner.name
    }
}

impl TransactionItemTable {
    fn insert_columns(&self) -> [String; 17] {
        [
            self.get_column("transaction_id"),
            self.get_column("item_id"),
            self.get_column("price"),
            self.get_column("quantity"),
            self.get_column("debitor_first"),
            self.get_column("rule_instance_id"),
            self.get_column("rule_exec_ids"),
            self.get_column("unit_of_measurement"),
            self.get_column("units_measured"),
            self.get_column("debitor"),
            self.get_column("creditor"),
            self.get_column("debitor_profile_id"),
            self.get_column("creditor_profile_id"),
            self.get_column("debitor_approval_time"),
            self.get_column("creditor_approval_time"),
            self.get_column("debitor_expiration_time"),
            self.get_column("creditor_expiration_time"),
        ]
    }

    // inserts a values from postgres auxilliary statements
    pub fn insert_transaction_item_with_sql(
        &self,
        tr_aux_table: &str,
        tr_aux_column: &str,
        positional_parameter: &mut i32,
    ) -> String {
        let columns = self.insert_columns();

        // build values with auxilliary statements and positional parameters
        let mut values = String::new();
        values.push('(');
        for c in 0..columns.len() {
            let column = &columns[c];
            let value = if column == "transaction_id" {
                format!("({} {} {} {})", SELECT, tr_aux_column, FROM, tr_aux_table)
            } else {
                let value = format!("${}", positional_parameter);
                *positional_parameter += 1;
                value
            };
            values.push_str(&value);
            if c < columns.len() - 1 {
                values.push_str(", ");
            }
        }
        values.push(')');

        format!(
            "{} {} ({}) {} {} {} {}",
            INSERT_INTO,
            self.name(),
            columns.join(", "),
            VALUES,
            values,
            RETURNING,
            self.get_column("id"),
        )
    }

    pub fn select_transaction_items_by_transaction_id_sql(&self) -> String {
        format!(
            "{} {} {} {} {} {} = $1",
            SELECT,
            self.name(),
            FROM,
            self.name(),
            WHERE,
            self.get_column("transaction_id")
        )
    }

    pub fn select_transaction_items_by_transaction_ids_sql(&self, row_count: usize) -> String {
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
    fn it_creates_an_insert_transaction_item_with_sql() {
        let transaction_item_table = TransactionItemTable::new();
        let sql = transaction_item_table.insert_transaction_item_with_sql(
            "insert_transaction",
            "id",
            &mut 1,
        );
        assert_eq!(
			sql,
			"INSERT INTO transaction_item (transaction_id, item_id, price, quantity, debitor_first, rule_instance_id, rule_exec_ids, unit_of_measurement, units_measured, debitor, creditor, debitor_profile_id, creditor_profile_id, debitor_approval_time, creditor_approval_time, debitor_expiration_time, creditor_expiration_time) VALUES ((SELECT id FROM insert_transaction), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id"
		);
    }

    #[test]
    fn it_creates_a_select_transaction_items_by_transaction_id_sql() {
        let transaction_item_table = TransactionItemTable::new();
        let sql = transaction_item_table.select_transaction_items_by_transaction_id_sql();
        assert_eq!(
            sql,
            "SELECT transaction_item FROM transaction_item WHERE transaction_id = $1"
        );
    }

    #[test]
    fn it_creates_a_select_transaction_items_by_transaction_ids_sql() {
        let transaction_item_table = TransactionItemTable::new();
        let sql = transaction_item_table.select_transaction_items_by_transaction_ids_sql(2);
        assert_eq!(
            sql,
            "SELECT * FROM transaction_item WHERE transaction_id IN ($1, $2)"
        );
    }
}
