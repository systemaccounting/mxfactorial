#![allow(async_fn_in_trait)]
use crate::postgres::{ConnectionPool, DatabaseConnection, RowTrait, ToSqlVec};
use crate::sqls::common::TableTrait;
use crate::sqls::{
    profile::{select_account_profiles_by_db_cr_accounts, select_approvers},
    rule_instance::{
        select_rule_instance_by_type_role_account, select_rule_instance_by_type_role_state,
    },
};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use geo_types::Point;
use rust_decimal::Decimal;
use std::vec;
use std::{error::Error, sync::Arc};
use tokio_postgres::types::ToSql;
use types::{
    account::{AccountProfile, AccountProfiles, AccountTrait},
    account_role::AccountRole,
    approval::Approvals,
    balance::AccountBalances,
    rule::{RuleInstance, RuleInstanceTrait, RuleInstances},
    time::TZTime,
    transaction::{Transaction, Transactions},
    transaction_item::TransactionItems,
};

const FIXED_DECIMAL_PLACES: usize = 3;

// todo: add future boilerplate
// https://doc.rust-lang.org/beta/rustc/lints/listing/warn-by-default.html#async-fn-in-trait
pub trait ModelTrait {
    async fn insert_account_query(&self, account: String) -> Result<(), Box<dyn Error>>;
    async fn delete_owner_account_query(&self, account: String) -> Result<(), Box<dyn Error>>;
    async fn select_account_balance_query(&self, account: String)
        -> Result<String, Box<dyn Error>>;
    async fn select_account_balances_query(
        &self,
        accounts: Vec<String>,
    ) -> Result<AccountBalances, Box<dyn Error>>;
    async fn update_account_balances_query(
        &self,
        transaction_items: TransactionItems,
    ) -> Result<(), Box<dyn Error>>;
    async fn insert_account_balance_query(
        &self,
        account: String,
        balance: Decimal,
        curr_tr_item_id: i32,
    ) -> Result<(), Box<dyn Error>>;
    async fn select_approvals_by_transaction_id_query(
        &self,
        transaction_id: i32,
    ) -> Result<Approvals, Box<dyn Error>>;
    async fn select_approvals_by_transaction_ids_query(
        &self,
        transaction_ids: Vec<i32>,
    ) -> Result<Approvals, Box<dyn Error>>;
    async fn update_approvals_by_account_and_role_query(
        &self,
        transaction_id: i32,
        account: String,
        role: AccountRole,
    ) -> Result<TZTime, Box<dyn Error>>;
    async fn insert_account_profile_query(
        &self,
        account_profile: AccountProfile,
    ) -> Result<String, Box<dyn Error>>;
    async fn select_profile_ids_by_account_names_query(
        &self,
        accounts: Vec<String>,
    ) -> Result<Vec<(String, String)>, Box<dyn Error>>;
    async fn select_transaction_items_by_transaction_id_query(
        &self,
        transaction_id: i32,
    ) -> Result<TransactionItems, Box<dyn Error>>;
    async fn select_transaction_items_by_transaction_ids_query(
        &self,
        transaction_ids: Vec<i32>,
    ) -> Result<TransactionItems, Box<dyn Error>>;
    async fn select_transaction_by_id_query(
        &self,
        transaction_id: i32,
    ) -> Result<Transaction, Box<dyn Error>>;
    async fn insert_transaction_tx_query(
        &mut self,
        transaction: Transaction,
    ) -> Result<String, Box<dyn Error>>;
    async fn select_last_n_transactions_query(
        &self,
        account: String,
        n: i64,
    ) -> Result<Transactions, Box<dyn Error>>;
    async fn select_last_n_requests_query(
        &self,
        account: String,
        n: i64,
    ) -> Result<Transactions, Box<dyn Error>>;
    async fn select_transactions_by_ids_query(
        &self,
        transaction_ids: Vec<i32>,
    ) -> Result<Transactions, Box<dyn Error>>;
    async fn select_approve_all_credit_rule_instance_exists_query(
        &self,
        account_name: String,
    ) -> Result<bool, Box<dyn Error>>;
    async fn insert_approve_all_credit_rule_instance_query(
        &self,
        account_name: String,
    ) -> Result<(), Box<dyn Error>>;
}

impl ModelTrait for DatabaseConnection {
    async fn insert_account_query(&self, account: String) -> Result<(), Box<dyn Error>> {
        let sql = crate::sqls::account::insert_account_sql();
        let values: ToSqlVec = vec![Box::new(account)];
        let result = self.execute(sql, values).await;
        match result {
            Err(e) => Err(Box::new(e)),
            Ok(_) => Ok(()),
        }
    }

    async fn delete_owner_account_query(&self, account: String) -> Result<(), Box<dyn Error>> {
        let sql = crate::sqls::account::delete_owner_account_sql();
        let values: ToSqlVec = vec![Box::new(account)];
        let result = self.execute(sql, values).await;
        match result {
            Err(e) => Err(Box::new(e)),
            Ok(_) => Ok(()),
        }
    }

