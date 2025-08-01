use bb8::{Pool, PooledConnection};
use bb8_postgres::PostgresConnectionManager;
use std::env;
use tokio_postgres::{types::ToSql, NoTls, Row};

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

impl ConnectionPool {
    pub async fn get_conn(&self) -> DatabaseConnection {
        let conn = self.0.get_owned().await.unwrap(); // todo: handle error
        DatabaseConnection(conn)
    }
}

pub struct DatabaseConnection(pub PooledConnection<'static, PostgresConnectionManager<NoTls>>);

pub type ToSqlVec = Vec<Box<(dyn ToSql + Sync + Send)>>;

#[macro_export]
macro_rules! to_sql_vec {
    ($($val:expr),* $(,)?) => {
        vec![$(Box::new($val) as Box<dyn ToSql + Sync + Send>),*]
    };
}

pub trait ToSqlVecExt {
    fn push_param<T: ToSql + Sync + Send + 'static>(&mut self, value: T);
}

impl ToSqlVecExt for ToSqlVec {
    fn push_param<T: ToSql + Sync + Send + 'static>(&mut self, value: T) {
        self.push(Box::new(value));
    }
}

// tokio_postgres deps here
impl DatabaseConnection {
    pub async fn query(
        &self,
        sql_stmt: String,
        values: ToSqlVec,
    ) -> Result<Vec<Row>, tokio_postgres::Error> {
        let unboxed_values = DatabaseConnection::unbox_values(&values);
        self.0.query(sql_stmt.as_str(), &unboxed_values).await
    }

    pub async fn execute(
        &self,
        sql_stmt: String,
        values: ToSqlVec,
    ) -> Result<u64, tokio_postgres::Error> {
        let unboxed_values = DatabaseConnection::unbox_values(&values);
        self.0.execute(sql_stmt.as_str(), &unboxed_values).await
    }

    fn unbox_values(values: &[Box<(dyn ToSql + Sync + Send)>]) -> Vec<&(dyn ToSql + Sync)> {
        values
            .iter()
            // https://github.com/sfackler/rust-postgres/issues/712#issuecomment-743456104
            .map(|p| p.as_ref() as &(dyn ToSql + Sync))
            .collect()
    }
}
