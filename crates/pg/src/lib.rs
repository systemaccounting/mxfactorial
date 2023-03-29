use std::env;

use bb8::{Pool, PooledConnection};
use bb8_postgres::PostgresConnectionManager;
use sqls::{
    select_account_profile_by_account, select_account_profiles_by_db_cr_accounts, select_approvers,
    select_rule_instance_by_type_role_account, select_rule_instance_by_type_role_state,
};
use tokio_postgres::{types::ToSql, NoTls};
use types::{
    account::{AccountProfile, AccountProfiles},
    account_role::AccountRole,
    rule::RuleInstances,
};
use std::error::Error;

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

impl DatabaseConnection {
    pub async fn get_account_profile(&self, account: String) -> Result<AccountProfile, Box<dyn Error>> {
        let row = self
            .0
            .query_one(select_account_profile_by_account().as_str(), &[&account])
            .await;
        match row {
            Err(row) => Err(Box::new(row)),
            Ok(row) => {
                let account_profile = AccountProfile::from_row(row);
                Ok(account_profile)
            }
        }
    }

    pub async fn get_account_profiles(&self, accounts: Vec<String>) -> Result<AccountProfiles, Box<dyn Error>> {
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
            },
        }
    }

    pub async fn get_db_cr_account_profiles(
        &self,
        debitor: String,
        creditor: String,
    ) -> AccountProfiles {
        let rows = self
            .0
            .query(
                select_account_profiles_by_db_cr_accounts().as_str(),
                &[&debitor, &creditor],
            )
            .await
            .unwrap(); // todo: handle error
        types::account::AccountProfiles::from_rows(rows)
    }

    pub async fn get_approvers_for_account(&self, account: String) -> Vec<String> {
        let rows = self
            .0
            .query(select_approvers().as_str(), &[&account])
            .await
            .unwrap(); // todo: handle error
        let account_approvers: Vec<String> = rows.into_iter().map(|row| row.get(0)).collect();
        account_approvers
    }

    pub async fn get_approvers_for_accounts(&self, accounts: Vec<String>) -> Vec<String> {
        let mut params: Vec<&(dyn ToSql + Sync)> = Vec::new();

        for a in accounts.iter() {
            params.push(a)
        }

        let rows = self
            .0
            .query(select_approvers().as_str(), &params[..])
            .await
            .unwrap(); // todo: handle error
        let account_approvers: Vec<String> = rows.into_iter().map(|row| row.get(0)).collect();
        account_approvers
    }

    pub async fn get_approval_rule_instances(
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

    pub async fn get_profile_state_rule_instances(
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

    pub async fn get_rule_instances_by_type_role_account(
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
}