    async fn select_account_balance_query(
        &self,
        account: String,
    ) -> Result<String, Box<dyn Error>> {
        let table = crate::sqls::balance::AccountBalanceTable::new();
        let sql = table.select_current_account_balance_by_account_name_sql();
        let values: ToSqlVec = vec![Box::new(account)];
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let balance: Decimal = rows[0].get_decimal("current_balance");
                Ok(format!("{:.FIXED_DECIMAL_PLACES$}", balance))
            }
        }
    }

    async fn select_account_balances_query(
        &self,
        accounts: Vec<String>,
    ) -> Result<AccountBalances, Box<dyn Error>> {
        let table = crate::sqls::balance::AccountBalanceTable::new();
        let sql = table.select_account_balances_sql(accounts.len());
        let mut values: ToSqlVec = Vec::new();
        for a in accounts.into_iter() {
            values.push(Box::new(a))
        }
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let account_balances = AccountBalances::from(rows);
                Ok(account_balances)
            }
        }
    }

    async fn update_account_balances_query(
        &self,
        transaction_items: TransactionItems,
    ) -> Result<(), Box<dyn Error>> {
        // create a vector of values to pass to the query
        let mut values: ToSqlVec = Vec::new();
        for tr_item in transaction_items.clone().into_iter() {
            // add creditor account as first param
            values.push(Box::new(tr_item.clone().creditor));
            // add creditor revenue string as second param
            values.push(Box::new(tr_item.clone().revenue_string()));
            // add transaction item id as third param
            values.push(Box::new(
                tr_item.id.clone().unwrap().parse::<i32>().unwrap(),
            ));

            // add debitor account as fourth param
            values.push(Box::new(tr_item.clone().debitor));
            // add debitor expense string as fifth param
            values.push(Box::new(tr_item.clone().expense_string()));
            // add transaction item id as sixth param
            values.push(Box::new(
                tr_item.clone().id.unwrap().parse::<i32>().unwrap(),
            ));
        }

        let table = crate::sqls::balance::AccountBalanceTable::new();
        let sql = table.update_account_balances_sql(transaction_items.len());
        let result = self.execute(sql.to_string(), values).await;
        match result {
            Err(e) => Err(Box::new(e)),
            Ok(_) => Ok(()),
        }
    }

    async fn insert_account_balance_query(
        &self,
        account: String,
        balance: Decimal,
        curr_tr_item_id: i32,
    ) -> Result<(), Box<dyn Error>> {
        let table = crate::sqls::balance::AccountBalanceTable::new();
        let sql = table.insert_account_balance_sql();
        let values: ToSqlVec = vec![
            Box::new(account),
            Box::new(balance),
            Box::new(curr_tr_item_id),
        ];
        let result = self.execute(sql.to_string(), values).await;
        match result {
            Err(e) => Err(Box::new(e)),
            Ok(_) => Ok(()),
        }
    }

    async fn select_approvals_by_transaction_id_query(
        &self,
        transaction_id: i32,
    ) -> Result<Approvals, Box<dyn Error>> {
        let table = crate::sqls::approval::ApprovalTable::new();
        let sql = table.select_approvals_by_transaction_id_sql();
        let values: ToSqlVec = vec![Box::new(transaction_id)];
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(rows) => Err(Box::new(rows)),
            Ok(rows) => Ok(Approvals::from(rows)),
        }
    }

    async fn select_approvals_by_transaction_ids_query(
        &self,
        transaction_ids: Vec<i32>,
    ) -> Result<Approvals, Box<dyn Error>> {
        let mut values: ToSqlVec = Vec::new();
        for t in transaction_ids.clone().into_iter() {
            values.push(Box::new(t))
        }
        let table = crate::sqls::approval::ApprovalTable::new();
        let sql = table.select_approvals_by_transaction_ids_sql(transaction_ids.len());
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => Ok(Approvals::from(rows)),
        }
    }

    async fn update_approvals_by_account_and_role_query(
        &self,
        transaction_id: i32,
        account: String,
        role: AccountRole,
    ) -> Result<TZTime, Box<dyn Error>> {
        let table = crate::sqls::approval::ApprovalTable::new();
        let sql = table.update_approvals_by_account_and_role_sql();
        let values: ToSqlVec = vec![Box::new(transaction_id), Box::new(account), Box::new(role)];
        let result = self.query(sql.to_string(), values).await;
        match result {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let approval_time = rows[0].get::<usize, TZTime>(0);
                Ok(approval_time)
            }
        }
    }

    async fn insert_account_profile_query(
        &self,
        account_profile: AccountProfile,
    ) -> Result<String, Box<dyn Error>> {
        let table = crate::sqls::profile::AccountProfileTable::new();
        let sql = table.insert_account_profile_sql();
        let values: ToSqlVec = vec![
            Box::new(account_profile.account_name),
            Box::new(account_profile.description),
            Box::new(account_profile.first_name),
            Box::new(account_profile.middle_name),
            Box::new(account_profile.last_name),
            Box::new(account_profile.country_name),
            Box::new(account_profile.street_number),
            Box::new(account_profile.street_name),
            Box::new(account_profile.floor_number),
            Box::new(account_profile.unit_number),
            Box::new(account_profile.city_name),
            Box::new(account_profile.county_name),
            Box::new(account_profile.region_name),
            Box::new(account_profile.state_name),
            Box::new(account_profile.postal_code),
            Box::new(parse_pg_point(account_profile.latlng).unwrap()),
            Box::new(account_profile.email_address),
            Box::new(
                account_profile
                    .telephone_country_code
                    .unwrap()
                    .parse::<i32>()
                    .unwrap(),
            ),
            Box::new(
                account_profile
                    .telephone_area_code
                    .unwrap()
                    .parse::<i32>()
                    .unwrap(),
            ),
            Box::new(
                account_profile
                    .telephone_number
                    .unwrap()
                    .parse::<i32>()
                    .unwrap(),
            ),
            Box::new(
                account_profile
                    .occupation_id
                    .unwrap()
                    .parse::<i32>()
                    .unwrap(),
            ),
            Box::new(account_profile.industry_id.unwrap().parse::<i32>().unwrap()),
        ];
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let row = &rows[0];
                let profile_id = row.get(0);
                Ok(profile_id)
            }
        }
    }

    async fn select_profile_ids_by_account_names_query(
        &self,
        accounts: Vec<String>,
    ) -> Result<Vec<(String, String)>, Box<dyn Error>> {
        let table = crate::sqls::profile::AccountProfileTable::new();
        let sql = table.select_profile_ids_by_account_names_sql(accounts.len());
        let mut values: ToSqlVec = Vec::new();
        for a in accounts.into_iter() {
            values.push(Box::new(a))
        }
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let profile_ids: Vec<(String, String)> = rows
                    .into_iter()
                    .map(|row| (row.get_string("id"), row.get_string("account_name")))
                    .collect();
                Ok(profile_ids)
            }
        }
    }

    async fn select_transaction_items_by_transaction_id_query(
        &self,
        transaction_id: i32,
    ) -> Result<TransactionItems, Box<dyn Error>> {
        let table = crate::sqls::transaction_item::TransactionItemTable::new();
        let sql = table.select_transaction_items_by_transaction_id_sql();
        let values: ToSqlVec = vec![Box::new(transaction_id)];
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => Ok(TransactionItems::from(rows)),
        }
    }

    async fn select_transaction_items_by_transaction_ids_query(
        &self,
        transaction_ids: Vec<i32>,
    ) -> Result<TransactionItems, Box<dyn Error>> {
        let mut values: ToSqlVec = Vec::new();
        for t in transaction_ids.clone().into_iter() {
            values.push(Box::new(t))
        }
        let table = crate::sqls::transaction_item::TransactionItemTable::new();
        let sql = table.select_transaction_items_by_transaction_ids_sql(transaction_ids.len());
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => Ok(TransactionItems::from(rows)),
        }
    }

    async fn select_transaction_by_id_query(
        &self,
        transaction_id: i32,
    ) -> Result<Transaction, Box<dyn Error>> {
        let table = crate::sqls::transaction::TransactionTable::new();
        let sql = table.select_transaction_by_id_sql();
        let values: ToSqlVec = vec![Box::new(transaction_id)];
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let row = &rows[0];
                let transaction = Transaction::from(row);
                Ok(transaction)
            }
        }
    }

    async fn insert_transaction_tx_query(
        &mut self,
        transaction: Transaction,
    ) -> Result<String, Box<dyn Error>> {
        let table = crate::sqls::transaction::TransactionTable::new();
        let sql = table
            .insert_transaction_cte_sql(transaction.clone())
            .unwrap();

        // convert rust transaction values to postgres values
        let transaction_rule_instance_id = parse_pg_int4(None::<String>).unwrap();
        let transaction_author_device_latlng = parse_pg_point(None::<String>).unwrap();
        let transaction_equilibrium_time =
            parse_pg_timestamp(transaction.equilibrium_time).unwrap();
        let transaction_sum_value = parse_pg_numeric(Some(transaction.sum_value)).unwrap();

        let mut values: ToSqlVec = vec![
            Box::new(transaction_rule_instance_id),
            Box::new(transaction.author),
            Box::new(None::<String>), // author_device_id
            Box::new(transaction_author_device_latlng),
            Box::new(transaction.author_role),
            Box::new(transaction_equilibrium_time),
            Box::new(transaction_sum_value),
        ];

        for tr_item in transaction.transaction_items.into_iter() {
            // transaction_id inserted by CTE auxiliary statement
            values.push(Box::new(tr_item.item_id));

            let tr_item_price = parse_pg_numeric(Some(tr_item.price)).unwrap();
            values.push(Box::new(tr_item_price));

            let tr_item_quantity = parse_pg_numeric(Some(tr_item.quantity)).unwrap();
            values.push(Box::new(tr_item_quantity));

            values.push(Box::new(tr_item.debitor_first));

            let tr_item_rule_instance_id = parse_pg_int4(tr_item.rule_instance_id).unwrap();
            values.push(Box::new(tr_item_rule_instance_id));

            values.push(Box::new(tr_item.rule_exec_ids));
            values.push(Box::new(tr_item.unit_of_measurement));

            let tr_item_units_measured = parse_pg_numeric(tr_item.units_measured).unwrap();
            values.push(Box::new(tr_item_units_measured));

            values.push(Box::new(tr_item.debitor));
            values.push(Box::new(tr_item.creditor));

            let debitor_profile_id = parse_pg_int4(tr_item.debitor_profile_id).unwrap();
            values.push(Box::new(debitor_profile_id));

            let creditor_profile_id = parse_pg_int4(tr_item.creditor_profile_id).unwrap();
            values.push(Box::new(creditor_profile_id));

            let tr_item_debitor_approval_time =
                parse_pg_timestamp(tr_item.debitor_approval_time).unwrap();
            values.push(Box::new(tr_item_debitor_approval_time));

            let tr_item_creditor_approval_time =
                parse_pg_timestamp(tr_item.creditor_approval_time).unwrap();
            values.push(Box::new(tr_item_creditor_approval_time));

            let tr_item_debitor_expiration_time =
                parse_pg_timestamp(tr_item.debitor_expiration_time).unwrap();
            values.push(Box::new(tr_item_debitor_expiration_time));

            let tr_item_creditor_expiration_time =
                parse_pg_timestamp(tr_item.creditor_expiration_time).unwrap();
            values.push(Box::new(tr_item_creditor_expiration_time));

            for approval in tr_item.approvals.unwrap().into_iter() {
                let approval_rule_instance_id = parse_pg_int4(approval.rule_instance_id).unwrap();
                values.push(Box::new(approval_rule_instance_id));

                // transaction_id inserted by CTE auxiliary statement
                // transaction_item_id inserted by CTE auxiliary statement
                values.push(Box::new(approval.account_name));
                values.push(Box::new(approval.account_role));
                values.push(Box::new(approval.device_id));

                let approval_device_latlng = parse_pg_point(approval.device_latlng).unwrap();
                values.push(Box::new(approval_device_latlng));

                let approval_approval_time = parse_pg_timestamp(approval.approval_time).unwrap();
                values.push(Box::new(approval_approval_time));

                let approval_expiration_time =
                    parse_pg_timestamp(approval.expiration_time).unwrap();
                values.push(Box::new(approval_expiration_time));
            }
        }

        let rows = self.tx(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let row = &rows[0];
                let transaction_id = row.get(0);
                Ok(transaction_id)
            }
        }
    }

    async fn select_last_n_transactions_query(
        &self,
        account: String,
        n: i64,
    ) -> Result<Transactions, Box<dyn Error>> {
        let table = crate::sqls::transaction::TransactionTable::new();
        let sql = table.select_last_n_reqs_or_trans_by_account_sql(true);
        let values: ToSqlVec = vec![Box::new(account), Box::new(n)];
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let transactions: Transactions = Transactions::from(rows);
                Ok(transactions)
            }
        }
    }

    async fn select_last_n_requests_query(
        &self,
        account: String,
        n: i64,
    ) -> Result<Transactions, Box<dyn Error>> {
        let table = crate::sqls::transaction::TransactionTable::new();
        let sql = table.select_last_n_reqs_or_trans_by_account_sql(false);
        let values: ToSqlVec = vec![Box::new(account), Box::new(n)];
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let requests: Transactions = Transactions::from(rows);
                Ok(requests)
            }
        }
    }

    async fn select_transactions_by_ids_query(
        &self,
        transaction_ids: Vec<i32>,
    ) -> Result<Transactions, Box<dyn Error>> {
        let table = crate::sqls::transaction::TransactionTable::new();
        let sql = table.select_transactions_by_ids_sql(transaction_ids.len());
        let mut values: ToSqlVec = Vec::new();
        for t in transaction_ids.into_iter() {
            values.push(Box::new(t))
        }
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let transactions: Transactions = Transactions::from(rows);
                Ok(transactions)
            }
        }
    }

    // todo: merge with insert_approve_all_credit_rule_instance_query as cte
    async fn select_approve_all_credit_rule_instance_exists_query(
        &self,
        account_name: String,
    ) -> Result<bool, Box<dyn Error>> {
        let table = crate::sqls::rule_instance::RuleInstanceTable::new();
        let sql = table.select_rule_instance_exists_sql();
        let values: ToSqlVec = vec![
            Box::new("approval".to_string()),                  // rule_type
            Box::new("approveAnyCreditItem".to_string()),      // rule_name
            Box::new("ApprovalAllCreditRequests".to_string()), // rule_instance_name
            Box::new(AccountRole::Creditor),                   // account_role
            Box::new(account_name.clone()),                    // account_name
            Box::new(vec![
                account_name.clone(),
                AccountRole::Creditor.to_string(),
                account_name,
            ]), // variable_values
        ];
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let exists: bool = rows[0].get(0);
                Ok(exists)
            }
        }
    }

    async fn insert_approve_all_credit_rule_instance_query(
        &self,
        account_name: String,
    ) -> Result<(), Box<dyn Error>> {
        let table = crate::sqls::rule_instance::RuleInstanceTable::new();
        let sql = table.insert_rule_instance_sql();
        let values: ToSqlVec = vec![
            Box::new("approval".to_string()),                  // rule_type
            Box::new("approveAnyCreditItem".to_string()),      // rule_name
            Box::new("ApprovalAllCreditRequests".to_string()), // rule_instance_name
            Box::new(AccountRole::Creditor),                   // account_role
            Box::new(account_name.clone()),                    // account_name
            Box::new(vec![
                account_name.clone(),
                AccountRole::Creditor.to_string(),
                account_name,
            ]), // variable_values
        ];
        let result = self.execute(sql.to_string(), values).await;
        match result {
            Err(e) => Err(Box::new(e)),
            Ok(_) => Ok(()),
        }
    }
}

