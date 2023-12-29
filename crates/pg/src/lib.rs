use async_trait::async_trait;
use bb8::{Pool, PooledConnection};
use bb8_postgres::PostgresConnectionManager;
use sqls::{
    select_account_profiles_by_db_cr_accounts, select_approvers,
    select_rule_instance_by_type_role_account, select_rule_instance_by_type_role_state,
};
use std::{env, error::Error, sync::Arc};
use tokio_postgres::{types::ToSql, NoTls, Row};
use types::{
    account::{AccountProfile, AccountProfiles, AccountTrait},
    account_role::AccountRole,
    rule::{RuleInstance, RuleInstanceTrait, RuleInstances},
    time::TZTime,
};

pub struct DB;

impl DB {
    pub fn create_conn_uri_from_env_vars() -> String {
        let pguser = DB::get_env_var("PGUSER");
        let pgpassword = DB::get_env_var("PGPASSWORD");
        let pghost = DB::get_env_var("PGHOST");
        let pgport = DB::get_env_var("PGPORT");
        let pgdatabase = DB::get_env_var("PGDATABASE");
        format!("postgresql://{pguser}:{pgpassword}@{pghost}:{pgport}/{pgdatabase}")
    }

    pub async fn new_pool(uri: &str) -> ConnectionPool {
        let manager = PostgresConnectionManager::new_from_stringlike(uri, NoTls).unwrap();
        let pool = Pool::builder().build(manager).await.unwrap();
        ConnectionPool(pool)
    }

    fn get_env_var(var_name: &str) -> String {
        env::var(var_name).unwrap_or_else(|_| panic!("{var_name} not set"))
    }
}

pub type DynConnPool = Arc<dyn DBConnPoolTrait + Send + Sync + 'static>;

pub type DynDBConn = Arc<dyn DBConnTrait + Send + Sync + 'static>;

#[async_trait]
pub trait DBConnPoolTrait {
    async fn get_conn(&self) -> DynDBConn;
}

#[async_trait]
pub trait DBConnTrait: AccountTrait + RuleInstanceTrait {}
impl<T: AccountTrait + RuleInstanceTrait> DBConnTrait for T {}

// https://github.com/tokio-rs/axum/blob/5793e75aacfeae16f02fea144ecc2ee7dcb12f55/examples/tokio-postgres/src/main.rs
#[derive(Clone)]
pub struct ConnectionPool(Pool<PostgresConnectionManager<NoTls>>);

