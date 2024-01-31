use ::types::{
    request_response::{IntraTransaction, IntraTransactions},
    time::TZTime,
    transaction::Transaction,
    transaction_item::{TransactionItem, TransactionItems},
};
use gql_client::Client as GqlClient;
use httpclient::HttpClient as Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::env;

const GRAPHQL_RESOURCE: &str = "query";

#[derive(Debug, Deserialize)]
struct BalanceResponse {
    balance: String,
}

#[derive(Debug, Serialize)]
struct BalanceVars {
    account_name: String,
    auth_account: String,
}

pub async fn get_balance_gql(
    account_name: String,
    auth_account: String,
) -> Result<String, Box<dyn std::error::Error>> {
    let uri = format!(
        "{}/{}",
        std::env::var("GRAPHQL_URI").unwrap(),
        GRAPHQL_RESOURCE
    );
    let query = r#"query getBalance($account_name: String!, $auth_account: String!) {
        balance(account_name: $account_name, auth_account: $auth_account)
      }"#;
    let variables = BalanceVars {
        account_name,
        auth_account,
    };
    let client = GqlClient::new(uri);
    let res = client
        .query_with_vars::<BalanceResponse, BalanceVars>(query, variables)
        .await
        .unwrap()
        .unwrap();
    Ok(res.balance)
}

#[derive(Debug, Deserialize)]
struct RuleResponse {
    rules: Transaction,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TransactionItemInput {
    pub id: Option<String>,
    pub transaction_id: Option<String>,
    pub item_id: String,
    pub price: String,
    pub quantity: String,
    pub debitor_first: Option<bool>,
    pub rule_instance_id: Option<String>,
    pub rule_exec_ids: Option<Vec<String>>,
    pub unit_of_measurement: Option<String>,
    pub units_measured: Option<String>,
    pub debitor: String,
    pub creditor: String,
    pub debitor_profile_id: Option<String>,
    pub creditor_profile_id: Option<String>,
    pub debitor_approval_time: Option<TZTime>,
    pub creditor_approval_time: Option<TZTime>,
    pub debitor_rejection_time: Option<TZTime>,
    pub creditor_rejection_time: Option<TZTime>,
    pub debitor_expiration_time: Option<TZTime>,
    pub creditor_expiration_time: Option<TZTime>,
}

impl From<TransactionItem> for TransactionItemInput {
    fn from(item: TransactionItem) -> Self {
        TransactionItemInput {
            id: item.id,
            transaction_id: item.transaction_id,
            item_id: item.item_id,
            price: item.price,
            quantity: item.quantity,
            debitor_first: item.debitor_first,
            rule_instance_id: item.rule_instance_id,
            rule_exec_ids: item.rule_exec_ids,
            unit_of_measurement: item.unit_of_measurement,
            units_measured: item.units_measured,
            debitor: item.debitor,
            creditor: item.creditor,
            debitor_profile_id: item.debitor_profile_id,
            creditor_profile_id: item.creditor_profile_id,
            debitor_approval_time: item.debitor_approval_time,
            creditor_approval_time: item.creditor_approval_time,
            debitor_rejection_time: item.debitor_rejection_time,
            creditor_rejection_time: item.creditor_rejection_time,
            debitor_expiration_time: item.debitor_expiration_time,
            creditor_expiration_time: item.creditor_expiration_time,
        }
    }
}

fn convert_to_input_vec(transaction_items: Vec<TransactionItem>) -> Vec<TransactionItemInput> {
    let mut tr_item_input_vec: Vec<TransactionItemInput> = vec![];

    for tr_item in transaction_items {
        tr_item_input_vec.push(TransactionItemInput::from(tr_item));
    }

    tr_item_input_vec
}

#[derive(Debug, Serialize)]
struct RuleVars {
    transaction_items: Vec<TransactionItemInput>,
}

pub async fn get_rules_gql(
    transaction_items: Vec<TransactionItem>,
) -> Result<Transaction, Box<dyn std::error::Error>> {
    let uri = format!(
        "{}/{}",
        std::env::var("GRAPHQL_URI").unwrap(),
        GRAPHQL_RESOURCE
    );
    let query = r#"query getRules($transaction_items: [TransactionItemInput!]) {
        rules(transaction_items: $transaction_items) {
          id
          rule_instance_id
          author
          author_device_id
          author_device_latlng
          author_role
          sum_value
          transaction_items {
              id
              transaction_id
              item_id
              price
              quantity
              debitor_first
              rule_instance_id
              unit_of_measurement
              units_measured
              debitor
              creditor
              debitor_profile_id
              creditor_profile_id
              debitor_approval_time
              creditor_approval_time
              debitor_expiration_time
              creditor_expiration_time
              debitor_rejection_time
              creditor_rejection_time
          }
        }
      }"#;
    let variables = RuleVars {
        transaction_items: convert_to_input_vec(transaction_items),
    };
    let client = GqlClient::new(uri);
    let res = client
        .query_with_vars::<RuleResponse, RuleVars>(query, variables)
        .await // cadet todo: handle error
        .unwrap()
        .unwrap();
    Ok(res.rules)
}