impl DatabaseConnection {
    pub async fn select_rule_instance_exists_query(
        &self,
        rule_type: String,
        rule_name: String,
        rule_instance_name: String,
        account_role: AccountRole,
        account_name: String,
        variable_values: Vec<String>,
    ) -> Result<bool, Box<dyn Error>> {
        let table = crate::sqls::rule_instance::RuleInstanceTable::new();
        let sql = table.select_rule_instance_exists_sql();
        let values: ToSqlVec = vec![
            Box::new(rule_type),
            Box::new(rule_name),
            Box::new(rule_instance_name),
            Box::new(account_role),
            Box::new(account_name),
            Box::new(variable_values),
        ];
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let exists: bool = rows[0].get(0);
                Ok(exists)
            }
        }
    }

    pub async fn insert_rule_instance_query(
        &self,
        rule_type: String,
        rule_name: String,
        rule_instance_name: String,
        account_role: AccountRole,
        account_name: String,
        variable_values: Vec<String>,
    ) -> Result<(), Box<dyn Error>> {
        let table = crate::sqls::rule_instance::RuleInstanceTable::new();
        let sql = table.insert_rule_instance_sql();
        let values: ToSqlVec = vec![
            Box::new(rule_type),
            Box::new(rule_name),
            Box::new(rule_instance_name),
            Box::new(account_role),
            Box::new(account_name),
            Box::new(variable_values),
        ];
        let result = self.execute(sql.to_string(), values).await;
        match result {
            Err(e) => Err(Box::new(e)),
            Ok(_) => Ok(()),
        }
    }

    pub async fn select_approvers_query(
        &self,
        account: String,
    ) -> Result<Vec<String>, Box<dyn Error>> {
        let sql = select_approvers();
        let values: ToSqlVec = vec![Box::new(account)];
        let rows = self.query(sql.to_string(), values).await;
        match rows {
            Err(e) => Err(Box::new(e)),
            Ok(rows) => {
                let approvers: Vec<String> = rows.into_iter().map(|row| row.get(0)).collect();
                Ok(approvers)
            }
        }
    }
}

