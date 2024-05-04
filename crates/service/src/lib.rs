use cognitoidp::CognitoJwkSet;
use pg::model::ModelTrait;
use rust_decimal::Decimal;
use std::{env, error::Error};
use types::{
    account::{AccountProfile, AccountProfiles, ProfileIds},
    account_role::AccountRole,
    approval::{ApprovalError, Approvals},
    balance::AccountBalances,
    request_response::IntraTransaction,
    rule::RuleInstances,
    time::TZTime,
    transaction::{Transaction, Transactions},
    transaction_item::TransactionItems,
};

pub struct Service<'a, T: ModelTrait> {
    conn: &'a T,
}

impl<'a, T: ModelTrait> Service<'a, T> {
    pub fn new(conn: &'a T) -> Self {
        Self { conn }
    }

    pub async fn create_account(&self, account: String) -> Result<(), Box<dyn Error>> {
        match self.conn.insert_account_query(account).await {
            Ok(_) => Ok(()),
            Err(e) => Err(e),
        }
    }

    pub async fn delete_owner_account(&self, account: String) -> Result<(), Box<dyn Error>> {
        match self.conn.delete_owner_account_query(account).await {
            Ok(_) => Ok(()),
            Err(e) => Err(e),
        }
    }

    pub async fn create_account_profile(
        &self,
        account_profile: AccountProfile,
    ) -> Result<String, Box<dyn Error>> {
        match self
            .conn
            .insert_account_profile_query(account_profile)
            .await
        {
            Ok(account) => Ok(account),
            Err(e) => Err(e),
        }
    }

    pub async fn get_profile_ids_by_account_names(
        &self,
        account_names: Vec<String>,
    ) -> Result<ProfileIds, Box<dyn Error>> {
        match self
            .conn
            .select_profile_ids_by_account_names_query(account_names)
            .await
        {
            Ok(profile_ids) => {
                let map = ProfileIds::from(profile_ids);
                Ok(map)
            }
            Err(e) => Err(e),
        }
    }

    pub async fn create_account_balance(
        &self,
        account: String,
        balance: Decimal,
        curr_tr_item_id: i32,
    ) -> Result<(), Box<dyn Error>> {
        match self
            .conn
            .insert_account_balance_query(account, balance, curr_tr_item_id)
            .await
        {
            Ok(_) => Ok(()),
            Err(e) => Err(e),
        }
    }

    pub async fn get_account_balance(&self, account: String) -> Result<String, Box<dyn Error>> {
        match self.conn.select_account_balance_query(account).await {
            Ok(balance) => Ok(balance),
            Err(e) => Err(e),
        }
    }

    pub async fn get_account_balances(
        &self,
        accounts: Vec<String>,
    ) -> Result<AccountBalances, Box<dyn Error>> {
        match self.conn.select_account_balances_query(accounts).await {
            Ok(account_balances) => Ok(account_balances),
            Err(e) => Err(e),
        }
    }

    pub async fn get_debitor_account_balances(
        &self,
        transaction_items: TransactionItems,
    ) -> Result<AccountBalances, Box<dyn Error>> {
        let debitors = transaction_items.list_unique_debitors();
        let debitor_balances = self.get_account_balances(debitors).await?;
        Ok(debitor_balances)
    }

    async fn change_account_balances(
        &self,
        transaction_items: TransactionItems,
    ) -> Result<(), Box<dyn Error>> {
        self.conn
            .update_account_balances_query(transaction_items)
            .await
    }

    async fn test_sufficient_debitor_funds(
        &self,
        transaction_items: TransactionItems,
    ) -> Result<(), Box<dyn Error>> {
        let debitor_funds_required = transaction_items.map_required_funds_from_debitors();
        let debitor_funds_available = self.get_debitor_account_balances(transaction_items).await?;
        for required in debitor_funds_required {
            let (debitor, funds_required) = required;

            let debitor_account_balance = debitor_funds_available
                .get_account_balance(&debitor)
                .unwrap();

            if !debitor_account_balance.sufficient_balance(funds_required) {
                let err_msg = &*format!(
                    "{} {} debitor funds less than {}",
                    debitor_account_balance.account_name, debitor, funds_required
                );
                return Err(err_msg.into());
            }
        }
        Ok(())
    }

    async fn add_approval_times_by_account_and_role(
        &self,
        transaction_id: i32,
        account: String,
        role: AccountRole,
    ) -> Result<Option<TZTime>, Box<dyn Error>> {
        self.conn
            .update_approvals_by_account_and_role_query(transaction_id, account, role)
            .await
    }

    // todo: convert to postgres function to avoid 3 db queries
    async fn get_transaction_with_transaction_items_and_approvals_by_id(
        &self,
        transaction_id: i32,
    ) -> Result<Transaction, Box<dyn Error>> {
        let mut transaction = self
            .conn
            .select_transaction_by_id_query(transaction_id)
            .await?;

        let transaction_items = self
            .get_transaction_items_by_transaction_id(transaction_id)
            .await?;

        let approvals = self.get_approvals_by_transaction_id(transaction_id).await?;

        transaction.build(transaction_items, approvals)?;

        Ok(transaction)
    }

    // todo: convert to postgres function to avoid 3 db queries
    pub async fn get_transactions_with_transaction_items_and_approvals_by_ids(
        &self,
        transaction_ids: Vec<i32>,
    ) -> Result<Transactions, Box<dyn Error>> {
        let mut transactions = self
            .conn
            .select_transactions_by_ids_query(transaction_ids.clone())
            .await?;

        let transaction_items = self
            .get_transaction_items_by_transaction_ids(transaction_ids.clone())
            .await?;

        let approvals = self
            .get_approvals_by_transaction_ids(transaction_ids.clone())
            .await?;

        transactions.build(transaction_items, approvals);

        Ok(transactions)
    }

    pub async fn approve(
        &self,
        auth_account: String,
        approver_role: AccountRole,
        request: Transaction,
    ) -> Result<IntraTransaction, Box<dyn Error>> {
        // todo: test auth_account == account_owner (approver)

        // test debitors for sufficient funds
        self.test_sufficient_debitor_funds(request.clone().transaction_items)
            .await?;

        // fail approval when self payment detected in transaction items
        request
            .clone()
            .transaction_items
            .test_unique_contra_accounts()?; // cadet todo: add unit test

        let mut approval_time: Option<TZTime> = None;

        // test for pending approvals to reduce db round trips
        match request
            .clone()
            .test_pending_role_approval(auth_account.as_str(), approver_role)
        {
            Ok(_) => (),
            Err(e) => match e {
                ApprovalError::PreviouslyApproved(t) => {
                    approval_time = Some(t);
                }
                _ => return Err(Box::new(e)),
            },
        }

        let transaction_id = request.clone().id.unwrap().parse::<i32>().unwrap();

        // add approval time to transaction if not previously approved
        if approval_time.is_none() {
            self.add_approval_times_by_account_and_role(
                transaction_id,
                auth_account.clone(),
                approver_role,
            )
            .await?;
        }

        // get transaction with transaction items and approvals
        let post_approval_transaction = self
            .get_transaction_with_transaction_items_and_approvals_by_id(transaction_id)
            .await?;

        // change account balances if equilibrium time is set
        if post_approval_transaction.equilibrium_time.is_some() {
            self.change_account_balances(post_approval_transaction.transaction_items.clone())
                .await?;
        }
        // todo: notify role approvers in transaction

        // create intra transaction
        let intra_transaction = IntraTransaction::new(auth_account, post_approval_transaction);

        // respond
        Ok(intra_transaction)
    }