#[derive(Debug, Serialize)]
struct CreateRequestVars {
    auth_account: String,
    transaction_items: Vec<TransactionItemInput>,
}

#[derive(Debug, Deserialize)]
struct CreateRequestResponse {
    #[serde(rename = "createRequest")]
    create_request: Transaction,
}

pub async fn create_request_gql(
    auth_account: String,
    transaction_items: Vec<TransactionItem>,
) -> Transaction {
    let uri = format!(
        "{}/{}",
        std::env::var("GRAPHQL_URI").unwrap(),
        GRAPHQL_RESOURCE
    );
    let query = r#"mutation createRequest($transaction_items: [TransactionItemInput!], $auth_account: String!) {
        createRequest(transaction_items: $transaction_items, auth_account: $auth_account) {
          id
          rule_instance_id
          author
          author_device_id
          author_device_latlng
          author_role
          sum_value
          transaction_items {
              id
              transaction_id
              item_id
              price
              rule_exec_ids
              quantity
              debitor_first
              rule_instance_id
              unit_of_measurement
              units_measured
              debitor
              creditor
              debitor_profile_id
              creditor_profile_id
              debitor_approval_time
              creditor_approval_time
              debitor_expiration_time
              creditor_expiration_time
              debitor_rejection_time
              creditor_rejection_time
          }
        }
      }"#;
    let variables = CreateRequestVars {
        auth_account,
        transaction_items: convert_to_input_vec(transaction_items),
    };
    let client = GqlClient::new(uri);
    let res = client
        .query_with_vars::<CreateRequestResponse, CreateRequestVars>(query, variables)
        .await // cadet todo: handle error
        .unwrap()
        .unwrap();
    res.create_request
}

#[derive(Debug, Serialize)]
struct ApproveRequestVars {
    id: String,
    account_name: String,
    account_role: String,
    auth_account: String,
}

#[derive(Debug, Deserialize)]
struct ApproveRequestResponse {
    #[serde(rename = "approveRequest")]
    approve_request: Transaction,
}