#[async_trait]
impl DBConnPoolTrait for ConnectionPool {
    async fn get_conn(&self) -> DynDBConn {
        let conn = self.0.get_owned().await.unwrap(); // todo: handle error
        Arc::new(Conn(Arc::new(DatabaseConnection(conn))))
    }
}
pub struct DatabaseConnection(PooledConnection<'static, PostgresConnectionManager<NoTls>>);

// for dependency injection, wrap tokio-postgres as a trait object
// inside a Conn, then impl service traits on Conn
pub struct Conn(Arc<dyn DatabaseConnectionTrait + Send + Sync + 'static>);

// impl account service trait on Conn
#[async_trait]
impl AccountTrait for Conn {
    async fn get_account_profiles(
        &self,
        accounts: Vec<String>,
    ) -> Result<AccountProfiles, Box<dyn Error>> {
        let rows = self
            .0
            .query_account_profiles(select_account_profiles_by_db_cr_accounts(), accounts)
            .await;
        match rows {
            Err(rows) => Err(Box::new(rows)),
            Ok(rows) => {
                let account_profiles = from_account_profile_rows(rows);
                Ok(account_profiles)
            }
        }
    }

    async fn get_approvers_for_account(&self, account: String) -> Vec<String> {
        let rows = self
            .0
            .query_approvers(select_approvers(), account)
            .await
            .unwrap(); // todo: handle error
        let account_approvers: Vec<String> = rows
            .into_iter()
            .map(|row| row.get_string("approver"))
            .collect();
        account_approvers
    }
}

// impl rule instance service trait on Conn
#[async_trait]
impl RuleInstanceTrait for Conn {
    async fn get_profile_state_rule_instances(
        &self,
        account_role: AccountRole,
        state_name: String,
    ) -> RuleInstances {
        let rows = self
            .0
            .query_profile_state_rule_instances(
                select_rule_instance_by_type_role_state(),
                account_role,
                state_name,
            )
            .await
            .unwrap(); // todo: handle error
        from_rule_instance_rows(rows)
    }

    async fn get_rule_instances_by_type_role_account(
        &self,
        account_role: AccountRole,
        account: String,
    ) -> RuleInstances {
        let rows = self
            .0
            .query_rule_instances_by_type_role_account(
                select_rule_instance_by_type_role_account(),
                account_role,
                account,
            )
            .await
            .unwrap(); // todo: handle error
        from_rule_instance_rows(rows)
    }

    async fn get_approval_rule_instances(
        &self,
        account_role: AccountRole,
        account: String,
    ) -> RuleInstances {
        let rows = self
            .0
            .query_approval_rule_instances(
                select_rule_instance_by_type_role_account(),
                account_role,
                account,
            )
            .await
            .unwrap(); // todo: handle error
        from_rule_instance_rows(rows)
    }
}

trait RowTrait {
    fn get_opt_string(&self, idx: &str) -> Option<String>;
    fn get_string(&self, idx: &str) -> String;
    fn get_vec_string(&self, idx: &str) -> Vec<String>;
    fn get_account_role(&self, idx: &str) -> AccountRole;
    fn get_opt_tztime(&self, idx: &str) -> Option<TZTime>;
}

impl RowTrait for Row {
    fn get_opt_string(&self, idx: &str) -> Option<String> {
        self.get(idx)
    }
    fn get_string(&self, idx: &str) -> String {
        self.get(idx)
    }
    fn get_vec_string(&self, idx: &str) -> Vec<String> {
        self.get(idx)
    }
    fn get_account_role(&self, idx: &str) -> AccountRole {
        self.get(idx)
    }
    fn get_opt_tztime(&self, idx: &str) -> Option<TZTime> {
        self.get(idx)
    }
}

fn from_account_profile_row(row: Box<dyn RowTrait>) -> AccountProfile {
    AccountProfile {
        // cadet todo: add a schema module declaring statics for
        // column names and arrays of column names for each table
        id: row.get_opt_string("id"),
        account_name: row.get_string("account_name"),
        description: row.get_opt_string("description"),
        first_name: row.get_opt_string("first_name"),
        middle_name: row.get_opt_string("middle_name"),
        last_name: row.get_opt_string("last_name"),
        country_name: row.get_string("country_name"),
        street_number: row.get_opt_string("street_number"),
        street_name: row.get_opt_string("street_name"),
        floor_number: row.get_opt_string("floor_number"),
        unit_number: row.get_opt_string("unit_number"),
        city_name: row.get_string("city_name"),
        county_name: row.get_opt_string("county_name"),
        region_name: row.get_opt_string("region_name"),
        state_name: row.get_string("state_name"),
        postal_code: row.get_string("postal_code"),
        latlng: row.get_opt_string("latlng"),
        email_address: row.get_string("email_address"),
        telephone_country_code: row.get_opt_string("telephone_country_code"),
        telephone_area_code: row.get_opt_string("telephone_area_code"),
        telephone_number: row.get_opt_string("telephone_number"),
        occupation_id: row.get_opt_string("occupation_id"),
        industry_id: row.get_opt_string("industry_id"),
    }
}

fn from_account_profile_rows(rows: Vec<Box<dyn RowTrait>>) -> AccountProfiles {
    rows.into_iter().map(from_account_profile_row).collect()
}

fn from_rule_instance_row(row: Box<dyn RowTrait>) -> RuleInstance {
    RuleInstance {
        id: row.get_opt_string("id"),
        rule_type: row.get_string("rule_type"),
        rule_name: row.get_string("rule_name"),
        rule_instance_name: row.get_string("rule_instance_name"),
        variable_values: row.get_vec_string("variable_values"),
        account_role: row.get_account_role("account_role"),
        item_id: row.get_opt_string("item_id"),
        price: row.get_opt_string("price"),
        quantity: row.get_opt_string("quantity"),
        unit_of_measurement: row.get_opt_string("unit_of_measurement"),
        units_measured: row.get_opt_string("units_measured"),
        account_name: row.get_opt_string("account_name"),
        first_name: row.get_opt_string("first_name"),
        middle_name: row.get_opt_string("middle_name"),
        last_name: row.get_opt_string("last_name"),
        country_name: row.get_opt_string("country_name"),
        street_id: row.get_opt_string("street_id"),
        street_name: row.get_opt_string("street_name"),
        floor_number: row.get_opt_string("floor_number"),
        unit_id: row.get_opt_string("unit_id"),
        city_name: row.get_opt_string("city_name"),
        county_name: row.get_opt_string("county_name"),
        region_name: row.get_opt_string("region_name"),
        state_name: row.get_opt_string("state_name"),
        postal_code: row.get_opt_string("postal_code"),
        latlng: row.get_opt_string("latlng"),
        email_address: row.get_opt_string("email_address"),
        telephone_country_code: row.get_opt_string("telephone_country_code"),
        telephone_area_code: row.get_opt_string("telephone_area_code"),
        telephone_number: row.get_opt_string("telephone_number"),
        occupation_id: row.get_opt_string("occupation_id"),
        industry_id: row.get_opt_string("industry_id"),
        disabled_time: row.get_opt_tztime("disabled_time"),
        removed_time: row.get_opt_tztime("removed_time"),
        created_at: row.get_opt_tztime("created_at"),
    }
}

fn from_rule_instance_rows(rows: Vec<Box<dyn RowTrait>>) -> RuleInstances {
    rows.into_iter().map(from_rule_instance_row).collect()
}

// dependency injection trait for tokio-postgres
#[async_trait]
trait DatabaseConnectionTrait {
    async fn query_account_profiles(
        &self,
        sql_stmt: String,
        accounts: Vec<String>,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error>;

    async fn query_approvers(
        &self,
        sql_stmt: String,
        account: String,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error>;

    async fn query_profile_state_rule_instances(
        &self,
        sql_stmt: String,
        account_role: AccountRole,
        state_name: String,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error>;

    async fn query_rule_instances_by_type_role_account(
        &self,
        sql_stmt: String,
        account_role: AccountRole,
        account: String,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error>;

    async fn query_approval_rule_instances(
        &self,
        sql_stmt: String,
        account_role: AccountRole,
        account: String,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error>;
}

// impl dependency injection trait using tokio-postgres
#[async_trait]
impl DatabaseConnectionTrait for DatabaseConnection {
    async fn query_account_profiles(
        &self,
        sql_stmt: String,
        accounts: Vec<String>,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
        // https://github.com/sfackler/rust-postgres/issues/133#issuecomment-659751392
        let mut params: Vec<&(dyn ToSql + Sync)> = Vec::new();

        for a in accounts.iter() {
            params.push(a)
        }

        self.query(sql_stmt, &params[..]).await
    }

    async fn query_approvers(
        &self,
        sql_stmt: String,
        account: String,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
        self.query(sql_stmt, &[&account]).await
    }

    async fn query_profile_state_rule_instances(
        &self,
        sql_stmt: String,
        account_role: AccountRole,
        state_name: String,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
        self.query(sql_stmt, &[&"transaction_item", &account_role, &state_name])
            .await
    }

    async fn query_rule_instances_by_type_role_account(
        &self,
        sql_stmt: String,
        account_role: AccountRole,
        account: String,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
        self.query(sql_stmt, &[&"transaction_item", &account_role, &account])
            .await
    }
    async fn query_approval_rule_instances(
        &self,
        sql_stmt: String,
        account_role: AccountRole,
        account: String,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
        self.query(sql_stmt, &[&"approval", &account_role, &account])
            .await
    }
}

// isolate tokio-postgres query dependency in this impl
impl DatabaseConnection {
    async fn query(
        &self,
        sql_stmt: String,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
        self.0.query(sql_stmt.as_str(), params).await.map(|rows| {
            rows.into_iter()
                .map(|row| Box::new(row) as Box<dyn RowTrait>)
                .collect()
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serial_test::serial; // concurrency avoided while using static mut TEST_ARGS for shared test state
    use std::{env, vec};

    fn account_profile_columns() -> Vec<String> {
        vec![
            String::from("id"),
            String::from("account_name"),
            String::from("description"),
            String::from("first_name"),
            String::from("middle_name"),
            String::from("last_name"),
            String::from("country_name"),
            String::from("street_number"),
            String::from("street_name"),
            String::from("floor_number"),
            String::from("unit_number"),
            String::from("city_name"),
            String::from("county_name"),
            String::from("region_name"),
            String::from("state_name"),
            String::from("postal_code"),
            String::from("latlng"),
            String::from("email_address"),
            String::from("telephone_country_code"),
            String::from("telephone_area_code"),
            String::from("telephone_number"),
            String::from("occupation_id"),
            String::from("industry_id"),
        ]
    }

    fn rule_instance_columns() -> Vec<String> {
        vec![
            String::from("id"),
            String::from("rule_type"),
            String::from("rule_name"),
            String::from("rule_instance_name"),
            String::from("variable_values"),
            String::from("account_role"),
            String::from("item_id"),
            String::from("price"),
            String::from("quantity"),
            String::from("unit_of_measurement"),
            String::from("units_measured"),
            String::from("account_name"),
            String::from("first_name"),
            String::from("middle_name"),
            String::from("last_name"),
            String::from("country_name"),
            String::from("street_id"),
            String::from("street_name"),
            String::from("floor_number"),
            String::from("unit_id"),
            String::from("city_name"),
            String::from("county_name"),
            String::from("region_name"),
            String::from("state_name"),
            String::from("postal_code"),
            String::from("latlng"),
            String::from("email_address"),
            String::from("telephone_country_code"),
            String::from("telephone_area_code"),
            String::from("telephone_number"),
            String::from("occupation_id"),
            String::from("industry_id"),
            String::from("disabled_time"),
            String::from("removed_time"),
            String::from("created_at"),
        ]
    }

    #[test]
    fn it_returns_a_conn_uri() {
        env::set_var("PGUSER", "a");
        env::set_var("PGPASSWORD", "b");
        env::set_var("PGHOST", "c");
        env::set_var("PGPORT", "d");
        env::set_var("PGDATABASE", "e");
        let got = DB::create_conn_uri_from_env_vars();
        env::remove_var("PGUSER");
        env::remove_var("PGPASSWORD");
        env::remove_var("PGHOST");
        env::remove_var("PGPORT");
        env::remove_var("PGDATABASE");
        let want = String::from("postgresql://a:b@c:d/e");
        assert_eq!(got, want)
    }

    #[test]
    #[should_panic]
    fn it_panics_from_unset_env_var() {
        DB::get_env_var("NOT_SET");
    }

    static mut TEST_ARGS: Vec<String> = vec![];

    #[derive(Clone, Copy)]
    struct TestRow;

    impl TestRow {
        fn add(&self, arg: &str) {
            // test code only
            unsafe { TEST_ARGS.push(String::from(arg)) }
        }

        fn clear(&self) {
            // test code only
            unsafe { TEST_ARGS.clear() }
        }
    }

    impl RowTrait for TestRow {
        fn get_opt_string(&self, idx: &str) -> Option<String> {
            self.add(idx);
            None
        }
        fn get_string(&self, idx: &str) -> String {
            self.add(idx);
            String::from("")
        }
        fn get_vec_string(&self, idx: &str) -> Vec<String> {
            self.add(idx);
            vec![]
        }
        fn get_account_role(&self, idx: &str) -> AccountRole {
            self.add(idx);
            AccountRole::Creditor
        }
        fn get_opt_tztime(&self, idx: &str) -> Option<TZTime> {
            self.add(idx);
            None
        }
    }

    // struct TestDB;

    // impl DatabaseConnectionTrait for TestDB {}

    #[test]
    #[serial]
    fn from_account_profile_row_called_with_args() {
        let test_row = TestRow;

        from_account_profile_row(Box::new(test_row));

        let mut unsorted_got = unsafe { TEST_ARGS.clone() };

        unsorted_got.sort();

        let got = unsorted_got.clone();

        let mut unsorted_want = account_profile_columns();

        unsorted_want.sort();

        let want = unsorted_want.clone();

        assert_eq!(got, want);

        test_row.clone().clear()
    }

    #[test]
    #[serial]
    fn from_account_profile_rows_called_with_args() {
        let test_row_1 = TestRow;
        let test_row_2 = TestRow;

        let test_rows: Vec<Box<dyn RowTrait>> = vec![Box::new(test_row_1), Box::new(test_row_2)];

        from_account_profile_rows(test_rows);

        let mut unsorted_got = unsafe { TEST_ARGS.clone() };

        unsorted_got.sort();

        let got = unsorted_got.clone();

        // add first set of account_profile_columns
        let mut unsorted_want = account_profile_columns();

        // add second set of account_profile_columns
        unsorted_want.append(&mut account_profile_columns());

        unsorted_want.sort();

        let want = unsorted_want.clone();

        assert_eq!(got, want);

        test_row_1.clone().clear();
    }

    #[test]
    #[serial]
    fn from_rule_instance_row_called_with_args() {
        let test_row = TestRow;

        from_rule_instance_row(Box::new(test_row));

        let mut unsorted_got = unsafe { TEST_ARGS.clone() };

        unsorted_got.sort();

        let got = unsorted_got.clone();

        let mut unsorted_want = rule_instance_columns();

        unsorted_want.sort();

        let want = unsorted_want.clone();

        assert_eq!(got, want);

        test_row.clone().clear()
    }

    #[test]
    #[serial]
    fn from_rule_instance_rows_called_with_args() {
        let test_row_1 = TestRow;
        let test_row_2 = TestRow;

        let test_rows: Vec<Box<dyn RowTrait>> = vec![Box::new(test_row_1), Box::new(test_row_2)];

        from_rule_instance_rows(test_rows);

        let mut unsorted_got = unsafe { TEST_ARGS.clone() };

        unsorted_got.sort();

        let got = unsorted_got.clone();

        // add first set of rule_instance_columns
        let mut unsorted_want = rule_instance_columns();

        // add second set of rule_instance_columns
        unsorted_want.append(&mut rule_instance_columns());

        unsorted_want.sort();

        let want = unsorted_want.clone();

        assert_eq!(got, want);

        test_row_1.clone().clear();
    }

    struct TestDB;

    #[async_trait]
    impl DatabaseConnectionTrait for TestDB {
        async fn query_account_profiles(
            &self,
            sql_stmt: String,
            accounts: Vec<String>,
        ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
            assert_eq!(sql_stmt, select_account_profiles_by_db_cr_accounts());
            assert_eq!(accounts, vec!["a".to_string(), "b".to_string()]);
            Ok(vec![])
        }

        async fn query_approvers(
            &self,
            sql_stmt: String,
            account: String,
        ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
            assert_eq!(sql_stmt, select_approvers());
            assert_eq!(account, "a".to_string());
            Ok(vec![])
        }

        async fn query_profile_state_rule_instances(
            &self,
            sql_stmt: String,
            account_role: AccountRole,
            state_name: String,
        ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
            assert_eq!(sql_stmt, select_rule_instance_by_type_role_state());
            assert_eq!(account_role, AccountRole::Creditor);
            assert_eq!(state_name, "a".to_string());
            Ok(vec![])
        }

        async fn query_rule_instances_by_type_role_account(
            &self,
            sql_stmt: String,
            account_role: AccountRole,
            account: String,
        ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
            assert_eq!(sql_stmt, select_rule_instance_by_type_role_account());
            assert_eq!(account_role, AccountRole::Creditor);
            assert_eq!(account, "a".to_string());
            Ok(vec![])
        }

        async fn query_approval_rule_instances(
            &self,
            sql_stmt: String,
            account_role: AccountRole,
            account: String,
        ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
            assert_eq!(sql_stmt, select_rule_instance_by_type_role_account());
            assert_eq!(account_role, AccountRole::Creditor);
            assert_eq!(account, "a".to_string());
            Ok(vec![])
        }
    }

    #[test]
    fn get_account_profiles_called_with_args() {
        let test_conn = Conn(Arc::new(TestDB));
        let accounts = vec!["a".to_string(), "b".to_string()];
        let _ = test_conn.get_account_profiles(accounts);
    }

    #[test]
    fn get_approvers_for_account_called_with_args() {
        let test_conn = Conn(Arc::new(TestDB));
        let account = "a".to_string();
        let _ = test_conn.get_approvers_for_account(account);
    }

    #[test]
    fn get_profile_state_rule_instances_called_with_args() {
        let test_conn = Conn(Arc::new(TestDB));
        let account_role = AccountRole::Creditor;
        let state_name = "a".to_string();
        let _ = test_conn.get_profile_state_rule_instances(account_role, state_name);
    }

    #[test]
    fn get_rule_instances_by_type_role_account_called_with_args() {
        let test_conn = Conn(Arc::new(TestDB));
        let account_role = AccountRole::Creditor;
        let account = "a".to_string();
        let _ = test_conn.get_rule_instances_by_type_role_account(account_role, account);
    }

    #[test]
    fn get_approval_rule_instances_called_with_args() {
        let test_conn = Conn(Arc::new(TestDB));
        let account_role = AccountRole::Creditor;
        let account = "a".to_string();
        let _ = test_conn.get_approval_rule_instances(account_role, account);
    }
}
