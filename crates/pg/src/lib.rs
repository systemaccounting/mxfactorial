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
        Arc::new(DatabaseConnection(conn))
    }
}

pub struct DatabaseConnection(PooledConnection<'static, PostgresConnectionManager<NoTls>>);

#[async_trait]
impl AccountTrait for DatabaseConnection {
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
                let account_profiles = DatabaseConnection::from_account_profile_rows(rows);
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
impl RuleInstanceTrait for DatabaseConnection {
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
        DatabaseConnection::from_rule_instance_rows(rows)
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
        DatabaseConnection::from_rule_instance_rows(rows)
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
        DatabaseConnection::from_rule_instance_rows(rows)
    }
}

impl DatabaseConnection {
    pub fn from_account_profile_row(row: Row) -> AccountProfile {
        AccountProfile {
            id: row.get("id"),
            account_name: row.get("account_name"),
            description: row.get("description"),
            first_name: row.get("first_name"),
            middle_name: row.get("middle_name"),
            last_name: row.get("last_name"),
            country_name: row.get("country_name"),
            street_number: row.get("street_number"),
            street_name: row.get("street_name"),
            floor_number: row.get("floor_number"),
            unit_number: row.get("unit_number"),
            city_name: row.get("city_name"),
            county_name: row.get("county_name"),
            region_name: row.get("region_name"),
            state_name: row.get("state_name"),
            postal_code: row.get("postal_code"),
            latlng: row.get("latlng"),
            email_address: row.get("email_address"),
            telephone_country_code: row.get("telephone_country_code"),
            telephone_area_code: row.get("telephone_area_code"),
            telephone_number: row.get("telephone_number"),
            occupation_id: row.get("occupation_id"),
            industry_id: row.get("industry_id"),
        }
    }

    pub fn from_account_profile_rows(rows: Vec<Row>) -> AccountProfiles {
        rows.into_iter()
            .map(Self::from_account_profile_row)
            .collect()
    }

    pub fn from_rule_instance_row(row: Row) -> RuleInstance {
        RuleInstance {
            id: row.get("id"),
            rule_type: row.get("rule_type"),
            rule_name: row.get("rule_name"),
            rule_instance_name: row.get("rule_instance_name"),
            variable_values: row.get("variable_values"),
            account_role: row.get("account_role"),
            item_id: row.get("item_id"),
            price: row.get("price"),
            quantity: row.get("quantity"),
            unit_of_measurement: row.get("unit_of_measurement"),
            units_measured: row.get("units_measured"),
            account_name: row.get("account_name"),
            first_name: row.get("first_name"),
            middle_name: row.get("middle_name"),
            last_name: row.get("last_name"),
            country_name: row.get("country_name"),
            street_id: row.get("street_id"),
            street_name: row.get("street_name"),
            floor_number: row.get("floor_number"),
            unit_id: row.get("unit_id"),
            city_name: row.get("city_name"),
            county_name: row.get("county_name"),
            region_name: row.get("region_name"),
            state_name: row.get("state_name"),
            postal_code: row.get("postal_code"),
            latlng: row.get("latlng"),
            email_address: row.get("email_address"),
            telephone_country_code: row.get("telephone_country_code"),
            telephone_area_code: row.get("telephone_area_code"),
            telephone_number: row.get("telephone_number"),
            occupation_id: row.get("occupation_id"),
            industry_id: row.get("industry_id"),
            disabled_time: row.get("disabled_time"),
            removed_time: row.get("removed_time"),
            created_at: row.get("created_at"),
        }
    }

    pub fn from_rule_instance_rows(rows: Vec<Row>) -> RuleInstances {
        rows.into_iter().map(Self::from_rule_instance_row).collect()
    }
}
