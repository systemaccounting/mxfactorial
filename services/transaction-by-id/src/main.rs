use axum::{
    extract::{Json, State},
    http::StatusCode,
    routing::{get, post},
    Router,
};
use pg::postgres::{ConnectionPool, DB};
use service::Service;
use shutdown::shutdown_signal;
use std::{env, net::ToSocketAddrs};
use tokio::net::TcpListener;
use types::request_response::{IntraTransaction, QueryById};

// used by lambda to test for service availability
const READINESS_CHECK_PATH: &str = "READINESS_CHECK_PATH";

async fn handle_event(
    State(pool): State<ConnectionPool>,
    event: Json<QueryById>,
) -> Result<axum::Json<IntraTransaction>, StatusCode> {
    let client_request = event.0;

    let svc = Service::new(pool.get_conn().await);

    let transaction_id = client_request.id.parse::<i32>().unwrap();

    let approvals = svc
        .get_approvals_by_transaction_id(transaction_id)
        .await
        .map_err(|e| {
            tracing::error!("error: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    // test for account in approvals
    if approvals
        .clone()
        .0
        .into_iter()
        .filter(|a| a.account_name == client_request.auth_account)
        .count()
        == 0
    {
        tracing::error!("transaction not found");
        return Err(StatusCode::BAD_REQUEST);
    }

    // test for missing approval times
    if approvals
        .clone()
        .0
        .into_iter()
        .filter(|a| a.approval_time.is_none())
        .count()
        > 0
    {
        tracing::error!("transaction not found");
        return Err(StatusCode::BAD_REQUEST);
    }

    let transaction_items = svc
        .get_transaction_items_by_transaction_id(transaction_id)
        .await
        .map_err(|e| {
            tracing::error!("error: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let mut transaction = svc
        .get_transaction_by_id(transaction_id)
        .await
        .map_err(|e| {
            tracing::error!("error: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    transaction.build(transaction_items, approvals).unwrap();

    let intra_transaction_request = IntraTransaction::new(client_request.auth_account, transaction);

    Ok(axum::Json(intra_transaction_request))
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

    let port = env::var("TRANSACTION_BY_ID_PORT").unwrap_or("10007".to_string());

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