    pub async fn add_approve_all_credit_rule_instance_if_not_exists(
        &self,
        account_name: String,
    ) -> Result<(), Box<dyn Error>> {
        let exists = self
            .conn
            .select_approve_all_credit_rule_instance_exists_query(account_name.clone())
            .await?;
        if !exists {
            self.conn
                .insert_approve_all_credit_rule_instance_query(account_name.clone())
                .await?;
        }
        Ok(())
    }

    pub async fn create_account_from_cognito_trigger(
        &self,
        account_profile: AccountProfile,
        beginning_balance: Decimal,
        current_transaction_item_id: i32,
    ) -> Result<(), Box<dyn Error>> {
        self.create_account(account_profile.account_name.clone())
            .await?;
        self.create_account_profile(account_profile.clone()).await?;
        self.create_account_balance(
            account_profile.clone().account_name,
            beginning_balance,
            current_transaction_item_id,
        )
        .await?;
        self.add_approve_all_credit_rule_instance_if_not_exists(account_profile.account_name)
            .await?;
        Ok(())
    }

    pub async fn get_transaction_by_id(
        &self,
        transaction_id: i32,
    ) -> Result<Transaction, Box<dyn Error>> {
        self.conn
            .select_transaction_by_id_query(transaction_id)
            .await
    }

    pub async fn get_full_transaction_by_id(
        &self,
        transaction_id: i32,
    ) -> Result<Transaction, Box<dyn Error>> {
        let transaction = self
            .get_transaction_with_transaction_items_and_approvals_by_id(transaction_id)
            .await?;
        Ok(transaction)
    }

    pub async fn create_transaction(
        &self,
        transaction: Transaction,
    ) -> Result<String, Box<dyn Error>> {
        self.conn.insert_transaction_query(transaction).await
    }

    pub async fn get_last_n_requests(
        &self,
        account: String,
        n: i64,
    ) -> Result<Transactions, Box<dyn Error>> {
        let mut requests = self.conn.select_last_n_requests_query(account, n).await?;
        let transaction_ids = requests.list_ids()?;
        if transaction_ids.is_empty() {
            return Ok(requests);
        }
        let transaction_items = self
            .get_transaction_items_and_approvals_by_transaction_ids(transaction_ids)
            .await?;
        requests.add_transaction_items(transaction_items)?;
        Ok(requests)
    }

    pub async fn get_last_n_transactions(
        &self,
        account: String,
        n: i64,
    ) -> Result<Transactions, Box<dyn Error>> {
        let mut transactions = self
            .conn
            .select_last_n_transactions_query(account, n)
            .await?;
        let transaction_ids = transactions.list_ids()?;
        if transaction_ids.is_empty() {
            return Ok(transactions);
        }
        let transaction_items = self
            .get_transaction_items_and_approvals_by_transaction_ids(transaction_ids)
            .await?;
        transactions.add_transaction_items(transaction_items)?;
        Ok(transactions)
    }

    pub async fn get_transaction_items_and_approvals_by_transaction_ids(
        &self,
        transaction_ids: Vec<i32>,
    ) -> Result<TransactionItems, Box<dyn Error>> {
        let mut transaction_items = self
            .get_transaction_items_by_transaction_ids(transaction_ids.clone())
            .await?;

        let approvals = self
            .get_approvals_by_transaction_ids(transaction_ids.clone())
            .await?;

        transaction_items.add_approvals(approvals)?;

        Ok(transaction_items)
    }

    pub async fn get_transaction_items_by_transaction_id(
        &self,
        transaction_id: i32,
    ) -> Result<TransactionItems, Box<dyn Error>> {
        self.conn
            .select_transaction_items_by_transaction_id_query(transaction_id)
            .await
    }

    pub async fn get_transaction_items_by_transaction_ids(
        &self,
        transaction_ids: Vec<i32>,
    ) -> Result<TransactionItems, Box<dyn Error>> {
        self.conn
            .select_transaction_items_by_transaction_ids_query(transaction_ids)
            .await
    }

    pub async fn get_approvals_by_transaction_id(
        &self,
        transaction_id: i32,
    ) -> Result<Approvals, Box<dyn Error>> {
        self.conn
            .select_approvals_by_transaction_id_query(transaction_id)
            .await
    }

    pub async fn get_approvals_by_transaction_ids(
        &self,
        transaction_ids: Vec<i32>,
    ) -> Result<Approvals, Box<dyn Error>> {
        self.conn
            .select_approvals_by_transaction_ids_query(transaction_ids)
            .await
    }

    pub async fn get_json_web_key_set(&self) -> Result<Option<CognitoJwkSet>, Box<dyn Error>> {
        if env::var("ENABLE_API_AUTH") == Ok("true".to_string()) {
            let uri = env::var("COGNITO_JWKS_URI").expect("msg: COGNITO_JWKS_URI not set");
            let jwks = CognitoJwkSet::new(uri.as_str()).await;
            match jwks {
                Ok(jwks) => Ok(Some(jwks)),
                Err(e) => Err(Box::new(e)),
            }
        } else {
            Ok(None)
        }
    }

    pub fn get_auth_account(
        &self,
        jwks: CognitoJwkSet,
        token: &str,
        temp_account: &str,
    ) -> Result<String, Box<dyn Error>> {
        if env::var("ENABLE_API_AUTH") == Ok("true".to_string()) {
            let account = jwks.cognito_user(token)?;
            Ok(account)
        } else {
            Ok(temp_account.to_string())
        }
    }

    pub async fn get_account_approvers(
        &self,
        account: String,
    ) -> Result<Vec<String>, Box<dyn Error>> {
        self.conn.select_approvers_query(account).await
    }

    pub async fn get_tr_item_rule_instances_by_role_account(
        &self,
        account_role: AccountRole,
        account_name: String,
    ) -> Result<RuleInstances, Box<dyn Error>> {
        self.conn
            .select_rule_instance_by_type_role_account_query(
                "transaction_item".to_string(),
                account_role,
                account_name,
            )
            .await
    }

    pub async fn get_account_profiles(
        &self,
        account_names: Vec<String>,
    ) -> Result<AccountProfiles, Box<dyn Error>> {
        self.conn
            .select_account_profiles_by_account_names_query(account_names)
            .await
    }

    pub async fn get_state_tr_item_rule_instances(
        &self,
        account_role: AccountRole,
        state_name: String,
    ) -> Result<RuleInstances, Box<dyn Error>> {
        self.conn
            .select_rule_instance_by_type_role_state_query(
                "transaction_item".to_string(),
                account_role,
                state_name,
            )
            .await
    }

    pub async fn get_approval_rule_instances(
        &self,
        account_role: AccountRole,
        approver_account: String,
    ) -> Result<RuleInstances, Box<dyn Error>> {
        self.conn
            .select_rule_instance_by_type_role_account_query(
                "approval".to_string(),
                account_role,
                approver_account,
            )
            .await
    }
}

#[cfg(test)]
mod tests {
    use std::{str::FromStr, vec};

