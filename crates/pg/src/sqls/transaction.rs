use crate::sqls::common::*;
use crate::sqls::{approval::ApprovalTable, transaction_item::TransactionItemTable};
use std::error::Error;
use tokio_postgres::types::Type;
use types::transaction::Transaction;

const TRANSACTION_TABLE: &str = "transaction";
const TR_ITEM_ALIAS_PREFIX: &str = "i";
const APPROVAL_ALIAS_PREFIX: &str = "a";
const TR_ALIAS: &str = "insert_transaction";

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
}

impl TransactionTable {
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

    fn aux_stmt_name(prefix: &str, idx: usize) -> String {
        format!("{}_{}", prefix, idx)
    }

    fn aux_stmt(stmt_name: &str, sql: &str) -> String {
        format!("{} AS ({})", stmt_name, sql)
    }
    // todo: convert to postgres function accepting a composite type
    // note: "Whenever you create a table, a composite type is also automatically created, with the same name as the table"
    // https://www.postgresql.org/docs/current/rowtypes.html
    pub fn insert_transaction_cte_sql(
        &self,
        transaction: Transaction,
    ) -> Result<String, Box<dyn Error>> {
        let mut cte = String::new();
        cte.push_str(format!("{} {} {}", WITH, TR_ALIAS, AS).as_str());

        cte.push(' '); // space before auxiliary statement

        let mut positional_parameter = 1;

        let insert_transaction_sql = self.insert_transaction_sql(&mut positional_parameter);
        cte.push_str(format!("({})", insert_transaction_sql).as_str());

        // loop through transaction items with index
        for (i, tr_item) in transaction.transaction_items.into_iter().enumerate() {
            let tr_item_aux_stmt_name = Self::aux_stmt_name(TR_ITEM_ALIAS_PREFIX, i); // i_0, i_1, i_2, ...
            let tr_item_table = TransactionItemTable::new();
            let tr_item_insert_sql = tr_item_table.insert_transaction_item_with_sql(
                TR_ALIAS,
                self.get_column_name("id").as_str(),
                &mut positional_parameter,
            );
            let tr_item_aux_stmt =
                Self::aux_stmt(tr_item_aux_stmt_name.as_str(), tr_item_insert_sql.as_str()); // i_0 AS ($?), i_1 AS ($?), i_2 AS ($?), ...
            cte.push_str(format!(", {}", tr_item_aux_stmt).as_str());

            // error if 0 approvals in transaction item
            if tr_item.approvals.is_none() {
                return Err("approvals in transaction item is None".into());
            } else if tr_item.clone().approvals.unwrap().0.is_empty() {
                return Err("approvals in transaction item is empty".into());
            }

            let appr_table = ApprovalTable::new();

            let appr_insert_sql = appr_table.insert_approval_cte_sql(
                TR_ALIAS,
                self.get_column_name("id").as_str(),
                tr_item_aux_stmt_name.as_str(),
                tr_item_table.get_column_name("id").as_str(),
                tr_item.clone().approvals.unwrap().0.len(),
                &mut positional_parameter,
            );

            let appr_aux_stmt_name = Self::aux_stmt_name(APPROVAL_ALIAS_PREFIX, i); // a_0, a_1, a_2, ...
            let appr_aux_stmt =
                Self::aux_stmt(appr_aux_stmt_name.as_str(), appr_insert_sql.as_str()); // a_0 AS ($?), a_1 AS ($?), a_2 AS ($?), ...

            cte.push_str(format!(", {}", appr_aux_stmt).as_str());
        }

        cte.push(' '); // space before SELECT

        cte.push_str(
            format!(
                "{} {} {} {}",
                SELECT,
                self.get_column("id")
                    .cast_column_as(Type::TEXT)
                    .name_with_casting(),
                FROM,
                TR_ALIAS
            )
            .as_str(),
        );

        Ok(cte)
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
        let values = create_params(id_count);
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
    use types::{approval::Approvals, request_response::IntraTransaction};

    #[test]
    fn it_creates_an_aux_stmt_name() {
        let expected = "i_1";
        assert_eq!(
            TransactionTable::aux_stmt_name(TR_ITEM_ALIAS_PREFIX, 1),
            expected
        );
    }

    #[test]
    fn it_creates_an_aux_stmt() {
        let stmt_name = TransactionTable::aux_stmt_name(APPROVAL_ALIAS_PREFIX, 1);
        let expected = "a_1 AS (test)";
        assert_eq!(
            TransactionTable::aux_stmt(stmt_name.as_str(), "test"),
            expected
        );
    }

    #[test]
    fn it_creates_a_with_sql() {
        let input_file = File::open("../../tests/testdata/requests.json").unwrap();
        let input_reader = BufReader::new(input_file);
        let test_transactions: Vec<IntraTransaction> =
            serde_json::from_reader(input_reader).unwrap();
        let test_transaction = test_transactions[0].transaction.clone();

        let output_file = File::open("./testdata/transaction_insert.golden").unwrap();
        let output_reader = BufReader::new(output_file);
        let expected = output_reader.lines().next().unwrap().unwrap();

        let test_table = TransactionTable::new();

        assert_eq!(
            test_table
                .insert_transaction_cte_sql(test_transaction)
                .unwrap(),
            expected
        )
    }

    // test error when approvals in transaction item is None
    #[test]
    fn it_returns_error_when_approvals_in_transaction_item_is_none() {
        let file = File::open("../../tests/testdata/transWTimes.json").unwrap();
        let reader = BufReader::new(file);
        let test_intra_transaction: IntraTransaction = serde_json::from_reader(reader).unwrap();
        let mut test_transaction = test_intra_transaction.transaction.clone();
        test_transaction.transaction_items.0[0].approvals = None;
        let test_table = TransactionTable::new();
        assert_eq!(
            test_table
                .insert_transaction_cte_sql(test_transaction)
                .unwrap_err()
                .to_string(),
            "approvals in transaction item is None"
        )
    }

    // test error when approvals in transaction item is empty
    #[test]
    fn it_returns_error_when_approvals_in_transaction_item_is_empty() {
        let file = File::open("../../tests/testdata/transWTimes.json").unwrap();
        let reader = BufReader::new(file);
        let test_intra_transaction: IntraTransaction = serde_json::from_reader(reader).unwrap();
        let mut test_transaction = test_intra_transaction.transaction;
        test_transaction.transaction_items.0[0].approvals = Some(Approvals { 0: vec![] });
        let test_table = TransactionTable::new();
        assert_eq!(
            test_table
                .insert_transaction_cte_sql(test_transaction)
                .unwrap_err()
                .to_string(),
            "approvals in transaction item is empty"
        )
    }

    #[test]
    fn it_creates_an_insert_transaction_sql() {
        let expected = "INSERT INTO transaction (rule_instance_id, author, author_device_id, author_device_latlng, author_role, equilibrium_time, sum_value) VALUES ($1, $2, $3, $4::point, $5, $6, $7::numeric) RETURNING *";
        assert_eq!(
            TransactionTable::new().insert_transaction_sql(&mut 1),
            expected
        );
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
