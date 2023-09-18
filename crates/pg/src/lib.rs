use async_trait::async_trait;
use bb8::{Pool, PooledConnection};
use bb8_postgres::PostgresConnectionManager;
use sqls::{
    select_account_profiles_by_db_cr_accounts, select_approvers,
    select_rule_instance_by_type_role_account, select_rule_instance_by_type_role_state,
};
use std::{env, error::Error};
use tokio_postgres::{types::ToSql, NoTls};
use types::{
    account::{AccountProfiles, AccountStore},
    account_role::AccountRole,
    rule::{RuleInstanceStore, RuleInstances},
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

#[cfg(test)]
mod tests {
    use super::*;

    use std::env;

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
}

// https://github.com/tokio-rs/axum/blob/5793e75aacfeae16f02fea144ecc2ee7dcb12f55/examples/tokio-postgres/src/main.rs
#[derive(Clone)]
pub struct ConnectionPool(Pool<PostgresConnectionManager<NoTls>>);

impl ConnectionPool {
    pub async fn get_conn(&self) -> DatabaseConnection {
        let conn = self.0.get_owned().await.unwrap(); // todo: handle error
        DatabaseConnection(conn)
    }
}

pub struct DatabaseConnection(PooledConnection<'static, PostgresConnectionManager<NoTls>>);

#[async_trait]
impl AccountStore for &DatabaseConnection {
    async fn get_account_profiles(
        &self,
        accounts: Vec<String>,
    ) -> Result<AccountProfiles, Box<dyn Error>> {
        // https://github.com/sfackler/rust-postgres/issues/133#issuecomment-659751392
        let mut params: Vec<&(dyn ToSql + Sync)> = Vec::new();

        for a in accounts.iter() {
            params.push(a)
        }

        let rows = self
            .0
            .query(
                select_account_profiles_by_db_cr_accounts().as_str(),
                &params[..],
            )
            .await;
        match rows {
            Err(rows) => Err(Box::new(rows)),
            Ok(rows) => {
                let account_profiles = types::account::AccountProfiles::from_rows(rows);
                Ok(account_profiles)
            }
        }
    }

    async fn get_approvers_for_account(&self, account: String) -> Vec<String> {
        let rows = self
            .0
            .query(select_approvers().as_str(), &[&account])
            .await
            .unwrap(); // todo: handle error
        let account_approvers: Vec<String> = rows.into_iter().map(|row| row.get(0)).collect();
        account_approvers
    }
}

#[async_trait]
impl RuleInstanceStore for &DatabaseConnection {
    async fn get_profile_state_rule_instances(
        &self,
        account_role: AccountRole,
        state_name: String,
    ) -> RuleInstances {
        let rows = self
            .0
            .query(
                select_rule_instance_by_type_role_state().as_str(),
                &[&"transaction_item", &account_role, &state_name],
            )
            .await
            .unwrap(); // todo: handle error
        RuleInstances::from_rows(rows)
    }

    async fn get_rule_instances_by_type_role_account(
        &self,
        account_role: AccountRole,
        account: String,
    ) -> RuleInstances {
        let rows = self
            .0
            .query(
                select_rule_instance_by_type_role_account().as_str(),
                &[&"transaction_item", &account_role, &account],
            )
            .await
            .unwrap(); // todo: handle error
        RuleInstances::from_rows(rows)
    }

    async fn get_approval_rule_instances(
        &self,
        account_role: AccountRole,
        account: String,
    ) -> RuleInstances {
        let rows = self
            .0
            .query(
                select_rule_instance_by_type_role_account().as_str(),
                &[&"approval", &account_role, &account],
            )
            .await
            .unwrap(); // todo: handle error
        RuleInstances::from_rows(rows)
    }
}