    use mockall::predicate;
    use pg::model::MockModelTrait;
    use rust_decimal::Decimal;
    use types::{
        account::{AccountProfile, AccountProfiles},
        account_role::AccountRole,
        approval::{Approval, Approvals},
        balance::{AccountBalance, AccountBalances},
        rule::{RuleInstance, RuleInstances},
        time::TZTime,
        transaction::{Transaction, Transactions},
        transaction_item::{TransactionItem, TransactionItems},
    };

    #[tokio::test]
    async fn create_account_queries_by_account() {
        let mut conn = MockModelTrait::new();
        let account = "test_account".to_string();

        conn.expect_insert_account_query()
            .with(predicate::eq(account.clone()))
            .times(1)
            .returning(|_| Ok(()));

        let service = super::Service::new(&conn);

        let _ = service.create_account(account).await;
    }

    #[tokio::test]
    async fn delete_owner_account_queries_by_account() {
        let mut conn = MockModelTrait::new();
        let account = "test_account".to_string();

        conn.expect_delete_owner_account_query()
            .with(predicate::eq(account.clone()))
            .times(1)
            .returning(|_| Ok(()));

        let service = super::Service::new(&conn);

        let _ = service.delete_owner_account(account).await;
    }

    #[tokio::test]
    async fn create_account_profile_queries_by_account_profile() {
        let mut conn = MockModelTrait::new();
        let test_account_profile = create_test_account_profiles().0[0].clone();

        conn.expect_insert_account_profile_query()
            .with(predicate::eq(test_account_profile.clone()))
            .times(1)
            .returning(|_| Ok("test_account".to_string()));

        let service = super::Service::new(&conn);

        let _ = service.create_account_profile(test_account_profile).await;
    }

    #[tokio::test]
    async fn get_profile_ids_by_account_names_queries_by_account_names() {
        let mut conn = MockModelTrait::new();
        let account_names = vec!["test_account".to_string()];

        conn.expect_select_profile_ids_by_account_names_query()
            .with(predicate::eq(account_names.clone()))
            .times(1)
            .returning(|_| Ok(vec![]));

        let service = super::Service::new(&conn);

        let _ = service
            .get_profile_ids_by_account_names(account_names)
            .await;
    }

    #[tokio::test]
    async fn create_account_balance_queries_by_account_balance() {
        let mut conn = MockModelTrait::new();
        let account = "test_account".to_string();
        let balance = 100.into();
        let curr_tr_item_id = 1;

        conn.expect_insert_account_balance_query()
            .with(
                predicate::eq(account.clone()),
                predicate::eq(balance),
                predicate::eq(curr_tr_item_id),
            )
            .times(1)
            .returning(|_, _, _| Ok(()));

        let service = super::Service::new(&conn);

        let _ = service
            .create_account_balance(account, balance, curr_tr_item_id)
            .await;
    }

    #[tokio::test]
    async fn get_account_balance_queries_by_account() {
        let mut conn = MockModelTrait::new();
        let account = "test_account".to_string();

        conn.expect_select_account_balance_query()
            .with(predicate::eq(account.clone()))
            .times(1)
            .returning(|_| Ok("100".to_string()));

        let service = super::Service::new(&conn);

        let _ = service.get_account_balance(account).await;
    }

    #[tokio::test]
    async fn get_account_balances_queries_by_accounts() {
        let mut conn = MockModelTrait::new();
        let accounts = vec!["test_account".to_string()];

        conn.expect_select_account_balances_query()
            .with(predicate::eq(accounts.clone()))
            .times(1)
            .returning(|_| Ok(AccountBalances::new()));

        let service = super::Service::new(&conn);

        let _ = service.get_account_balances(accounts).await;
    }

    #[tokio::test]
    async fn get_debitor_account_balances_queries_by_transaction_items() {
        let mut conn = MockModelTrait::new();
        let test_transaction_items = create_test_transaction_items();

        conn.expect_select_account_balances_query()
            .times(1)
            .returning(|_| Ok(AccountBalances::new()));

        let service = super::Service::new(&conn);

        let _ = service
            .get_debitor_account_balances(test_transaction_items)
            .await;
    }

    #[tokio::test]
    async fn change_account_balances_queries_by_transaction_items() {
        let mut conn = MockModelTrait::new();
        let test_transaction_items = create_test_transaction_items();

        conn.expect_update_account_balances_query()
            .with(predicate::eq(test_transaction_items.clone()))
            .times(1)
            .returning(|_| Ok(()));

        let service = super::Service::new(&conn);

        let _ = service
            .change_account_balances(test_transaction_items)
            .await;
    }

    #[tokio::test]
    async fn test_sufficient_debitor_funds_queries_by_transaction_items() {
        let mut conn = MockModelTrait::new();
        let test_transaction_items = create_test_transaction_items();

        conn.expect_select_account_balances_query()
            .times(1)
            .returning(|_| {
                let mut test_account_balances = AccountBalances::new();
                test_account_balances.push(AccountBalance {
                    account_name: "JacobWebb".to_string(),
                    current_balance: Decimal::from_str("1000.000").unwrap(),
                    current_transaction_item_id: Some("1".to_string()),
                });
                Ok(test_account_balances)
            });

        let service = super::Service::new(&conn);

        let _ = service
            .test_sufficient_debitor_funds(test_transaction_items)
            .await;
    }

