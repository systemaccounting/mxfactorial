use crate::sqls::common::*;
use crate::sqls::{approval::ApprovalTable, transaction_item::TransactionItemTable};
use tokio_postgres::types::Type;
use types::transaction::Transaction;

const TRANSACTION_TABLE: &str = "transaction";
const INSERT_TRANSACTION_FN: &str = "insert_transaction";
const APPROVAL_ROW_TYPE: &str = "approval";
const ENTIRE_TRANSACTION_ITEM_TYPE: &str = "entire_transaction_item";
const ENTIRE_TRANSACTION_TYPE: &str = "entire_transaction";

#[derive(Debug)]
pub struct TransactionTable {
    inner: Table,
}

impl TableTrait for TransactionTable {
    fn new() -> TransactionTable {
        Self {
            inner: Table::new::<Transaction>(TRANSACTION_TABLE),
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
        self.inner.columns.len()
    }
}

impl TransactionTable {
    // hack: tables are created from struct and may not match schema, e.g. created_at
    fn add_column(&mut self, column_mame: &str) {
        let column = Column::new(column_mame);
        self.inner.columns.insert(column.name.clone(), column);
    }

    fn insert_columns_with_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("rule_instance_id"),
            self.get_column("author"),
            self.get_column("author_device_id"),
            self.get_column("author_device_latlng")
                .cast_value_as(Type::POINT),
            self.get_column("author_role"),
            self.get_column("equilibrium_time"),
            self.get_column("sum_value").cast_value_as(Type::NUMERIC),
        ])
    }

    // fn_ postgres function
    fn fn_insert_columns_with_casting(&mut self) -> Columns {
        self.add_column("created_at");
        Columns(vec![
            self.get_column("id"),
            self.get_column("rule_instance_id"),
            self.get_column("author"),
            self.get_column("author_device_id"),
            self.get_column("author_device_latlng")
                .cast_value_as(Type::POINT),
            self.get_column("author_role"),
            self.get_column("equilibrium_time"),
            self.get_column("sum_value").cast_value_as(Type::NUMERIC),
            self.get_column("created_at"),
        ])
    }

    fn select_all_with_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("id").cast_column_as(Type::TEXT),
            self.get_column("rule_instance_id")
                .cast_column_as(Type::TEXT),
            self.get_column("author"),
            self.get_column("author_device_id"),
            self.get_column("author_device_latlng")
                .cast_column_as(Type::TEXT),
            self.get_column("author_role"),
            self.get_column("equilibrium_time"),
            self.get_column("sum_value").cast_column_as(Type::TEXT),
        ])
    }

    pub fn insert_transaction_sql(&self, positional_parameter: &mut i32) -> String {
        let columns = self.insert_columns_with_casting();
        let values = create_value_params(columns.clone(), 1, positional_parameter);
        format!(
            "{} {} ({}) {} {} {} {}",
            INSERT_INTO,
            self.name(),
            columns.join_with_casting(),
            VALUES,
            values,
            RETURNING,
            STAR
        )
    }

    fn pg_row_array(
        &self,
        columns: Columns,
        row_count: usize,
        row_type: &str,
        positional_parameter: &mut i32,
    ) -> String {
        let mut array = String::new();
        array.push_str(&format!("{} [", ARRAY));
        for i in 0..row_count {
            array.push_str(&self.pg_row(columns.clone(), None, positional_parameter));
            if i < row_count - 1 {
                array.push_str(", ");
            }
        }
        array.push_str(&format!("]::{}[]", row_type));
        array
    }

    fn pg_row(
        &self,
        columns: Columns,
        row_type: Option<&str>,
        positional_parameter: &mut i32,
    ) -> String {
        let mut row = String::new();
        row.push_str(&format!("{}(", ROW));
        for (j, c) in columns.clone().enumerate() {
            row.push_str(&format!("${}", *positional_parameter));
            if c.cast_value_as.is_some() {
                row.push_str(&format!("::{}", c.cast_value_as.unwrap()));
            }
            *positional_parameter += 1;
            if j < columns.len() - 1 {
                row.push_str(", ");
            }
        }
        row.push(')');
        if let Some(t) = row_type {
            row.push_str(&format!("::{}", t));
        }
        row
    }

    fn transaction_row(&self, positional_parameter: &mut i32) -> String {
        let mut table = TransactionTable::new();
        let columns = table.fn_insert_columns_with_casting();
        self.pg_row(columns, None, positional_parameter)
    }

    fn transaction_item_row(&self, positional_parameter: &mut i32) -> String {
        let table = TransactionItemTable::new();
        let columns = table.fn_insert_columns_with_casting();
        self.pg_row(columns, None, positional_parameter)
    }

    fn approval_array(&self, approval_count: usize, positional_parameter: &mut i32) -> String {
        let table = ApprovalTable::new();
        let columns = table.fn_insert_columns_with_casting();
        self.pg_row_array(
            columns,
            approval_count,
            APPROVAL_ROW_TYPE,
            positional_parameter,
        )
    }

    fn entire_transaction_item_row(
        &self,
        approval_count: usize,
        positional_parameter: &mut i32,
    ) -> String {
        let tr_item_row = self.transaction_item_row(positional_parameter);
        let appr_array = self.approval_array(approval_count, positional_parameter);
        format!("{}({}, {})", ROW, tr_item_row, appr_array)
    }

    fn entire_transaction_item_array(
        &self,
        lengths_of_approvals: Vec<usize>,
        positional_parameter: &mut i32,
    ) -> String {
        let mut entire_transaction_item_array = String::new();
        entire_transaction_item_array.push_str(&format!("{} [", ARRAY));
        for (i, length) in lengths_of_approvals.iter().enumerate() {
            entire_transaction_item_array
                .push_str(&self.entire_transaction_item_row(*length, positional_parameter));
            if i < lengths_of_approvals.len() - 1 {
                entire_transaction_item_array.push_str(", ");
            }
        }
        entire_transaction_item_array.push_str(&format!("]::{}[]", ENTIRE_TRANSACTION_ITEM_TYPE));
        entire_transaction_item_array
    }

    fn entire_transaction_row(
        &self,
        lengths_of_approvals: Vec<usize>, // transaction_item count = lengths_of_approvals.len()
        positional_parameter: &mut i32,
    ) -> String {
        let tr_row = self.transaction_row(positional_parameter);
        let tr_item_array =
            self.entire_transaction_item_array(lengths_of_approvals, positional_parameter);
        format!(
            "{}({}, {})::{}",
            ROW, tr_row, tr_item_array, ENTIRE_TRANSACTION_TYPE
        )
    }

    /* example fn_select_insert_transaction_sql output:
            SELECT insert_transaction(
            ROW(
                ROW(
                    NULL, -- id
                    NULL, -- rule_instance_id
                    'GroceryStore', -- author
                    NULL, -- author_device_id
                    NULL, -- author_device_latlng
                    'creditor', -- author_role
                    NULL, -- equilibrium_time
                    1.000, -- sum_value
                    NULL -- created_at
                ),
                ARRAY [
                    ROW(
                        ROW(
                            NULL, -- id
                            NULL, -- transaction_id
                            'bread', -- item_id
                            1.000, -- price
                            1, -- quantity
                            true, -- debitor_first
                            NULL, -- rule_instance_id
                            NULL, -- rule_exec_ids
                            NULL, -- unit_of_measurement
                            NULL, -- units_measured
                            'JacobWebb', -- debitor
                            'GroceryStore', -- creditor
                            7, -- debitor_profile_id
                            11, -- creditor_profile_id
                            NULL, -- debitor_approval_time
                            NULL, -- creditor_approval_time
                            NULL, -- debitor_expiration_time
                            NULL, -- creditor_expiration_time
                            NULL, -- debitor_rejection_time
                            NULL -- creditor_rejection_time
                        ),
                        ARRAY [
                            ROW(
                                NULL, -- id
                                NULL, -- rule_instance_id
                                NULL, -- transaction_id
                                NULL, -- transaction_item_id
                                'JacobWebb', -- account_name
                                'debitor', -- account_role
                                NULL, -- device_id
                                NULL, -- device_latlng
                                NULL, -- approval_time
                                NULL, -- rejection_time
                                NULL -- expiration_time
                            ),
                            ROW(
                                NULL, -- id
                                NULL, -- rule_instance_id
                                NULL, -- transaction_id
                                NULL, -- transaction_item_id
                                'GroceryStore', -- account_name
                                'creditor', -- account_role
                                NULL, -- device_id
                                NULL, -- device_latlng
                                '2024-04-26 14:42:48.698499+00', -- approval_time
                                NULL, -- rejection_time
                                NULL -- expiration_time
                            )
                        ]::approval[]
                    )
                ]::entire_transaction_item[]
            )::entire_transaction
        );
    */

    // creates a parameterized select statement for calling the insert_transaction postgres function
    pub fn fn_select_insert_transaction_sql(&self, list_of_approval_lengths: Vec<usize>) -> String {
        let mut select_insert_sql = String::new();
        select_insert_sql.push_str(&format!("{} {}", SELECT, INSERT_TRANSACTION_FN));
        select_insert_sql.push('(');
        let mut positional_parameter = 1;
        let sql = self.entire_transaction_row(list_of_approval_lengths, &mut positional_parameter);
        select_insert_sql.push_str(&sql);
        select_insert_sql.push(')');
        select_insert_sql
    }

    pub fn select_transaction_by_id_sql(&self) -> String {
        let columns = self.select_all_with_casting().join_with_casting();
        format!(
            "{} {} {} {} {} {} {} $1",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("id").name(),
            EQUAL,
        )
    }

    pub fn select_transactions_by_ids_sql(&self, id_count: usize) -> String {
        let columns = self.select_all_with_casting().join_with_casting();
        let values = create_params(id_count, &mut 1);
        format!(
            "{} {} {} {} {} {} {} ({})",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("id").name(),
            IN,
            values
        )
    }

    pub fn update_transaction_by_id_sql(&self) -> String {
        format!(
            "{} {} {} {} {} $1 {} {} {} $2 {} {}",
            UPDATE,
            self.name(),
            SET,
            self.get_column("equilibrium_time").name(),
            EQUAL,
            WHERE,
            self.get_column("id").name(),
            EQUAL,
            RETURNING,
            STAR
        )
    }

    pub fn select_last_n_reqs_or_trans_by_account_sql(&self, all_approved: bool) -> String {
        let columns = self.select_all_with_casting().join_with_casting();
        let mut is_transaction = "TRUE";
        if !all_approved {
            is_transaction = "FALSE";
        }
        format!(
            r#"WITH transactions AS (
                SELECT transaction_id, every(approval_time IS NOT NULL) AS all_approved
                FROM approval
                WHERE transaction_id IN (
                    SELECT DISTINCT(transaction_id)
                    FROM approval
                    WHERE account_name = $1
                    ORDER BY transaction_id
                    DESC
                )
                GROUP BY transaction_id
                ORDER BY transaction_id
                DESC
            )
            SELECT {} FROM transaction
            WHERE id IN (
                SELECT transaction_id
                FROM transactions
                WHERE all_approved IS {}
                LIMIT $2
            );"#,
            columns, is_transaction
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{
        fs::File,
        io::{BufRead, BufReader},
    };
    use types::request_response::IntraTransaction;

    #[test]
    fn it_creates_a_transaction_row() {
        let mut test_table = TransactionTable::new();
        let test_columns = test_table.fn_insert_columns_with_casting();
        let test_row = test_table.pg_row(test_columns, None, &mut 1);
        assert_eq!(
            test_row,
            "ROW($1, $2, $3, $4, $5::point, $6, $7, $8::numeric, $9)"
        )
    }

    #[test]
    fn it_creates_an_insert_transaction_sql() {
        let input_file = File::open("../../tests/testdata/requests.json").unwrap();
        let input_reader = BufReader::new(input_file);
        let test_transactions: Vec<IntraTransaction> =
            serde_json::from_reader(input_reader).unwrap();
        let test_transaction = test_transactions[0].transaction.clone();
        let lengths_of_approvals = test_transaction
            .transaction_items
            .list_lengths_of_approvals(); // [4, 4, 4, 3, 3, 3]

        let output_file = File::open("./testdata/transaction_insert.golden").unwrap();
        let output_reader = BufReader::new(output_file);
        let expected = output_reader.lines().next().unwrap().unwrap();

        let table = TransactionTable::new();
        let sql = table.fn_select_insert_transaction_sql(lengths_of_approvals);
        assert_eq!(sql, expected)
    }

    #[test]
    fn it_creates_a_pg_row() {
        let mut test_table = TransactionTable::new();
        let test_columns = test_table.fn_insert_columns_with_casting();
        let test_row = test_table.pg_row(test_columns, None, &mut 1);
        assert_eq!(
            test_row,
            "ROW($1, $2, $3, $4, $5::point, $6, $7, $8::numeric, $9)"
        )
    }

    #[test]
    fn it_creates_a_pg_row_array() {
        let mut test_table = TransactionTable::new();
        let test_columns = test_table.fn_insert_columns_with_casting();
        let test_array = test_table.pg_row_array(test_columns, 2, "test", &mut 1);
        assert_eq!(
            test_array,
            "ARRAY [ROW($1, $2, $3, $4, $5::point, $6, $7, $8::numeric, $9), ROW($10, $11, $12, $13, $14::point, $15, $16, $17::numeric, $18)]::test[]"
        )
    }

    #[test]
    fn it_creates_an_entire_transaction_item_row() {
        let test_table = TransactionTable::new();
        let test_row = test_table.entire_transaction_item_row(2, &mut 1);
        assert_eq!(
            test_row,
            r#"ROW(ROW($1, $2, $3, $4::numeric, $5::numeric, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20), ARRAY [ROW($21, $22, $23, $24, $25, $26, $27, $28::point, $29, $30, $31), ROW($32, $33, $34, $35, $36, $37, $38, $39::point, $40, $41, $42)]::approval[])"#
        )
    }

    #[test]
    fn it_creates_an_entire_transaction_item_array() {
        assert_eq!(
            TransactionTable::new().entire_transaction_item_array(vec![2, 2], &mut 1),
            r#"ARRAY [ROW(ROW($1, $2, $3, $4::numeric, $5::numeric, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20), ARRAY [ROW($21, $22, $23, $24, $25, $26, $27, $28::point, $29, $30, $31), ROW($32, $33, $34, $35, $36, $37, $38, $39::point, $40, $41, $42)]::approval[]), ROW(ROW($43, $44, $45, $46::numeric, $47::numeric, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62), ARRAY [ROW($63, $64, $65, $66, $67, $68, $69, $70::point, $71, $72, $73), ROW($74, $75, $76, $77, $78, $79, $80, $81::point, $82, $83, $84)]::approval[])]::entire_transaction_item[]"#
        )
    }

    #[test]
    fn it_creates_an_entire_transaction_row() {
        assert_eq!(
            TransactionTable::new().entire_transaction_row(vec![2, 2], &mut 1),
            r#"ROW(ROW($1, $2, $3, $4, $5::point, $6, $7, $8::numeric, $9), ARRAY [ROW(ROW($10, $11, $12, $13::numeric, $14::numeric, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29), ARRAY [ROW($30, $31, $32, $33, $34, $35, $36, $37::point, $38, $39, $40), ROW($41, $42, $43, $44, $45, $46, $47, $48::point, $49, $50, $51)]::approval[]), ROW(ROW($52, $53, $54, $55::numeric, $56::numeric, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71), ARRAY [ROW($72, $73, $74, $75, $76, $77, $78, $79::point, $80, $81, $82), ROW($83, $84, $85, $86, $87, $88, $89, $90::point, $91, $92, $93)]::approval[])]::entire_transaction_item[])::entire_transaction"#
        )
    }

    #[test]
    fn it_creates_a_select_transaction_by_id_sql() {
        let expected = "SELECT id::text, rule_instance_id::text, author, author_device_id, author_device_latlng::text, author_role, equilibrium_time, sum_value::text FROM transaction WHERE id = $1";
        assert_eq!(
            TransactionTable::new().select_transaction_by_id_sql(),
            expected
        );
    }

    #[test]
    fn it_creates_a_select_transactions_by_ids_sql() {
        let expected = "SELECT id::text, rule_instance_id::text, author, author_device_id, author_device_latlng::text, author_role, equilibrium_time, sum_value::text FROM transaction WHERE id IN ($1, $2, $3)";
        assert_eq!(
            TransactionTable::new().select_transactions_by_ids_sql(3),
            expected
        );
    }

    #[test]
    fn it_creates_an_update_transaction_by_id_sql() {
        let expected = "UPDATE transaction SET equilibrium_time = $1 WHERE id = $2 RETURNING *";
        assert_eq!(
            TransactionTable::new().update_transaction_by_id_sql(),
            expected
        );
    }

    #[test]
    fn it_creates_a_select_last_n_reqs_or_trans_by_account_sql() {
        let expected = r#"WITH transactions AS (
                SELECT transaction_id, every(approval_time IS NOT NULL) AS all_approved
                FROM approval
                WHERE transaction_id IN (
                    SELECT DISTINCT(transaction_id)
                    FROM approval
                    WHERE account_name = $1
                    ORDER BY transaction_id
                    DESC
                )
                GROUP BY transaction_id
                ORDER BY transaction_id
                DESC
            )
            SELECT id::text, rule_instance_id::text, author, author_device_id, author_device_latlng::text, author_role, equilibrium_time, sum_value::text FROM transaction
            WHERE id IN (
                SELECT transaction_id
                FROM transactions
                WHERE all_approved IS FALSE
                LIMIT $2
            );"#;
        assert_eq!(
            TransactionTable::new().select_last_n_reqs_or_trans_by_account_sql(false),
            expected,
        );
    }
}