pub async fn approve_request_gql(
    id: String,
    account_name: String,
    account_role: String,
    auth_account: String,
) -> Transaction {
    let uri = format!(
        "{}/{}",
        std::env::var("GRAPHQL_URI").unwrap(),
        GRAPHQL_RESOURCE
    );
    let mutation = r#"mutation approveRequest($id: String!, $account_name: String!, $account_role: String!, $auth_account: String!) {
        approveRequest(id: $id, account_name: $account_name, account_role: $account_role, auth_account: $auth_account) {
          id
          rule_instance_id
          author
          author_device_id
          author_device_latlng
          author_role
          equilibrium_time
          sum_value
          transaction_items {
              id
              transaction_id
              item_id
              price
              quantity
              debitor_first
              rule_instance_id
              unit_of_measurement
              units_measured
              debitor
              creditor
              debitor_profile_id
              creditor_profile_id
              debitor_approval_time
              creditor_approval_time
              debitor_expiration_time
              creditor_expiration_time
              debitor_rejection_time
              creditor_rejection_time
          }
        }
      }
    "#;
    let variables = ApproveRequestVars {
        id,
        account_name,
        account_role,
        auth_account,
    };
    let client = GqlClient::new(uri);
    let res = client
        .query_with_vars::<ApproveRequestResponse, ApproveRequestVars>(mutation, variables)
        .await // cadet todo: handle error
        .unwrap()
        .unwrap();
    res.approve_request
}

#[derive(Debug, Serialize)]
struct TransactionsByAccountVars {
    auth_account: String,
    account_name: String,
}

#[derive(Debug, Deserialize)]
struct TransactionsByAccountResponse {
    #[serde(rename = "transactionsByAccount")]
    transactions_by_account: Vec<Transaction>,
}

pub async fn get_transactions_by_account_gql(
    auth_account: String,
    account_name: String,
) -> Vec<Transaction> {
    let uri = format!(
        "{}/{}",
        std::env::var("GRAPHQL_URI").unwrap(),
        GRAPHQL_RESOURCE
    );
    let query = r#"query getTransactionsByAccount($account_name: String!, $auth_account: String!) {
        transactionsByAccount(account_name: $account_name, auth_account: $auth_account) {
          id
          rule_instance_id
          author
          author_device_id
          author_device_latlng
          author_role
          sum_value
          equilibrium_time
          transaction_items {
              id
              transaction_id
              item_id
              price
              quantity
              debitor_first
              rule_instance_id
              unit_of_measurement
              units_measured
              debitor
              creditor
              debitor_profile_id
              creditor_profile_id
              debitor_approval_time
              creditor_approval_time
              debitor_expiration_time
              creditor_expiration_time
              debitor_rejection_time
              creditor_rejection_time
          }
        }
      }
    "#;
    let variables = TransactionsByAccountVars {
        auth_account,
        account_name,
    };
    let client = GqlClient::new(uri);
    let res = client
        .query_with_vars::<TransactionsByAccountResponse, TransactionsByAccountVars>(
            query, variables,
        )
        .await // cadet todo: handle error
        .unwrap()
        .unwrap();
    res.transactions_by_account
}

#[derive(Debug, Serialize)]
struct TransactionByIDVars {
    auth_account: String,
    account_name: String,
    id: String,
}

#[derive(Debug, Deserialize)]
struct TransactionByIDResponse {
    #[serde(rename = "transactionByID")]
    transaction_by_id: Transaction,
}

pub async fn get_transaction_by_id_gql(
    auth_account: String,
    account_name: String,
    id: String,
) -> Transaction {
    let uri = format!(
        "{}/{}",
        std::env::var("GRAPHQL_URI").unwrap(),
        GRAPHQL_RESOURCE
    );
    let query = r#"query getTransactionByID($id: String!, $account_name: String!, $auth_account: String!) {
        transactionByID(id: $id, account_name: $account_name, auth_account: $auth_account) {
          id
          rule_instance_id
          equilibrium_time
          author
          author_device_id
          author_device_latlng
          author_role
          sum_value
          transaction_items {
              id
              transaction_id
              item_id
              price
              quantity
              debitor_first
              rule_instance_id
              unit_of_measurement
              units_measured
              debitor
              creditor
              debitor_profile_id
              creditor_profile_id
              debitor_approval_time
              creditor_approval_time
              debitor_expiration_time
              creditor_expiration_time
              debitor_rejection_time
              creditor_rejection_time
          }
        }
      }"#;
    let variables = TransactionByIDVars {
        auth_account,
        account_name,
        id,
    };
    let client = GqlClient::new(uri);
    let res = client
        .query_with_vars::<TransactionByIDResponse, TransactionByIDVars>(query, variables)
        .await // cadet todo: handle error
        .unwrap()
        .unwrap();
    res.transaction_by_id
}