fn parse_pg_int4(s: Option<String>) -> Result<Option<i32>, Box<dyn Error>> {
    if s.clone().is_none() || s.clone().unwrap() == *"" {
        return Ok(None);
    }
    // test for non-numeric string
    if s.clone().unwrap().parse::<i32>().is_err() {
        return Err("non-numeric string".into());
    }
    Ok(Some(s.unwrap().parse::<i32>().unwrap()))
}

fn parse_pg_point(s: Option<String>) -> Result<Option<Point<f64>>, Box<dyn Error>> {
    if s.clone().is_none() || s.clone().unwrap() == *"" {
        return Ok(None);
    }
    // create point from "(39.534552,-119.737825)"
    let stripped_parens = s.unwrap().replace(['(', ')'], "");
    let coords: Vec<&str> = stripped_parens.split(',').collect();
    let lat = coords[0].parse::<f64>().unwrap();
    let lng = coords[1].parse::<f64>().unwrap();
    Ok(Some(Point::new(lat, lng)))
}

fn parse_pg_timestamp(time: Option<TZTime>) -> Result<Option<DateTime<Utc>>, Box<dyn Error>> {
    if time.clone().is_none() {
        return Ok(None::<DateTime<Utc>>);
    }
    Ok(Some(time.unwrap().0))
}

