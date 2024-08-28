use axum::{
    extract::{Json, State},
    http::StatusCode,
    routing::{get, post},
    Router,
};
use httpclient::HttpClient as Client;
use pg::postgres::{ConnectionPool, DatabaseConnection, DB};
use service::Service;
use shutdown::shutdown_signal;
use std::{env, error::Error, net::ToSocketAddrs};
use thiserror::Error;
use tokio::net::TcpListener;
use types::{
    request_response::IntraTransaction, transaction::Transaction,
    transaction_item::TransactionItems,
};

// used by lambda to test for service availability
const READINESS_CHECK_PATH: &str = "READINESS_CHECK_PATH";

#[derive(Error, Debug)]
enum RequestCreateError {
    #[error("missing auth account in request")]
    MissingAuthAccount,
    #[error("missing author in request")]
    MissingAuthor,
    #[error("missing author role in request")]
    MissingAuthorRole,
    #[error("sum_value failure")]
    SumValueFailure,
    #[error("missing debitor_first values in request")]
    MissingDebitorFirstValues,
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

async fn test_values(req: IntraTransaction) -> Result<IntraTransaction, Box<dyn Error>> {
    if req.auth_account.is_none() {
        return Err(Box::new(RequestCreateError::MissingAuthAccount));
    }

    if req.transaction.author.is_none() {
        return Err(Box::new(RequestCreateError::MissingAuthor));
    }

    if req.transaction.author_role.is_none() {
        return Err(Box::new(RequestCreateError::MissingAuthorRole));
    }

    if req.transaction.test_sum_value().is_err() {
        return Err(Box::new(RequestCreateError::SumValueFailure));
    }

    if req
        .clone()
        .transaction
        .transaction_items
        .into_iter()
        .any(|item| item.debitor_first.is_none())
    {
        return Err(Box::new(RequestCreateError::MissingDebitorFirstValues));
    }

    let non_rule_client_tr_items = req
        .transaction
        .transaction_items
        .remove_unauthorized_values()
        .filter_user_added();

    let rule_tested = get_rule_applied_transaction(non_rule_client_tr_items.clone())
        .await
        .unwrap();

    match rule_tested
        .transaction
        .transaction_items
        .test_equality(req.clone().transaction.transaction_items)
    {
        Ok(_) => {
            // println!("client request equal to rule response")
        }
        Err(e) => {
            return Err(Box::new(e));
        }
    }

    let mut response = req.clone();
    response.add_rule_tested_values(rule_tested);

    Ok(response)
}

async fn create_request<'a>(
    rule_tested: IntraTransaction,
    svc: &Service<'a, DatabaseConnection>,
) -> Result<Transaction, RequestCreateError> {
    let accounts = rule_tested.transaction.transaction_items.list_accounts();

    let profile_ids = svc
        .get_profile_ids_by_account_names(accounts)
        .await
        .unwrap();

    let mut transaction_request = rule_tested.transaction.clone();

    transaction_request
        .transaction_items
        .add_profile_ids(profile_ids);

    let transaction_id = svc.create_transaction(transaction_request).await.unwrap();

    let id = transaction_id.parse::<i32>().unwrap();

    let inserted_transaction_request = svc.get_full_transaction_by_id(id).await.unwrap();

    Ok(inserted_transaction_request)
}

async fn handle_event(
    State(pool): State<ConnectionPool>,
    intra_transaction: Json<IntraTransaction>,
) -> Result<axum::Json<IntraTransaction>, StatusCode> {
    let request = intra_transaction.0;

    let rule_tested = test_values(request)
        .await
        .map_err(|_e| {
            println!("error: {:?}", _e);
            StatusCode::INTERNAL_SERVER_ERROR
        })
        .unwrap();

    let conn = pool.get_conn().await;

    let svc = Service::new(&conn);

    let inserted_transaction_request = create_request(rule_tested.clone(), &svc)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // auth_account and approver_role are different on request-approve
    let auth_account = rule_tested.clone().auth_account.unwrap();
    let approver_role = rule_tested.transaction.author_role.unwrap();

    let conn = pool.get_conn().await;

    let svc = Service::new(&conn);

    let approved_transaction_request = svc
        .approve(auth_account, approver_role, inserted_transaction_request)
        .await
        .unwrap(); // todo: handle error

    Ok(axum::Json(approved_transaction_request))
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let readiness_check_path = env::var(READINESS_CHECK_PATH)
        .unwrap_or_else(|_| panic!("{READINESS_CHECK_PATH} variable assignment"));

    let conn_uri = DB::create_conn_uri_from_env_vars();

    let pool = DB::new_pool(&conn_uri).await;

    let app = Router::new()
        .route("/", post(handle_event))
        .route(
            readiness_check_path.as_str(),
            get(|| async { StatusCode::OK }),
        )
        .with_state(pool);

    let hostname_or_ip = env::var("HOSTNAME_OR_IP").unwrap_or("0.0.0.0".to_string());

    let port = env::var("REQUEST_CREATE_PORT").unwrap();

    let serve_addr = format!("{hostname_or_ip}:{port}");

    let mut addrs_iter = serve_addr.to_socket_addrs().unwrap_or(
        format!("{hostname_or_ip}:{port}")
            .to_socket_addrs()
            .unwrap(),
    );

    let addr = addrs_iter.next().unwrap();

    tracing::info!("listening on {}", addr);

    axum::serve(TcpListener::bind(addr).await.unwrap(), app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}