#[derive(Debug, Serialize)]
struct RequestsByAccountVars {
    auth_account: String,
    account_name: String,
}

#[derive(Debug, Deserialize)]
struct RequestsByAccountResponse {
    #[serde(rename = "requestsByAccount")]
    requests_by_account: Vec<Transaction>,
}

pub async fn get_requests_by_account_gql(
    auth_account: String,
    account_name: String,
) -> Vec<Transaction> {
    let uri = format!(
        "{}/{}",
        std::env::var("GRAPHQL_URI").unwrap(),
        GRAPHQL_RESOURCE
    );
    let query = r#"query getRequestsByAccount($account_name: String!, $auth_account: String!) {
        requestsByAccount(account_name: $account_name, auth_account: $auth_account) {
          id
          rule_instance_id
          author
          author_device_id
          author_device_latlng
          author_role
          sum_value
          transaction_items {
              id
              transaction_id
              item_id
              price
              quantity
              debitor_first
              rule_instance_id
              unit_of_measurement
              units_measured
              debitor
              creditor
              debitor_profile_id
              creditor_profile_id
              debitor_approval_time
              creditor_approval_time
              debitor_expiration_time
              creditor_expiration_time
              debitor_rejection_time
              creditor_rejection_time
          }
        }
      }
    "#;
    let variables = RequestsByAccountVars {
        auth_account,
        account_name,
    };
    let client = GqlClient::new(uri);
    let res = client
        .query_with_vars::<RequestsByAccountResponse, RequestsByAccountVars>(query, variables)
        .await // cadet todo: handle error
        .unwrap()
        .unwrap();
    res.requests_by_account
}

#[derive(Debug, Serialize)]
struct RequestByIDVars {
    auth_account: String,
    account_name: String,
    id: String,
}

#[derive(Debug, Deserialize)]
struct RequestByIDResponse {
    #[serde(rename = "requestByID")]
    request_by_id: Transaction,
}

pub async fn get_request_by_id_gql(
    auth_account: String,
    account_name: String,
    id: String,
) -> Transaction {
    let uri = format!(
        "{}/{}",
        std::env::var("GRAPHQL_URI").unwrap(),
        GRAPHQL_RESOURCE
    );
    let query = r#"query getRequestByID($id: String!, $account_name: String!, $auth_account: String!) {
        requestByID(id: $id, account_name: $account_name, auth_account: $auth_account) {
          id
          rule_instance_id
          author
          author_device_id
          author_device_latlng
          author_role
          sum_value
          transaction_items {
              id
              transaction_id
              item_id
              price
              quantity
              debitor_first
              rule_instance_id
              unit_of_measurement
              units_measured
              debitor
              creditor
              debitor_profile_id
              creditor_profile_id
              debitor_approval_time
              creditor_approval_time
              debitor_expiration_time
              creditor_expiration_time
              debitor_rejection_time
              creditor_rejection_time
          }
        }
      }"#;
    let variables = RequestByIDVars {
        auth_account,
        account_name,
        id,
    };
    let client = GqlClient::new(uri);
    let res = client
        .query_with_vars::<RequestByIDResponse, RequestByIDVars>(query, variables)
        .await // cadet todo: handle error
        .unwrap()
        .unwrap();
    res.request_by_id
}

pub async fn get_rules_http(transaction_items: Vec<TransactionItem>) -> IntraTransaction {
    let client = Client::new();
    let uri = env::var("RULE_URL").unwrap();
    let body_json = json!(transaction_items).to_string();
    let response = client.post(uri, body_json).await.unwrap();
    let response_string = response.text().await.unwrap();
    serde_json::from_str(&response_string).unwrap()
}