fn parse_pg_numeric(s: Option<String>) -> Result<Option<Decimal>, Box<dyn Error>> {
    if s.clone().is_none() || s.clone().unwrap() == *"" {
        return Ok(None);
    }
    let mut decimal = Decimal::from_str_exact(s.unwrap().as_str())?;
    decimal.rescale(FIXED_DECIMAL_PLACES as u32);
    Ok(Some(decimal))
}

#[cfg(test)]
mod integration_tests {
    use super::*;
    use crate::postgres::DB;
    use bb8::PooledConnection;
    use bb8_postgres::PostgresConnectionManager;
    use dotenvy::dotenv;
    use std::{fs::File, io::BufReader, ops::Index, process::Command, str::FromStr};
    use tokio_postgres::NoTls;
    use types::{balance::AccountBalance, request_response::IntraTransaction};

    // underscore prefix for test helpers
    fn _before_each() {
        _reset_db();
        dotenv().expect(".env file not found");
    }

    fn _reset_db() {
        let restore_output = Command::new("make")
            .arg("-C")
            .arg("../..")
            .arg("reset-db")
            .output()
            .expect("failed to execute process");

        // cargo test -- --show-output
        let restore_output_str = String::from_utf8(restore_output.stdout).expect("Not UTF8");
        println!("{}", restore_output_str);
    }

