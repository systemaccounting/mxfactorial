use crate::sqls::common::*;
use tokio_postgres::types::Type;
use types::transaction_item::TransactionItem;

const TRANSACTION_ITEM_TABLE: &str = "transaction_item";

#[derive(Debug)]
pub struct TransactionItemTable {
    inner: Table,
}

impl TableTrait for TransactionItemTable {
    fn new() -> TransactionItemTable {
        Self {
            inner: Table::new::<TransactionItem>(TRANSACTION_ITEM_TABLE),
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

impl TransactionItemTable {
    fn insert_columns_with_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("transaction_id"),
            self.get_column("item_id"),
            self.get_column("price").cast_value_as(Type::NUMERIC),
            self.get_column("quantity").cast_value_as(Type::NUMERIC),
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
        ])
    }

    // fn_ postgres function
    pub fn fn_insert_columns_with_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("id"),
            self.get_column("transaction_id"),
            self.get_column("item_id"),
            self.get_column("price").cast_value_as(Type::NUMERIC),
            self.get_column("quantity").cast_value_as(Type::NUMERIC),
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
            self.get_column("debitor_rejection_time"),
            self.get_column("creditor_rejection_time"),
        ])
    }

    fn select_all_with_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("id").cast_column_as(Type::TEXT),
            self.get_column("transaction_id").cast_column_as(Type::TEXT),
            self.get_column("item_id"),
            self.get_column("price").cast_column_as(Type::TEXT),
            self.get_column("quantity").cast_column_as(Type::TEXT),
            self.get_column("debitor_first"),
            self.get_column("rule_instance_id")
                .cast_column_as(Type::TEXT),
            self.get_column("rule_exec_ids"),
            self.get_column("unit_of_measurement"),
            self.get_column("units_measured").cast_column_as(Type::TEXT),
            self.get_column("debitor"),
            self.get_column("creditor"),
            self.get_column("debitor_profile_id")
                .cast_column_as(Type::TEXT),
            self.get_column("creditor_profile_id")
                .cast_column_as(Type::TEXT),
            self.get_column("debitor_approval_time"),
            self.get_column("creditor_approval_time"),
            self.get_column("debitor_rejection_time"),
            self.get_column("creditor_rejection_time"),
            self.get_column("debitor_expiration_time"),
            self.get_column("creditor_expiration_time"),
        ])
    }

    // inserts a values from postgres auxilliary statements
    pub fn insert_transaction_item_with_sql(
        &self,
        tr_aux_table: &str,
        tr_aux_column: &str,
        positional_parameter: &mut i32,
    ) -> String {
        let columns = self.insert_columns_with_casting();

        // build values with auxilliary statements and positional parameters
        let mut values = String::new();

        // begin values
        values.push('(');

        for (i, c) in columns.clone().enumerate() {
            let mut value = if c.clone().name() == "transaction_id" {
                format!("({} {} {} {})", SELECT, tr_aux_column, FROM, tr_aux_table)
            } else {
                let value = format!("${}", positional_parameter);

                *positional_parameter += 1;

                value
            };

            if c.clone().cast_value_as.is_some() {
                value.push_str(&format!("::{}", c.clone().cast_value_as.unwrap()));
            }

            values.push_str(&value);

            if i < columns.len() - 1 {
                values.push_str(", ");
            }
        }

        // end values
        values.push(')');

        format!(
            "{} {} ({}) {} {} {} {}",
            INSERT_INTO,
            self.name(),
            columns.join(),
            VALUES,
            values,
            RETURNING,
            self.get_column("id").name(),
        )
    }

    pub fn select_transaction_items_by_transaction_id_sql(&self) -> String {
        let columns = self.select_all_with_casting().join_with_casting();
        format!(
            "{} {} {} {} {} {} = $1",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("transaction_id").name()
        )
    }

    pub fn select_transaction_items_by_transaction_ids_sql(&self, row_count: usize) -> String {
        let values = create_params(row_count, &mut 1);
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
			"INSERT INTO transaction_item (transaction_id, item_id, price, quantity, debitor_first, rule_instance_id, rule_exec_ids, unit_of_measurement, units_measured, debitor, creditor, debitor_profile_id, creditor_profile_id, debitor_approval_time, creditor_approval_time, debitor_expiration_time, creditor_expiration_time) VALUES ((SELECT id FROM insert_transaction), $1, $2::numeric, $3::numeric, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id"
		);
    }

    #[test]
    fn it_creates_a_select_transaction_items_by_transaction_id_sql() {
        let transaction_item_table = TransactionItemTable::new();
        let sql = transaction_item_table.select_transaction_items_by_transaction_id_sql();
        assert_eq!(
            sql,
            "SELECT id::text, transaction_id::text, item_id, price::text, quantity::text, debitor_first, rule_instance_id::text, rule_exec_ids, unit_of_measurement, units_measured::text, debitor, creditor, debitor_profile_id::text, creditor_profile_id::text, debitor_approval_time, creditor_approval_time, debitor_rejection_time, creditor_rejection_time, debitor_expiration_time, creditor_expiration_time FROM transaction_item WHERE transaction_id = $1"
        );
    }

    #[test]
    fn it_creates_a_select_transaction_items_by_transaction_ids_sql() {
        let transaction_item_table = TransactionItemTable::new();
        let sql = transaction_item_table.select_transaction_items_by_transaction_ids_sql(2);
        assert_eq!(
            sql,
            "SELECT id::text, transaction_id::text, item_id, price::text, quantity::text, debitor_first, rule_instance_id::text, rule_exec_ids, unit_of_measurement, units_measured::text, debitor, creditor, debitor_profile_id::text, creditor_profile_id::text, debitor_approval_time, creditor_approval_time, debitor_rejection_time, creditor_rejection_time, debitor_expiration_time, creditor_expiration_time FROM transaction_item WHERE transaction_id IN ($1, $2)"
        );
    }
}
