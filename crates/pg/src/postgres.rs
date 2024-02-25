use bb8::{Pool, PooledConnection};
use bb8_postgres::PostgresConnectionManager;
use rust_decimal::Decimal;
use std::env;
use tokio_postgres::{types::ToSql, NoTls, Row};
use types::{account_role::AccountRole, time::TZTime};

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

    pub fn get_env_var(var_name: &str) -> String {
        env::var(var_name).unwrap_or_else(|_| panic!("{var_name} not set"))
    }
}

// https://github.com/tokio-rs/axum/blob/5793e75aacfeae16f02fea144ecc2ee7dcb12f55/examples/tokio-postgres/src/main.rs
#[derive(Clone)]
pub struct ConnectionPool(pub Pool<PostgresConnectionManager<NoTls>>);

pub struct DatabaseConnection(pub PooledConnection<'static, PostgresConnectionManager<NoTls>>);

pub trait RowTrait {
    fn get_opt_string(&self, idx: &str) -> Option<String>;
    fn get_string(&self, idx: &str) -> String;
    fn get_vec_string(&self, idx: &str) -> Vec<String>;
    fn get_account_role(&self, idx: &str) -> AccountRole;
    fn get_opt_tztime(&self, idx: &str) -> Option<TZTime>;
    fn get_decimal(&self, idx: &str) -> Decimal;
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
    fn get_decimal(&self, idx: &str) -> Decimal {
        self.get(idx)
    }
}

// isolate tokio-postgres query dependency in this impl
impl DatabaseConnection {
    // old
    pub async fn q(
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

    pub async fn query(
        &self,
        sql_stmt: String,
        values: Vec<Box<(dyn ToSql + Sync)>>,
    ) -> Result<Vec<Row>, tokio_postgres::Error> {
        let unboxed_values: Vec<&(dyn ToSql + Sync)> = values.iter().map(|p| &**p).collect();
        self.0.query(sql_stmt.as_str(), &unboxed_values).await
    }

    pub async fn execute(
        &self,
        sql_stmt: String,
        values: Vec<Box<(dyn ToSql + Sync)>>,
    ) -> Result<u64, tokio_postgres::Error> {
        let unboxed_values: Vec<&(dyn ToSql + Sync)> = values.iter().map(|p| &**p).collect();
        self.0.execute(sql_stmt.as_str(), &unboxed_values).await
    }

    pub async fn tx(
        &mut self,
        sql_stmt: String,
        values: Vec<Box<(dyn ToSql + Sync)>>,
    ) -> Result<Vec<Row>, tokio_postgres::Error> {
        let unboxed_values: Vec<&(dyn ToSql + Sync)> = values.iter().map(|p| &**p).collect();
        let tx = self.0.transaction().await.unwrap();
        let rows = tx.query(sql_stmt.as_str(), &unboxed_values).await.unwrap();
        tx.commit().await.unwrap();
        Ok(rows)
    }
}