    async fn _get_conn() -> PooledConnection<'static, PostgresConnectionManager<NoTls>> {
        let conn_uri = DB::create_conn_uri_from_env_vars();
        let pool = DB::new_pool(&conn_uri).await;
        pool.0.get_owned().await.unwrap()
    }

    async fn _row_exists(sql: &str) {
        let test_conn = _get_conn().await;
        let rows = test_conn.query(sql, &[]).await.unwrap();
        assert!(rows[0].get::<usize, bool>(0), "\n{}\n", sql);
    }

    async fn _row_has(sql: &str, want: &str) {
        let test_conn = _get_conn().await;
        let rows = test_conn.query(sql, &[]).await.unwrap();
        let got = rows[0].get::<usize, String>(0);
        assert_eq!(got, want, "\n{}\n", sql);
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_an_insert_account_query() {
        _before_each();

        // create a connection directly with the library
        let test_conn = _get_conn().await;

        // manually init the internal wrapper
        let api_conn = DatabaseConnection(test_conn);

        // create the query argument
        let test_account = "test_account".to_string();
        // call the function under test
        let _ = api_conn
            .insert_account_query(test_account.clone())
            .await
            .unwrap();

        // create a sql to test the record was inserted
        _row_exists(
            &format!(
                "SELECT EXISTS(SELECT 1 FROM account WHERE name = '{}')",
                test_account
            )
            .as_str(),
        )
        .await;
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_delete_owner_account_query() {
        _before_each();

        // create a connection directly with the library
        let test_conn = _get_conn().await;

        // create test_account arg
        let test_account = "test_account".to_string();

        // insert an account to delete
        let insert_sql = &format!("INSERT INTO account (name) VALUES ('{}');", test_account);
        let _ = test_conn.execute(insert_sql.as_str(), &[]).await.unwrap();

        // manually init the internal wrapper
        let api_conn = DatabaseConnection(test_conn);

        // call the function under test
        let _ = api_conn
            .delete_owner_account_query(test_account.clone())
            .await
            .unwrap();

        // test the record was deleted
        _row_exists(
            &format!(
                "SELECT NOT EXISTS(SELECT 1 FROM account_owner WHERE owner_account = '{}')",
                test_account
            )
            .as_str(),
        )
        .await;
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_select_account_balance_query() {
        _before_each();

        let test_conn = _get_conn().await;

        let test_account = "JoeCarter".to_string();
        let api_conn = DatabaseConnection(test_conn);
        let test_balance = api_conn
            .select_account_balance_query(test_account.clone())
            .await
            .unwrap();

        assert_eq!(test_balance, "1000.000");
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_select_account_balances_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_accounts = vec!["JoeCarter".to_string(), "JacobWebb".to_string()];
        let test_balances = api_conn
            .select_account_balances_query(test_accounts.clone())
            .await
            .unwrap();

        assert_eq!(
            test_balances.clone().index(0),
            &AccountBalance {
                account_name: "JoeCarter".to_string(),
                current_balance: Decimal::from_str("1000.000").unwrap(),
                current_transaction_item_id: None,
            }
        );
        assert_eq!(
            test_balances.clone().index(1),
            &AccountBalance {
                account_name: "JacobWebb".to_string(),
                current_balance: Decimal::from_str("1000.000").unwrap(),
                current_transaction_item_id: None,
            }
        );
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_update_account_balances_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let file = File::open("../../pkg/testdata/transWTimes.json").unwrap();
        let reader = BufReader::new(file);
        let test_intra_transaction: IntraTransaction = serde_json::from_reader(reader).unwrap();
        let test_transaction_items = test_intra_transaction.transaction.transaction_items;
        let _ = api_conn
            .update_account_balances_query(test_transaction_items.clone())
            .await
            .unwrap();

        let want: [(String, String); 3] = [
            ("GroceryCo".to_string(), "1021.000".to_string()),
            ("StateOfCalifornia".to_string(), "1001.890".to_string()),
            ("SarahBell".to_string(), "977.110".to_string()),
        ];
        for w in want.iter() {
            let got_sql = &format!("SELECT round(current_balance, 3)::text FROM account_balance WHERE account_name = '{}';", w.0);
            _row_has(got_sql, &w.1).await;
        }
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_an_insert_account_balance_query() {
        _before_each();

        let test_conn = _get_conn().await;

        // create test_account args
        let test_account = "test_account".to_string();

        // insert an account to delete
        let insert_sql = &format!("INSERT INTO account (name) VALUES ('{}');", test_account);
        let _ = test_conn.execute(insert_sql.as_str(), &[]).await.unwrap();

        // manually init the internal wrapper
        let api_conn = DatabaseConnection(test_conn);

        let test_balance = "1000.000";
        let test_balance_dec = Decimal::from_str(test_balance).unwrap();
        let test_curr_tr_item_id = 1;
        let _ = api_conn
            .insert_account_balance_query(
                test_account.clone(),
                test_balance_dec,
                test_curr_tr_item_id,
            )
            .await
            .unwrap();

        let got_sql = &format!("SELECT round(current_balance, 3)::text FROM account_balance WHERE account_name = '{}';", test_account);
        _row_has(got_sql, test_balance).await;
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_select_approvals_by_transaction_id_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_transaction_id = 1;
        let rows = api_conn
            .select_approvals_by_transaction_id_query(test_transaction_id)
            .await
            .unwrap();

        assert_eq!(rows.len(), 33);
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_select_approvals_by_transaction_ids_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_transaction_ids = [1, 2];
        let rows = api_conn
            .select_approvals_by_transaction_ids_query(test_transaction_ids.to_vec())
            .await
            .unwrap();

        assert_eq!(rows.len(), 66);
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_an_update_approvals_by_account_and_role_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        const DATE_RE: &str =
            r"\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)";
        let test_transaction_id = 1;
        let test_account = "JacobWebb".to_string();
        let test_role = AccountRole::Debitor;
        let got_equilibrium_time = api_conn
            .update_approvals_by_account_and_role_query(
                test_transaction_id,
                test_account.clone(),
                test_role,
            )
            .await
            .unwrap();

        // 1. test for transaction equilbrium_time
        let iso8601: ::regex::Regex = ::regex::Regex::new(DATE_RE).unwrap();
        assert!(iso8601.is_match(&got_equilibrium_time.to_string()));

        // 2. test for approval_time on approvals
        let got_sql = &format!(
            "SELECT COUNT(id)::TEXT FROM approval WHERE transaction_id = CAST ({} AS INTEGER) AND approval_time IS NOT NULL;",
            test_transaction_id,
        );
        _row_has(got_sql, "33").await;
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_an_insert_account_profile_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_account = "test_account".to_string();

        // insert account to associate with profile
        let _ = api_conn
            .insert_account_query(test_account.clone())
            .await
            .unwrap();

        let test_account_profile = AccountProfile {
            id: None,
            account_name: test_account,
            description: Some("test_description".to_string()),
            first_name: Some("test_first_name".to_string()),
            middle_name: Some("test_middle_name".to_string()),
            last_name: Some("test_last_name".to_string()),
            country_name: "test_country".to_string(),
            street_number: Some("123".to_string()),
            street_name: Some("test_street".to_string()),
            floor_number: Some("1".to_string()),
            unit_number: Some("101".to_string()),
            city_name: "test_city".to_string(),
            county_name: Some("test_county".to_string()),
            region_name: Some("test_region".to_string()),
            state_name: "test_state".to_string(),
            postal_code: "12345".to_string(),
            latlng: Some("(40.7128,-74.0060)".to_string()),
            email_address: "test@test.com".to_string(),
            telephone_country_code: Some("1".to_string()),
            telephone_area_code: Some("123".to_string()),
            telephone_number: Some("1234567".to_string()),
            occupation_id: Some("1".to_string()),
            industry_id: Some("1".to_string()),
            removal_time: None,
        };

        let profile_id = api_conn
            .insert_account_profile_query(test_account_profile.clone())
            .await
            .unwrap();

        let got_sql = &format!(
            "SELECT EXISTS(SELECT 1 FROM account_profile WHERE id = '{}');",
            profile_id
        );
        _row_exists(got_sql).await;
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_select_profile_ids_by_account_names_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_accounts = vec!["JoeCarter".to_string(), "JacobWebb".to_string()];

        let got = api_conn
            .select_profile_ids_by_account_names_query(test_accounts.clone().to_vec())
            .await
            .unwrap();

        let want: [(String, String); 2] = [
            ("1".to_string(), test_accounts[0].clone()),
            ("7".to_string(), test_accounts[1].clone()),
        ];

        assert_eq!(got, want);
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_select_transaction_items_by_transaction_id_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_transaction_id = 1;
        let rows = api_conn
            .select_transaction_items_by_transaction_id_query(test_transaction_id)
            .await
            .unwrap();

        assert_eq!(rows.len(), 6);
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_select_transaction_items_by_transaction_ids_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_transaction_ids = [1, 2];
        let rows = api_conn
            .select_transaction_items_by_transaction_ids_query(test_transaction_ids.to_vec())
            .await
            .unwrap();

        assert_eq!(rows.len(), 12);
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_select_transaction_by_id_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_transaction_id = 1;
        let row = api_conn
            .select_transaction_by_id_query(test_transaction_id)
            .await
            .unwrap();

        assert_eq!(row.id, Some("1".to_string()));
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_an_insert_transaction_tx_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let mut api_conn = DatabaseConnection(test_conn);

        let input_file = File::open("../../pkg/testdata/requests.json").unwrap();
        let input_reader = BufReader::new(input_file);
        let test_transactions: Vec<IntraTransaction> =
            serde_json::from_reader(input_reader).unwrap();
        let test_transaction = test_transactions[0].transaction.clone();

        let transaction_id = api_conn
            .insert_transaction_tx_query(test_transaction.clone())
            .await
            .unwrap();

        assert_eq!(transaction_id, "3");
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_select_last_n_transactions_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let mut api_conn = DatabaseConnection(test_conn);

        let input_file = File::open("../../pkg/testdata/requests.json").unwrap();
        let input_reader = BufReader::new(input_file);
        let test_transactions: Vec<IntraTransaction> =
            serde_json::from_reader(input_reader).unwrap();
        let test_transaction = test_transactions[0].transaction.clone();
        let test_account = "JoeCarter".to_string();

        // start from 3 to avoid the first two transactions inserted by db migration
        for i in 3..=6 {
            api_conn
                .insert_transaction_tx_query(test_transaction.clone())
                .await
                .unwrap();

            api_conn
                .update_approvals_by_account_and_role_query(
                    i,
                    test_account.clone(),
                    AccountRole::Debitor,
                )
                .await
                .unwrap();
        }

        let n = 3;
        let rows = api_conn
            .select_last_n_transactions_query(test_account.clone(), n)
            .await
            .unwrap();

        assert_eq!(rows.len(), 3);
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_select_last_n_requests_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let mut api_conn = DatabaseConnection(test_conn);

        let input_file = File::open("../../pkg/testdata/requests.json").unwrap();
        let input_reader = BufReader::new(input_file);
        let test_transactions: Vec<IntraTransaction> =
            serde_json::from_reader(input_reader).unwrap();
        let test_transaction = test_transactions[0].transaction.clone();
        let test_account = "JoeCarter".to_string();

        for _ in 0..=2 {
            api_conn
                .insert_transaction_tx_query(test_transaction.clone())
                .await
                .unwrap();
        }

        let n = 3;
        let rows = api_conn
            .select_last_n_requests_query(test_account.clone(), n)
            .await
            .unwrap();

        assert_eq!(rows.len(), 3);
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_selects_by_transactions_ids_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let mut api_conn = DatabaseConnection(test_conn);

        let input_file = File::open("../../pkg/testdata/requests.json").unwrap();
        let input_reader = BufReader::new(input_file);
        let test_transactions: Vec<IntraTransaction> =
            serde_json::from_reader(input_reader).unwrap();
        let test_transaction = test_transactions[0].transaction.clone();

        for _ in 0..=2 {
            api_conn
                .insert_transaction_tx_query(test_transaction.clone())
                .await
                .unwrap();
        }

        let rows = api_conn
            .select_transactions_by_ids_query(vec![1, 2, 3])
            .await
            .unwrap();

        assert_eq!(rows.len(), 3);
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_select_rule_instance_exists_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_rule_type = "approval".to_string();
        let test_rule_name = "approveAnyCreditItem".to_string();
        let test_rule_instance_name = "ApproveAllGroceryCoCredit".to_string();
        let test_account_role = AccountRole::Creditor;
        let test_account_name = "NoExist".to_string(); // intended
        let test_variable_values = vec![
            "GroceryCo".to_string(),
            "creditor".to_string(),
            "IgorPetrov".to_string(),
        ];

        let exists = api_conn
            .select_rule_instance_exists_query(
                test_rule_type.clone(),
                test_rule_name.clone(),
                test_rule_instance_name.clone(),
                test_account_role,
                test_account_name.clone(),
                test_variable_values.clone(),
            )
            .await
            .unwrap();

        assert_eq!(exists, false);
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_an_insert_rule_instance_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_rule_type = String::from("approval");
        let test_rule_name = String::from("approveAnyCreditItem");
        let test_rule_instance_name = String::from("ApproveAllSkywaysCredit");
        let test_account_role = AccountRole::Creditor;
        let test_account_name = String::from("JacobWebb");
        let test_variable_values = vec![
            "Skyways".to_string(),
            "creditor".to_string(),
            "JacobWebb".to_string(),
        ];

        let _ = api_conn
            .insert_rule_instance_query(
                test_rule_type.clone(),
                test_rule_name.clone(),
                test_rule_instance_name.clone(),
                test_account_role,
                test_account_name.clone(),
                test_variable_values.clone(),
            )
            .await
            .unwrap();

        let got_sql = &format!(
            "SELECT EXISTS(SELECT 1 FROM rule_instance WHERE rule_type = '{}' AND rule_name = '{}' AND rule_instance_name = '{}' AND account_role = '{}' AND account_name = '{}' AND variable_values = '{{\"Skyways\",\"creditor\",\"JacobWebb\"}}');",
            test_rule_type,
            test_rule_name,
            test_rule_instance_name,
            test_account_role,
            test_account_name,
        );
        _row_exists(got_sql).await;
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_an_insert_approve_all_credit_rule_instance_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_account_name = "JacobWebb".to_string();

        let _ = api_conn
            .insert_approve_all_credit_rule_instance_query(test_account_name.clone())
            .await;

        let got_sql = &format!(
            "SELECT EXISTS(SELECT 1 FROM rule_instance WHERE rule_type = 'approval' AND rule_name = 'approveAnyCreditItem' AND rule_instance_name = 'ApprovalAllCreditRequests' AND account_role = 'creditor' AND account_name = '{}' AND variable_values = '{{\"JacobWebb\",\"creditor\",\"JacobWebb\"}}');",
            test_account_name,
        );
        _row_exists(got_sql).await;
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_creates_a_select_approve_all_credit_rule_instance_exists_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_account_name = "JacobWebb".to_string();

        let _ = api_conn
            .insert_approve_all_credit_rule_instance_query(test_account_name.clone())
            .await;

        let exists = api_conn
            .select_approve_all_credit_rule_instance_exists_query(test_account_name.clone())
            .await
            .unwrap();

        assert_eq!(exists, true);
    }

    #[cfg_attr(not(feature = "db_tests"), ignore)]
    #[tokio::test]
    async fn it_crates_a_selects_approvers_query() {
        _before_each();

        let test_conn = _get_conn().await;
        let api_conn = DatabaseConnection(test_conn);

        let test_account = "StateOfCalifornia".to_string();
        let rows = api_conn
            .select_approvers_query(test_account.clone())
            .await
            .unwrap();

        assert_eq!(rows.len(), 3);
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

#[async_trait]
impl DBConnPoolTrait for ConnectionPool {
    async fn get_conn(&self) -> DynDBConn {
        let conn = self.0.get_owned().await.unwrap(); // todo: handle error
        Arc::new(Conn(Arc::new(DatabaseConnection(conn))))
    }
}

// for dependency injection, wrap tokio-postgres as a trait object
// inside a Conn, then impl service traits on Conn
pub struct Conn(Arc<dyn DatabaseConnectionTrait + Send + Sync + 'static>);

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

        self.q(sql_stmt, &params[..]).await
    }

    async fn query_approvers(
        &self,
        sql_stmt: String,
        account: String,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
        self.q(sql_stmt, &[&account]).await
    }

    async fn query_profile_state_rule_instances(
        &self,
        sql_stmt: String,
        account_role: AccountRole,
        state_name: String,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
        self.q(sql_stmt, &[&"transaction_item", &account_role, &state_name])
            .await
    }

    async fn query_rule_instances_by_type_role_account(
        &self,
        sql_stmt: String,
        account_role: AccountRole,
        account: String,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
        self.q(sql_stmt, &[&"transaction_item", &account_role, &account])
            .await
    }

    async fn query_approval_rule_instances(
        &self,
        sql_stmt: String,
        account_role: AccountRole,
        account: String,
    ) -> Result<Vec<Box<dyn RowTrait>>, tokio_postgres::Error> {
        self.q(sql_stmt, &[&"approval", &account_role, &account])
            .await
    }
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
        removal_time: row.get_opt_tztime("removal_time"),
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::postgres::DB;
    use serial_test::serial; // concurrency avoided while using static mut TEST_ARGS for shared test state
    use std::{env, vec};
    use types::time::TZTime;

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
            String::from("removal_time"),
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

        fn get_decimal(&self, idx: &str) -> Decimal {
            self.add(idx);
            Decimal::new(10, 1)
        }
    }

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