pub async fn create_request_http(
    auth_account: String,
    transaction_items: TransactionItems,
) -> Transaction {
    let body = IntraTransaction::new(
        auth_account.clone(),
        Transaction::new(auth_account, transaction_items),
    );
    let body_json = json!(body).to_string();
    let client = Client::new();
    let uri = env::var("REQUEST_CREATE_URL").unwrap();
    let response = client.post(uri, body_json).await.unwrap();
    let response_string = response.text().await.unwrap();
    let transaction_request: IntraTransaction = serde_json::from_str(&response_string).unwrap();
    transaction_request.transaction
}

pub async fn approve_request_http(
    id: String,
    account_name: String,
    account_role: String,
    auth_account: String,
) -> Transaction {
    let body_json = json!({
        "id": id,
        "account_name": account_name,
        "account_role": account_role,
        "auth_account": auth_account
    })
    .to_string();
    let client = Client::new();
    let uri = env::var("REQUEST_APPROVE_URL").unwrap();
    let response = client.post(uri, body_json).await.unwrap();
    let response_string = response.text().await.unwrap();
    let approved: IntraTransaction = serde_json::from_str(&response_string).unwrap();
    approved.transaction
}

pub async fn get_account_balance_http(account_name: String, auth_account: String) -> String {
    let body_json = json!({
        "account_name": account_name,
        "auth_account": auth_account
    })
    .to_string();
    let client = Client::new();
    let uri = env::var("BALANCE_BY_ACCOUNT_URL").unwrap();
    let response = client.post(uri, body_json).await.unwrap();
    let response_string = response.text().await.unwrap();
    let balance_float: f32 = serde_json::from_str(&response_string).unwrap();
    format!("{:.3}", balance_float)
}

pub async fn get_transaction_by_id_http(
    auth_account: String,
    account_name: String,
    id: String,
) -> IntraTransaction {
    let body_json = json!({
        "auth_account": auth_account,
        "account_name": account_name,
        "id": id
    })
    .to_string();
    let client = Client::new();
    let uri = env::var("TRANSACTION_BY_ID_URL").unwrap();
    let response = client.post(uri, body_json).await.unwrap();
    let response_string = response.text().await.unwrap();
    let intra_transaction: IntraTransaction = serde_json::from_str(&response_string).unwrap();
    intra_transaction
}

pub async fn get_transactions_by_account_http(
    auth_account: String,
    account_name: String,
) -> IntraTransactions {
    let body_json = json!({
        "auth_account": auth_account,
        "account_name": account_name
    })
    .to_string();
    let client = Client::new();
    let uri = env::var("TRANSACTIONS_BY_ACCOUNT_URL").unwrap();
    let response = client.post(uri, body_json).await.unwrap();
    let response_string = response.text().await.unwrap();
    let intra_transactions: IntraTransactions = serde_json::from_str(&response_string).unwrap();
    intra_transactions
}

pub async fn get_request_by_id_http(
    auth_account: String,
    account_name: String,
    id: String,
) -> IntraTransaction {
    let body_json = json!({
        "auth_account": auth_account,
        "account_name": account_name,
        "id": id
    })
    .to_string();
    let client = Client::new();
    let uri = env::var("REQUEST_BY_ID_URL").unwrap();
    let response = client.post(uri, body_json).await.unwrap();
    let response_string = response.text().await.unwrap();
    let intra_transaction: IntraTransaction = serde_json::from_str(&response_string).unwrap();
    intra_transaction
}

pub async fn get_requests_by_account_http(
    auth_account: String,
    account_name: String,
) -> IntraTransactions {
    let body_json = json!({
        "auth_account": auth_account,
        "account_name": account_name
    })
    .to_string();
    let client = Client::new();
    let uri = env::var("REQUESTS_BY_ACCOUNT_URL").unwrap();
    let response = client.post(uri, body_json).await.unwrap();
    let response_string = response.text().await.unwrap();
    let intra_transactions: IntraTransactions = serde_json::from_str(&response_string).unwrap();
    intra_transactions
}