    #[tokio::test]
    async fn test_sufficient_debitor_funds_errors_when_insufficient_funds() {
        let mut conn = MockModelTrait::new();
        let test_transaction_items = create_test_transaction_items();

        conn.expect_select_account_balances_query()
            .times(1)
            .returning(|_| {
                let mut test_account_balances = AccountBalances::new();
                test_account_balances.push(AccountBalance {
                    account_name: "JacobWebb".to_string(),
                    current_balance: Decimal::from_str("0.000").unwrap(),
                    current_transaction_item_id: Some("1".to_string()),
                });
                Ok(test_account_balances)
            });

        let service = super::Service::new(&conn);

        let result = service
            .test_sufficient_debitor_funds(test_transaction_items)
            .await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn add_approval_times_by_account_and_role_queries_by_transaction_id_account_and_role() {
        let mut conn = MockModelTrait::new();
        let transaction_id = 1;
        let account = "test_account".to_string();
        let role = AccountRole::Debitor;

        conn.expect_update_approvals_by_account_and_role_query()
            .with(
                predicate::eq(transaction_id),
                predicate::eq(account.clone()),
                predicate::eq(role),
            )
            .times(1)
            .returning(|_, _, _| Ok(None));

        let service = super::Service::new(&conn);

        let _ = service
            .add_approval_times_by_account_and_role(transaction_id, account, role)
            .await;
    }

    #[tokio::test]
    async fn get_transaction_with_transaction_items_and_approvals_by_id_queries_by_transaction_id()
    {
        let mut conn = MockModelTrait::new();
        let transaction_id = 1;

        conn.expect_select_transaction_by_id_query()
            .with(predicate::eq(transaction_id))
            .times(1)
            .returning(|_| Ok(create_test_transaction()));

        conn.expect_select_transaction_items_by_transaction_id_query()
            .with(predicate::eq(transaction_id))
            .times(1)
            .returning(|_| Ok(create_test_transaction_items()));

        conn.expect_select_approvals_by_transaction_id_query()
            .with(predicate::eq(transaction_id))
            .times(1)
            .returning(|_| {
                Ok(create_test_transaction_items().0[0]
                    .approvals
                    .as_ref()
                    .unwrap()
                    .clone())
            });

        let service = super::Service::new(&conn);

        let _ = service
            .get_transaction_with_transaction_items_and_approvals_by_id(transaction_id)
            .await;
    }

    #[tokio::test]
    async fn get_transactions_with_transaction_items_and_approvals_by_ids_queries_by_transaction_ids(
    ) {
        let mut conn = MockModelTrait::new();
        let transaction_ids = vec![1, 2];

        conn.expect_select_transactions_by_ids_query()
            .with(predicate::eq(transaction_ids.clone()))
            .times(1)
            .returning(|_| {
                let mut test_transactions =
                    Transactions(vec![create_test_transaction(), create_test_transaction()]);
                for tr in test_transactions.0.iter_mut() {
                    tr.transaction_items = TransactionItems(vec![]);
                }
                Ok(test_transactions)
            });

        conn.expect_select_transaction_items_by_transaction_ids_query()
            .with(predicate::eq(transaction_ids.clone()))
            .times(1)
            .returning(|_| {
                let mut test_transaction_items = create_test_transaction_items();
                for tr_item in test_transaction_items.0.iter_mut() {
                    tr_item.approvals = None;
                }
                Ok(test_transaction_items)
            });

        conn.expect_select_approvals_by_transaction_ids_query()
            .with(predicate::eq(transaction_ids.clone()))
            .times(1)
            .returning(|_| {
                Ok(create_test_transaction_items().0[0]
                    .approvals
                    .as_ref()
                    .unwrap()
                    .clone())
            });

        let service = super::Service::new(&conn);

        let _ = service
            .get_transactions_with_transaction_items_and_approvals_by_ids(transaction_ids)
            .await;
    }

    #[tokio::test]
    async fn approve_called_with_args() {
        let mut conn = MockModelTrait::new();
        let test_auth_account = "JacobWebb".to_string();
        let test_approver_role = AccountRole::Debitor;
        let test_request = create_test_transaction();
        let test_transaction_id = 1;

        conn.expect_select_account_balances_query()
            .times(1)
            .with(predicate::eq(vec![test_auth_account.clone()]))
            .returning(|_| {
                let mut test_account_balances = AccountBalances::new();
                test_account_balances.push(AccountBalance {
                    account_name: "JacobWebb".to_string(),
                    current_balance: Decimal::from_str("1000.000").unwrap(),
                    current_transaction_item_id: Some("1".to_string()),
                });
                Ok(test_account_balances)
            });

        conn.expect_update_approvals_by_account_and_role_query()
            .with(
                predicate::eq(test_transaction_id),
                predicate::eq(test_auth_account.clone()),
                predicate::eq(test_approver_role),
            )
            .times(1)
            .returning(|_, _, _| Ok(None));

        conn.expect_select_transaction_by_id_query()
            .times(1)
            .with(predicate::eq(test_transaction_id))
            .returning(|_| {
                let mut test_transaction = create_test_transaction();
                test_transaction.equilibrium_time = Some(TZTime::now());
                test_transaction.transaction_items = TransactionItems(vec![]);
                Ok(test_transaction)
            });

        conn.expect_select_transaction_items_by_transaction_id_query()
            .times(1)
            .with(predicate::eq(test_transaction_id))
            .returning(|_| {
                let mut test_transaction_items = create_test_transaction_items();
                for tr_item in test_transaction_items.0.iter_mut() {
                    tr_item.approvals = None;
                }
                Ok(test_transaction_items)
            });

        conn.expect_select_approvals_by_transaction_id_query()
            .times(1)
            .with(predicate::eq(test_transaction_id))
            .returning(|_| {
                let mut test_approvals = Approvals(vec![]);
                for tr_item in create_test_transaction_items().0.iter() {
                    for approval in tr_item.approvals.as_ref().unwrap().0.iter() {
                        test_approvals.0.push(approval.clone());
                    }
                }
                Ok(test_approvals)
            });

        conn.expect_update_account_balances_query()
            .with(predicate::eq(create_test_transaction_items()))
            .times(1)
            .returning(|_| Ok(()));

        let service = super::Service::new(&conn);

        let _ = service
            .approve(test_auth_account, test_approver_role, test_request)
            .await
            .unwrap();
    }

    #[tokio::test]
    async fn add_approve_all_credit_rule_instance_if_not_exists_queries_by_account_name() {
        let mut conn = MockModelTrait::new();
        let account_name = "JacobWebb".to_string();

        conn.expect_select_approve_all_credit_rule_instance_exists_query()
            .with(predicate::eq(account_name.clone()))
            .times(1)
            .returning(|_| Ok(false));

        conn.expect_insert_approve_all_credit_rule_instance_query()
            .with(predicate::eq(account_name.clone()))
            .times(1)
            .returning(|_| Ok(()));

        let service = super::Service::new(&conn);

        let _ = service
            .add_approve_all_credit_rule_instance_if_not_exists(account_name)
            .await;
    }

    #[tokio::test]
    async fn create_account_from_cognito_trigger_queries_by_account_profile() {
        let mut conn = MockModelTrait::new();
        let test_account_profile = create_test_account_profiles().0[0].clone();
        let beginning_balance = Decimal::from_str("1000.000").unwrap();
        let current_transaction_item_id = 1;

        conn.expect_insert_account_query()
            .with(predicate::eq(test_account_profile.account_name.clone()))
            .times(1)
            .returning(|_| Ok(()));

        conn.expect_insert_account_profile_query()
            .with(predicate::eq(test_account_profile.clone()))
            .times(1)
            .returning(|_| Ok("test_account".to_string()));

        conn.expect_insert_account_balance_query()
            .with(
                predicate::eq(test_account_profile.account_name.clone()),
                predicate::eq(beginning_balance),
                predicate::eq(current_transaction_item_id),
            )
            .times(1)
            .returning(|_, _, _| Ok(()));

        conn.expect_insert_approve_all_credit_rule_instance_query()
            .with(predicate::eq(test_account_profile.account_name.clone()))
            .times(1)
            .returning(|_| Ok(()));

        conn.expect_select_approve_all_credit_rule_instance_exists_query()
            .with(predicate::eq(test_account_profile.account_name.clone()))
            .times(1)
            .returning(|_| Ok(false));

        let service = super::Service::new(&conn);

        let _ = service
            .create_account_from_cognito_trigger(
                test_account_profile,
                beginning_balance,
                current_transaction_item_id,
            )
            .await;
    }

    #[tokio::test]
    async fn get_transaction_by_id_queries_by_transaction_id() {
        let mut conn = MockModelTrait::new();
        let transaction_id = 1;

        conn.expect_select_transaction_by_id_query()
            .with(predicate::eq(transaction_id))
            .times(1)
            .returning(|_| Ok(create_test_transaction()));

        let service = super::Service::new(&conn);

        let _ = service.get_transaction_by_id(transaction_id).await;
    }

    #[tokio::test]
    async fn get_full_transaction_by_id_queries_by_transaction_id() {
        let mut conn = MockModelTrait::new();
        let transaction_id = 1;

        conn.expect_select_transaction_by_id_query()
            .with(predicate::eq(transaction_id))
            .times(1)
            .returning(|_| Ok(create_test_transaction()));

        conn.expect_select_transaction_items_by_transaction_id_query()
            .with(predicate::eq(transaction_id))
            .times(1)
            .returning(|_| Ok(create_test_transaction_items()));

        conn.expect_select_approvals_by_transaction_id_query()
            .with(predicate::eq(transaction_id))
            .times(1)
            .returning(|_| {
                Ok(create_test_transaction_items().0[0]
                    .approvals
                    .as_ref()
                    .unwrap()
                    .clone())
            });

        let service = super::Service::new(&conn);

        let _ = service.get_full_transaction_by_id(transaction_id).await;
    }

    #[tokio::test]
    async fn create_transaction_inserts_transaction() {
        let mut conn = MockModelTrait::new();
        let test_transaction = create_test_transaction();

        conn.expect_insert_transaction_query()
            .with(predicate::eq(test_transaction.clone()))
            .times(1)
            .returning(|_| Ok("1".to_string()));

        let service = super::Service::new(&conn);

        let _ = service.create_transaction(test_transaction).await;
    }

    #[tokio::test]
    async fn get_last_n_requests_queries_by_account_and_n() {
        let mut conn = MockModelTrait::new();
        let account = "JacobWebb".to_string();
        let n = 10;

        conn.expect_select_last_n_requests_query()
            .with(predicate::eq(account.clone()), predicate::eq(n))
            .times(1)
            .returning(|_, _| Ok(create_test_transactions()));

        conn.expect_select_transaction_items_by_transaction_ids_query()
            .with(predicate::eq(
                create_test_transactions().list_ids().unwrap(),
            ))
            .times(1)
            .returning(|_| Ok(create_test_transaction_items()));

        conn.expect_select_approvals_by_transaction_ids_query()
            .with(predicate::eq(
                create_test_transactions().list_ids().unwrap(),
            ))
            .times(1)
            .returning(|_| {
                Ok(create_test_transaction_items().0[0]
                    .approvals
                    .as_ref()
                    .unwrap()
                    .clone())
            });

        let service = super::Service::new(&conn);

        let _ = service.get_last_n_requests(account, n).await;
    }

    #[tokio::test]
    async fn get_last_n_transactions_queries_by_account_and_n() {
        let mut conn = MockModelTrait::new();
        let account = "JacobWebb".to_string();
        let n = 10;

        conn.expect_select_last_n_transactions_query()
            .with(predicate::eq(account.clone()), predicate::eq(n))
            .times(1)
            .returning(|_, _| Ok(create_test_transactions()));

        conn.expect_select_transaction_items_by_transaction_ids_query()
            .with(predicate::eq(
                create_test_transactions().list_ids().unwrap(),
            ))
            .times(1)
            .returning(|_| Ok(create_test_transaction_items()));

        conn.expect_select_approvals_by_transaction_ids_query()
            .with(predicate::eq(
                create_test_transactions().list_ids().unwrap(),
            ))
            .times(1)
            .returning(|_| {
                Ok(create_test_transaction_items().0[0]
                    .approvals
                    .as_ref()
                    .unwrap()
                    .clone())
            });

        let service = super::Service::new(&conn);

        let _ = service.get_last_n_transactions(account, n).await;
    }

    #[tokio::test]
    async fn get_transaction_items_and_approvals_by_transaction_ids_queries_by_transaction_ids() {
        let mut conn = MockModelTrait::new();
        let transaction_ids = vec![1, 2];

        conn.expect_select_transaction_items_by_transaction_ids_query()
            .with(predicate::eq(transaction_ids.clone()))
            .times(1)
            .returning(|_| Ok(create_test_transaction_items()));

        conn.expect_select_approvals_by_transaction_ids_query()
            .with(predicate::eq(transaction_ids.clone()))
            .times(1)
            .returning(|_| {
                Ok(create_test_transaction_items().0[0]
                    .approvals
                    .as_ref()
                    .unwrap()
                    .clone())
            });

        let service = super::Service::new(&conn);

        let _ = service
            .get_transaction_items_and_approvals_by_transaction_ids(transaction_ids)
            .await;
    }

    #[tokio::test]
    async fn get_transaction_items_by_transaction_id_queries_by_transaction_id() {
        let mut conn = MockModelTrait::new();
        let transaction_id = 1;

        conn.expect_select_transaction_items_by_transaction_id_query()
            .with(predicate::eq(transaction_id))
            .times(1)
            .returning(|_| Ok(create_test_transaction_items()));

        let service = super::Service::new(&conn);

        let _ = service
            .get_transaction_items_by_transaction_id(transaction_id)
            .await;
    }

    #[tokio::test]
    async fn get_transaction_items_by_transaction_ids_queries_by_transaction_ids() {
        let mut conn = MockModelTrait::new();
        let transaction_ids = vec![1, 2];

        conn.expect_select_transaction_items_by_transaction_ids_query()
            .with(predicate::eq(transaction_ids.clone()))
            .times(1)
            .returning(|_| Ok(create_test_transaction_items()));

        let service = super::Service::new(&conn);

        let _ = service
            .get_transaction_items_by_transaction_ids(transaction_ids)
            .await;
    }

    #[tokio::test]
    async fn get_approvals_by_transaction_id_queries_by_transaction_id() {
        let mut conn = MockModelTrait::new();
        let transaction_id = 1;

        conn.expect_select_approvals_by_transaction_id_query()
            .with(predicate::eq(transaction_id))
            .times(1)
            .returning(|_| {
                Ok(create_test_transaction_items().0[0]
                    .approvals
                    .as_ref()
                    .unwrap()
                    .clone())
            });

        let service = super::Service::new(&conn);

        let _ = service
            .get_approvals_by_transaction_id(transaction_id)
            .await;
    }

    #[tokio::test]
    async fn get_approvals_by_transaction_ids_queries_by_transaction_ids() {
        let mut conn = MockModelTrait::new();
        let transaction_ids = vec![1, 2];

        conn.expect_select_approvals_by_transaction_ids_query()
            .with(predicate::eq(transaction_ids.clone()))
            .times(1)
            .returning(|_| {
                Ok(create_test_transaction_items().0[0]
                    .approvals
                    .as_ref()
                    .unwrap()
                    .clone())
            });

        let service = super::Service::new(&conn);

        let _ = service
            .get_approvals_by_transaction_ids(transaction_ids)
            .await;
    }

    #[tokio::test]
    async fn get_account_approvers_queries_by_account() {
        let mut conn = MockModelTrait::new();
        let account = "JacobWebb".to_string();

        conn.expect_select_approvers_query()
            .with(predicate::eq(account.clone()))
            .times(1)
            .returning(|_| Ok(vec![]));

        let service = super::Service::new(&conn);

        let _ = service.get_account_approvers(account).await;
    }

    #[tokio::test]
    async fn get_tr_item_rule_instances_by_role_account_queries_by_account_role_and_account_name() {
        let mut conn = MockModelTrait::new();
        let account_role = AccountRole::Debitor;
        let account_name = "JacobWebb".to_string();

        conn.expect_select_rule_instance_by_type_role_account_query()
            .with(
                predicate::eq("transaction_item".to_string()),
                predicate::eq(account_role),
                predicate::eq(account_name.clone()),
            )
            .times(1)
            .returning(|_, _, _| {
                Ok(RuleInstances(vec![RuleInstance {
                    id: Some(String::from("1")),
                    rule_type: String::from("transaction_item"),
                    rule_name: String::from("multiplyItemValue"),
                    rule_instance_name: String::from("NinePercentSalesTax"),
                    variable_values: vec![
                        String::from("ANY"),
                        String::from("StateOfCalifornia"),
                        String::from("9% state sales tax"),
                        String::from("0.09"),
                    ],
                    account_role: AccountRole::Creditor,
                    item_id: None,
                    price: None,
                    quantity: None,
                    unit_of_measurement: None,
                    units_measured: None,
                    account_name: None,
                    first_name: None,
                    middle_name: None,
                    last_name: None,
                    country_name: None,
                    street_id: None,
                    street_name: None,
                    floor_number: None,
                    unit_id: None,
                    city_name: None,
                    county_name: None,
                    region_name: None,
                    state_name: Some(String::from("California")),
                    postal_code: None,
                    latlng: None,
                    email_address: None,
                    telephone_country_code: None,
                    telephone_area_code: None,
                    telephone_number: None,
                    occupation_id: None,
                    industry_id: None,
                    disabled_time: None,
                    removed_time: None,
                    created_at: Some(TZTime::now()),
                }]))
            });

        let service = super::Service::new(&conn);

        let _ = service
            .get_tr_item_rule_instances_by_role_account(account_role, account_name)
            .await;
    }

    #[tokio::test]
    async fn get_account_profiles_queries_by_account_names() {
        let mut conn = MockModelTrait::new();
        let account_names = vec!["JacobWebb".to_string()];

        conn.expect_select_account_profiles_by_account_names_query()
            .with(predicate::eq(account_names.clone()))
            .times(1)
            .returning(|_| Ok(create_test_account_profiles()));

        let service = super::Service::new(&conn);

        let _ = service.get_account_profiles(account_names).await;
    }

    #[tokio::test]
    async fn get_state_tr_item_rule_instances_queries_by_account_role_and_state_name() {
        let mut conn = MockModelTrait::new();
        let account_role = AccountRole::Debitor;
        let state_name = "California".to_string();

        conn.expect_select_rule_instance_by_type_role_state_query()
            .with(
                predicate::eq("transaction_item".to_string()),
                predicate::eq(account_role),
                predicate::eq(state_name.clone()),
            )
            .times(1)
            .returning(|_, _, _| {
                Ok(RuleInstances(vec![RuleInstance {
                    id: Some(String::from("1")),
                    rule_type: String::from("transaction_item"),
                    rule_name: String::from("multiplyItemValue"),
                    rule_instance_name: String::from("NinePercentSalesTax"),
                    variable_values: vec![
                        String::from("ANY"),
                        String::from("StateOfCalifornia"),
                        String::from("9% state sales tax"),
                        String::from("0.09"),
                    ],
                    account_role: AccountRole::Creditor,
                    item_id: None,
                    price: None,
                    quantity: None,
                    unit_of_measurement: None,
                    units_measured: None,
                    account_name: None,
                    first_name: None,
                    middle_name: None,
                    last_name: None,
                    country_name: None,
                    street_id: None,
                    street_name: None,
                    floor_number: None,
                    unit_id: None,
                    city_name: None,
                    county_name: None,
                    region_name: None,
                    state_name: Some(String::from("California")),
                    postal_code: None,
                    latlng: None,
                    email_address: None,
                    telephone_country_code: None,
                    telephone_area_code: None,
                    telephone_number: None,
                    occupation_id: None,
                    industry_id: None,
                    disabled_time: None,
                    removed_time: None,
                    created_at: Some(TZTime::now()),
                }]))
            });

        let service = super::Service::new(&conn);

        let _ = service
            .get_state_tr_item_rule_instances(account_role, state_name)
            .await;
    }

    #[tokio::test]
    async fn get_approval_rule_instances_queries_by_account_role_and_approver_account() {
        let mut conn = MockModelTrait::new();
        let account_role = AccountRole::Debitor;
        let approver_account = "JacobWebb".to_string();

        conn.expect_select_rule_instance_by_type_role_account_query()
            .with(
                predicate::eq("approval".to_string()),
                predicate::eq(account_role),
                predicate::eq(approver_account.clone()),
            )
            .times(1)
            .returning(|_, _, _| {
                Ok(RuleInstances(vec![RuleInstance {
                    id: Some(String::from("1")),
                    rule_type: String::from("approval"),
                    rule_name: String::from("approveAllCredit"),
                    rule_instance_name: String::from("ApproveAllCredit"),
                    variable_values: vec![],
                    account_role: AccountRole::Debitor,
                    item_id: None,
                    price: None,
                    quantity: None,
                    unit_of_measurement: None,
                    units_measured: None,
                    account_name: None,
                    first_name: None,
                    middle_name: None,
                    last_name: None,
                    country_name: None,
                    street_id: None,
                    street_name: None,
                    floor_number: None,
                    unit_id: None,
                    city_name: None,
                    county_name: None,
                    region_name: None,
                    state_name: None,
                    postal_code: None,
                    latlng: None,
                    email_address: None,
                    telephone_country_code: None,
                    telephone_area_code: None,
                    telephone_number: None,
                    occupation_id: None,
                    industry_id: None,
                    disabled_time: None,
                    removed_time: None,
                    created_at: Some(TZTime::now()),
                }]))
            });

        let service = super::Service::new(&conn);

        let _ = service
            .get_approval_rule_instances(account_role, approver_account)
            .await;
    }

    pub fn create_test_transactions() -> Transactions {
        Transactions(vec![
            Transaction {
                id: Some(String::from("1")),
                rule_instance_id: None,
                author: Some(String::from("GroceryStore")),
                author_device_id: None,
                author_device_latlng: None,
                author_role: Some(AccountRole::Creditor),
                equilibrium_time: None,
                sum_value: String::from("21.800"),
                transaction_items: TransactionItems(vec![
                    TransactionItem {
                        id: Some(String::from("2")),
                        transaction_id: Some(String::from("1")),
                        item_id: String::from("bread"),
                        price: String::from("3.000"),
                        quantity: String::from("2"),
                        debitor_first: Some(false),
                        rule_instance_id: None,
                        rule_exec_ids: Some(vec![]),
                        unit_of_measurement: None,
                        units_measured: None,
                        debitor: String::from("JacobWebb"),
                        creditor: String::from("GroceryStore"),
                        debitor_profile_id: None,
                        creditor_profile_id: None,
                        debitor_approval_time: None,
                        creditor_approval_time: None,
                        debitor_rejection_time: None,
                        creditor_rejection_time: None,
                        debitor_expiration_time: None,
                        creditor_expiration_time: None,
                        approvals: Some(Approvals(vec![
                            Approval {
                                id: None,
                                rule_instance_id: None,
                                transaction_id: Some(String::from("1")),
                                transaction_item_id: Some(String::from("2")),
                                account_name: String::from("JacobWebb"),
                                account_role: AccountRole::Debitor,
                                device_id: None,
                                device_latlng: None,
                                approval_time: None,
                                rejection_time: None,
                                expiration_time: None,
                            },
                            Approval {
                                id: None,
                                rule_instance_id: None,
                                transaction_id: Some(String::from("1")),
                                transaction_item_id: Some(String::from("2")),
                                account_name: String::from("GroceryStore"),
                                account_role: AccountRole::Creditor,
                                device_id: None,
                                device_latlng: None,
                                approval_time: None,
                                rejection_time: None,
                                expiration_time: None,
                            },
                        ])),
                    },
                    TransactionItem {
                        id: Some(String::from("3")),
                        transaction_id: Some(String::from("1")),
                        item_id: String::from("milk"),
                        price: String::from("4.000"),
                        quantity: String::from("3"),
                        debitor_first: Some(false),
                        rule_instance_id: None,
                        rule_exec_ids: Some(vec![]),
                        unit_of_measurement: None,
                        units_measured: None,
                        debitor: String::from("JacobWebb"),
                        creditor: String::from("GroceryStore"),
                        debitor_profile_id: None,
                        creditor_profile_id: None,
                        debitor_approval_time: None,
                        creditor_approval_time: None,
                        debitor_rejection_time: None,
                        creditor_rejection_time: None,
                        debitor_expiration_time: None,
                        creditor_expiration_time: None,
                        approvals: Some(Approvals(vec![
                            Approval {
                                id: None,
                                rule_instance_id: None,
                                transaction_id: Some(String::from("1")),
                                transaction_item_id: Some(String::from("3")),
                                account_name: String::from("JacobWebb"),
                                account_role: AccountRole::Debitor,
                                device_id: None,
                                device_latlng: None,
                                approval_time: None,
                                rejection_time: None,
                                expiration_time: None,
                            },
                            Approval {
                                id: None,
                                rule_instance_id: None,
                                transaction_id: Some(String::from("1")),
                                transaction_item_id: Some(String::from("3")),
                                account_name: String::from("GroceryStore"),
                                account_role: AccountRole::Creditor,
                                device_id: None,
                                device_latlng: None,
                                approval_time: None,
                                rejection_time: None,
                                expiration_time: None,
                            },
                        ])),
                    },
                ]),
            },
            Transaction {
                id: Some(String::from("2")),
                rule_instance_id: None,
                author: Some(String::from("GroceryStore")),
                author_device_id: None,
                author_device_latlng: None,
                author_role: Some(AccountRole::Creditor),
                equilibrium_time: None,
                sum_value: String::from("21.800"),
                transaction_items: TransactionItems(vec![
                    TransactionItem {
                        id: Some(String::from("4")),
                        transaction_id: Some(String::from("2")),
                        item_id: String::from("bread"),
                        price: String::from("3.000"),
                        quantity: String::from("2"),
                        debitor_first: Some(false),
                        rule_instance_id: None,
                        rule_exec_ids: Some(vec![]),
                        unit_of_measurement: None,
                        units_measured: None,
                        debitor: String::from("JacobWebb"),
                        creditor: String::from("GroceryStore"),
                        debitor_profile_id: None,
                        creditor_profile_id: None,
                        debitor_approval_time: None,
                        creditor_approval_time: None,
                        debitor_rejection_time: None,
                        creditor_rejection_time: None,
                        debitor_expiration_time: None,
                        creditor_expiration_time: None,
                        approvals: Some(Approvals(vec![
                            Approval {
                                id: None,
                                rule_instance_id: None,
                                transaction_id: Some(String::from("2")),
                                transaction_item_id: Some(String::from("4")),
                                account_name: String::from("JacobWebb"),
                                account_role: AccountRole::Debitor,
                                device_id: None,
                                device_latlng: None,
                                approval_time: None,
                                rejection_time: None,
                                expiration_time: None,
                            },
                            Approval {
                                id: None,
                                rule_instance_id: None,
                                transaction_id: Some(String::from("2")),
                                transaction_item_id: Some(String::from("4")),
                                account_name: String::from("GroceryStore"),
                                account_role: AccountRole::Creditor,
                                device_id: None,
                                device_latlng: None,
                                approval_time: None,
                                rejection_time: None,
                                expiration_time: None,
                            },
                        ])),
                    },
                    TransactionItem {
                        id: Some(String::from("5")),
                        transaction_id: Some(String::from("2")),
                        item_id: String::from("milk"),
                        price: String::from("4.000"),
                        quantity: String::from("3"),
                        debitor_first: Some(false),
                        rule_instance_id: None,
                        rule_exec_ids: Some(vec![]),
                        unit_of_measurement: None,
                        units_measured: None,
                        debitor: String::from("JacobWebb"),
                        creditor: String::from("GroceryStore"),
                        debitor_profile_id: None,
                        creditor_profile_id: None,
                        debitor_approval_time: None,
                        creditor_approval_time: None,
                        debitor_rejection_time: None,
                        creditor_rejection_time: None,
                        debitor_expiration_time: None,
                        creditor_expiration_time: None,
                        approvals: Some(Approvals(vec![
                            Approval {
                                id: None,
                                rule_instance_id: None,
                                transaction_id: Some(String::from("2")),
                                transaction_item_id: Some(String::from("5")),
                                account_name: String::from("JacobWebb"),
                                account_role: AccountRole::Debitor,
                                device_id: None,
                                device_latlng: None,
                                approval_time: None,
                                rejection_time: None,
                                expiration_time: None,
                            },
                            Approval {
                                id: None,
                                rule_instance_id: None,
                                transaction_id: Some(String::from("2")),
                                transaction_item_id: Some(String::from("5")),
                                account_name: String::from("GroceryStore"),
                                account_role: AccountRole::Creditor,
                                device_id: None,
                                device_latlng: None,
                                approval_time: None,
                                rejection_time: None,
                                expiration_time: None,
                            },
                        ])),
                    },
                ]),
            },
        ])
    }

    pub fn create_test_account_profiles() -> AccountProfiles {
        AccountProfiles(vec![
            AccountProfile {
                id: Some(String::from("7")),
                account_name: String::from("GroceryStore"),
                description: Some(String::from("Sells groceries")),
                first_name: Some(String::from("Grocery")),
                middle_name: None,
                last_name: Some(String::from("Store")),
                country_name: String::from("United States of America"),
                street_number: Some(String::from("8701")),
                street_name: Some(String::from("Lincoln Blvd")),
                floor_number: None,
                unit_number: None,
                city_name: String::from("Los Angeles"),
                county_name: Some(String::from("Los Angeles County")),
                region_name: None,
                state_name: String::from("California"),
                postal_code: String::from("90045"),
                latlng: Some(String::from("(33.958050,-118.418388)")),
                email_address: String::from("grocerystore@address.xz"),
                telephone_country_code: Some(String::from("1")),
                telephone_area_code: Some(String::from("310")),
                telephone_number: Some(String::from("5555555")),
                occupation_id: Some(String::from("11")),
                industry_id: Some(String::from("11")),
                removal_time: None,
            },
            AccountProfile {
                id: None,
                account_name: String::from("AaronHill"),
                description: Some(String::from("Shortwave radio operator")),
                first_name: Some(String::from("Aaron")),
                middle_name: Some(String::from("Baker")),
                last_name: Some(String::from("Hill")),
                country_name: String::from("United States of America"),
                street_number: Some(String::from("2344")),
                street_name: Some(String::from("Central Ave")),
                floor_number: None,
                unit_number: None,
                city_name: String::from("Billings"),
                county_name: Some(String::from("Yellowstone County")),
                region_name: None,
                state_name: String::from("Montana"),
                postal_code: String::from("59102"),
                latlng: Some(String::from("(45.769540, -108.575760)")),
                email_address: String::from("aaron@address.xz"),
                telephone_country_code: Some(String::from("1")),
                telephone_area_code: Some(String::from("406")),
                telephone_number: Some(String::from("5555555")),
                occupation_id: Some(String::from("4")),
                industry_id: Some(String::from("4")),
                removal_time: None,
            },
        ])
    }

    pub fn create_test_transaction() -> Transaction {
        Transaction {
            id: Some(String::from("1")),
            rule_instance_id: None,
            author: Some(String::from("GroceryStore")),
            author_device_id: None,
            author_device_latlng: None,
            author_role: Some(AccountRole::Creditor),
            equilibrium_time: None,
            sum_value: String::from("21.800"),
            transaction_items: TransactionItems(vec![
                TransactionItem {
                    id: Some(String::from("2")),
                    transaction_id: Some(String::from("1")),
                    item_id: String::from("bread"),
                    price: String::from("3.000"),
                    quantity: String::from("2"),
                    debitor_first: Some(false),
                    rule_instance_id: None,
                    rule_exec_ids: Some(vec![]),
                    unit_of_measurement: None,
                    units_measured: None,
                    debitor: String::from("JacobWebb"),
                    creditor: String::from("GroceryStore"),
                    debitor_profile_id: None,
                    creditor_profile_id: None,
                    debitor_approval_time: None,
                    creditor_approval_time: None,
                    debitor_rejection_time: None,
                    creditor_rejection_time: None,
                    debitor_expiration_time: None,
                    creditor_expiration_time: None,
                    approvals: Some(Approvals(vec![
                        Approval {
                            id: None,
                            rule_instance_id: None,
                            transaction_id: Some(String::from("1")),
                            transaction_item_id: Some(String::from("2")),
                            account_name: String::from("JacobWebb"),
                            account_role: AccountRole::Debitor,
                            device_id: None,
                            device_latlng: None,
                            approval_time: None,
                            rejection_time: None,
                            expiration_time: None,
                        },
                        Approval {
                            id: None,
                            rule_instance_id: None,
                            transaction_id: Some(String::from("1")),
                            transaction_item_id: Some(String::from("2")),
                            account_name: String::from("GroceryStore"),
                            account_role: AccountRole::Creditor,
                            device_id: None,
                            device_latlng: None,
                            approval_time: None,
                            rejection_time: None,
                            expiration_time: None,
                        },
                    ])),
                },
                TransactionItem {
                    id: Some(String::from("3")),
                    transaction_id: Some(String::from("1")),
                    item_id: String::from("milk"),
                    price: String::from("4.000"),
                    quantity: String::from("3"),
                    debitor_first: Some(false),
                    rule_instance_id: None,
                    rule_exec_ids: Some(vec![]),
                    unit_of_measurement: None,
                    units_measured: None,
                    debitor: String::from("JacobWebb"),
                    creditor: String::from("GroceryStore"),
                    debitor_profile_id: None,
                    creditor_profile_id: None,
                    debitor_approval_time: None,
                    creditor_approval_time: None,
                    debitor_rejection_time: None,
                    creditor_rejection_time: None,
                    debitor_expiration_time: None,
                    creditor_expiration_time: None,
                    approvals: Some(Approvals(vec![
                        Approval {
                            id: None,
                            rule_instance_id: None,
                            transaction_id: Some(String::from("1")),
                            transaction_item_id: Some(String::from("3")),
                            account_name: String::from("JacobWebb"),
                            account_role: AccountRole::Debitor,
                            device_id: None,
                            device_latlng: None,
                            approval_time: None,
                            rejection_time: None,
                            expiration_time: None,
                        },
                        Approval {
                            id: None,
                            rule_instance_id: None,
                            transaction_id: Some(String::from("1")),
                            transaction_item_id: Some(String::from("3")),
                            account_name: String::from("GroceryStore"),
                            account_role: AccountRole::Creditor,
                            device_id: None,
                            device_latlng: None,
                            approval_time: None,
                            rejection_time: None,
                            expiration_time: None,
                        },
                    ])),
                },
            ]),
        }
    }

    pub fn create_test_transaction_items() -> TransactionItems {
        TransactionItems(vec![
            TransactionItem {
                id: Some(String::from("2")),
                transaction_id: Some(String::from("1")),
                item_id: String::from("bread"),
                price: String::from("3.000"),
                quantity: String::from("2"),
                debitor_first: Some(false),
                rule_instance_id: None,
                rule_exec_ids: Some(vec![]),
                unit_of_measurement: None,
                units_measured: None,
                debitor: String::from("JacobWebb"),
                creditor: String::from("GroceryStore"),
                debitor_profile_id: None,
                creditor_profile_id: None,
                debitor_approval_time: None,
                creditor_approval_time: None,
                debitor_rejection_time: None,
                creditor_rejection_time: None,
                debitor_expiration_time: None,
                creditor_expiration_time: None,
                approvals: Some(Approvals(vec![
                    Approval {
                        id: None,
                        rule_instance_id: None,
                        transaction_id: Some(String::from("1")),
                        transaction_item_id: Some(String::from("2")),
                        account_name: String::from("JacobWebb"),
                        account_role: AccountRole::Debitor,
                        device_id: None,
                        device_latlng: None,
                        approval_time: None,
                        rejection_time: None,
                        expiration_time: None,
                    },
                    Approval {
                        id: None,
                        rule_instance_id: None,
                        transaction_id: Some(String::from("1")),
                        transaction_item_id: Some(String::from("2")),
                        account_name: String::from("GroceryStore"),
                        account_role: AccountRole::Creditor,
                        device_id: None,
                        device_latlng: None,
                        approval_time: None,
                        rejection_time: None,
                        expiration_time: None,
                    },
                ])),
            },
            TransactionItem {
                id: Some(String::from("3")),
                transaction_id: Some(String::from("1")),
                item_id: String::from("milk"),
                price: String::from("4.000"),
                quantity: String::from("3"),
                debitor_first: Some(false),
                rule_instance_id: None,
                rule_exec_ids: Some(vec![]),
                unit_of_measurement: None,
                units_measured: None,
                debitor: String::from("JacobWebb"),
                creditor: String::from("GroceryStore"),
                debitor_profile_id: None,
                creditor_profile_id: None,
                debitor_approval_time: None,
                creditor_approval_time: None,
                debitor_rejection_time: None,
                creditor_rejection_time: None,
                debitor_expiration_time: None,
                creditor_expiration_time: None,
                approvals: Some(Approvals(vec![
                    Approval {
                        id: None,
                        rule_instance_id: None,
                        transaction_id: Some(String::from("1")),
                        transaction_item_id: Some(String::from("3")),
                        account_name: String::from("JacobWebb"),
                        account_role: AccountRole::Debitor,
                        device_id: None,
                        device_latlng: None,
                        approval_time: None,
                        rejection_time: None,
                        expiration_time: None,
                    },
                    Approval {
                        id: None,
                        rule_instance_id: None,
                        transaction_id: Some(String::from("1")),
                        transaction_item_id: Some(String::from("3")),
                        account_name: String::from("GroceryStore"),
                        account_role: AccountRole::Creditor,
                        device_id: None,
                        device_latlng: None,
                        approval_time: None,
                        rejection_time: None,
                        expiration_time: None,
                    },
                ])),
            },
        ])
    }
}
