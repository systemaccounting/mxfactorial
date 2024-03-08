use httpclient::HttpClient as Client;
use pg::model::ModelTrait;
use rust_decimal::Decimal;
use std::{env, error::Error};
use types::{
    account::AccountProfile,
    account_role::AccountRole,
    approval::{ApprovalError, Approvals},
    balance::AccountBalances,
    request_response::IntraTransaction,
    time::TZTime,
    transaction::{Transaction, Transactions},
    transaction_item::TransactionItems,
};

pub struct Service<T: ModelTrait> {
    conn: T,
}

impl<T: ModelTrait> Service<T> {
    pub fn new(conn: T) -> Self {
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
        match self.conn.insert_account_profile_query(account_profile).await {
            Ok(account) => Ok(account),
            Err(e) => Err(e),
        }
    }

    pub async fn get_profile_ids_by_account_names(
        &self,
        account_names: Vec<String>,
    ) -> Result<Vec<(String, String)>, Box<dyn Error>> {
        match self
            .conn
            .select_profile_ids_by_account_names_query(account_names).await
        {
            Ok(profile_ids) => Ok(profile_ids), // [(id, account_name),...]
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
            .insert_account_balance_query(account, balance, curr_tr_item_id).await
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
        self.conn.update_account_balances_query(transaction_items).await
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
    ) -> Result<TZTime, Box<dyn Error>> {
        self.conn
            .update_approvals_by_account_and_role_query(transaction_id, account, role).await
    }

    // todo: convert to postgres function to avoid 3 db queries
    async fn get_transaction_with_transaction_items_and_approvals_by_id(
        &self,
        transaction_id: i32,
    ) -> Result<Transaction, Box<dyn Error>> {
        let mut transaction = self.conn.select_transaction_by_id_query(transaction_id).await?;

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
            .select_transactions_by_ids_query(transaction_ids.clone()).await?;

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
        // test debitors for sufficient funds
        self.test_sufficient_debitor_funds(request.clone().transaction_items)
            .await?;

        // fail approval when self payment detected in transaction items
        request
            .clone()
            .transaction_items
            .test_unique_contra_accounts()?;

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
                _ => return Err(e.into()),
            },
        }

        // add approval time to transaction if not previously approved
        if approval_time.is_none() {
            self.add_approval_times_by_account_and_role(
                request.clone().id.unwrap().parse::<i32>().unwrap(),
                auth_account.clone(),
                approver_role,
            )
            .await?;
        }

        let id = request.clone().id.unwrap().parse::<i32>().unwrap();

        // get transaction with transaction items and approvals
        let post_approval_transaction = self
            .get_transaction_with_transaction_items_and_approvals_by_id(id)
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
            .select_approve_all_credit_rule_instance_exists_query(account_name.clone()).await?;
        if !exists {
            self.conn
                .insert_approve_all_credit_rule_instance_query(account_name.clone()).await?;
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

    pub async fn get_rule_applied_transaction(
        transaction_items: TransactionItems,
    ) -> Result<IntraTransaction, Box<dyn Error>> {
        let uri = env::var("RULE_URL").unwrap();
        let client = Client::new();
        let body = transaction_items.to_json_string();
        let response = client.post(uri, body).await?;
        let rule_tested = response.text().await.unwrap();
        let intra_transaction = IntraTransaction::from_json_string(rule_tested.as_str())?;
        Ok(intra_transaction)
    }

    pub async fn get_transaction_by_id(
        &self,
        transaction_id: i32,
    ) -> Result<Transaction, Box<dyn Error>> {
        let transaction = self
            .get_transaction_with_transaction_items_and_approvals_by_id(transaction_id)
            .await?;
        Ok(transaction)
    }

    pub async fn create_transaction_tx(
        &mut self,
        transaction: Transaction,
    ) -> Result<String, Box<dyn Error>> {
        self.conn.insert_transaction_tx_query(transaction).await
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
        let mut transactions = self.conn.select_last_n_transactions_query(account, n).await?;
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
            .select_transaction_items_by_transaction_id_query(transaction_id).await
    }

    pub async fn get_transaction_items_by_transaction_ids(
        &self,
        transaction_ids: Vec<i32>,
    ) -> Result<TransactionItems, Box<dyn Error>> {
        self.conn
            .select_transaction_items_by_transaction_ids_query(transaction_ids).await
    }

    pub async fn get_approvals_by_transaction_id(
        &self,
        transaction_id: i32,
    ) -> Result<Approvals, Box<dyn Error>> {
        self.conn
            .select_approvals_by_transaction_id_query(transaction_id).await
    }

    pub async fn get_approvals_by_transaction_ids(
        &self,
        transaction_ids: Vec<i32>,
    ) -> Result<Approvals, Box<dyn Error>> {
        self.conn
            .select_approvals_by_transaction_ids_query(transaction_ids).await
    }
}
