use axum::{
    extract::{Json, State},
    http::StatusCode,
    routing::{get, post},
    Router,
};
use cache::Cache;
use httpclient::HttpClient as Client;
use pg::postgres::{ConnectionPool, DatabaseConnection, DB};
use service::{Service, ServiceError};
use shutdown::shutdown_signal;
use std::{error::Error, net::ToSocketAddrs, sync::Arc};
use thiserror::Error;
use tokio::net::TcpListener;
use types::{request_response::IntraTransaction, transaction::Transaction};
use uribuilder::Uri;

#[derive(Clone)]
struct Store {
    pool: ConnectionPool,
    cache: Option<Arc<dyn Cache>>,
}

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
}

pub async fn get_rule_applied_transaction(
    transaction: Transaction,
) -> Result<IntraTransaction, Box<dyn Error>> {
    let uri = Uri::new_from_env_var("RULE_URL").to_string();
    let client = Client::new();
    let body = serde_json::to_string(&transaction)?;
    let rule_tested = client.post(uri, body).await?;
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

    let non_rule_client_tr_items = req
        .transaction
        .transaction_items
        .remove_unauthorized_values()
        .filter_user_added();

    // build transaction with author fields for rule service
    let rule_input_transaction = Transaction {
        id: None,
        rule_instance_id: req.transaction.rule_instance_id.clone(),
        author: req.transaction.author.clone(),
        author_device_id: req.transaction.author_device_id.clone(),
        author_device_latlng: req.transaction.author_device_latlng.clone(),
        author_role: req.transaction.author_role,
        equilibrium_time: None,
        event_time: None,
        debitor_first: req.transaction.debitor_first,
        sum_value: non_rule_client_tr_items.sum_value(),
        transaction_items: non_rule_client_tr_items.clone(),
    };

    let rule_tested = get_rule_applied_transaction(rule_input_transaction).await?;

    rule_tested
        .transaction
        .transaction_items
        .test_equality(req.clone().transaction.transaction_items)?;

    let mut response = req.clone();
    response.add_rule_tested_values(rule_tested);

    Ok(response)
}

async fn create_request(
    rule_tested: IntraTransaction,
    svc: &Service<'_, DatabaseConnection>,
) -> Result<Transaction, Box<dyn Error>> {
    let accounts = rule_tested.transaction.transaction_items.list_accounts();

    let profile_ids = svc.get_profile_ids_by_account_names(accounts).await?;

    let mut transaction_request = rule_tested.transaction.clone();

    transaction_request
        .transaction_items
        .add_profile_ids(profile_ids);

    let transaction_id = svc.create_transaction(transaction_request).await?;

    let id = transaction_id
        .parse::<i32>()
        .map_err(|e| format!("invalid transaction id: {e}"))?;

    let inserted_transaction_request = svc.get_full_transaction_by_id(id).await?;

    Ok(inserted_transaction_request)
}

async fn handle_event(
    State(store): State<Store>,
    intra_transaction: Json<IntraTransaction>,
) -> Result<axum::Json<IntraTransaction>, ServiceError> {
    let request = intra_transaction.0;

    let rule_tested = test_values(request)
        .await
        .map_err(|e| ServiceError::bad_request(&e.to_string()))?;

    let conn = store
        .pool
        .get_conn()
        .await
        .map_err(|_| ServiceError::internal("failed to get db connection"))?;

    let svc = Service::new(&conn, store.cache.clone());

    let inserted_transaction_request = create_request(rule_tested.clone(), &svc)
        .await
        .map_err(|e| ServiceError::internal(&e.to_string()))?;

    // auth_account and approver_role are different on request-approve
    let auth_account = rule_tested
        .clone()
        .auth_account
        .ok_or_else(|| ServiceError::bad_request("missing auth account"))?;
    let approver_role = rule_tested
        .transaction
        .author_role
        .ok_or_else(|| ServiceError::bad_request("missing author role"))?;

    let conn = store
        .pool
        .get_conn()
        .await
        .map_err(|_| ServiceError::internal("failed to get db connection"))?;

    let svc = Service::new(&conn, store.cache.clone());

    let approved_transaction_request = svc
        .approve(auth_account, approver_role, inserted_transaction_request)
        .await
        .map_err(|e| ServiceError::internal(&e.to_string()))?;

    Ok(axum::Json(approved_transaction_request))
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let readiness_check_path = envvar::required(READINESS_CHECK_PATH).unwrap();

    let conn_uri = DB::create_conn_uri_from_env_vars();

    let pool = DB::new_pool(&conn_uri).await;

    let cache = cache::new().await;

    let store = Store { pool, cache };

    let app = Router::new()
        .route("/", post(handle_event))
        .route(
            readiness_check_path.as_str(),
            get(|| async { StatusCode::OK }),
        )
        .with_state(store);

    let hostname_or_ip = envvar::optional("HOSTNAME_OR_IP", "0.0.0.0");

    let port = envvar::required("REQUEST_CREATE_PORT").unwrap();

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
