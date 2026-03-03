use axum::{
    extract::{Json, State},
    http::StatusCode,
    routing::{get, post},
    Router,
};
use pg::postgres::{ConnectionPool, DB};
use service::Service;
use shutdown::shutdown_signal;
use std::net::ToSocketAddrs;
use tokio::net::TcpListener;
use types::request_response::{IntraTransaction, QueryById};

// used by lambda to test for service availability
const READINESS_CHECK_PATH: &str = "READINESS_CHECK_PATH";

async fn handle_event(
    State(pool): State<ConnectionPool>,
    event: Json<QueryById>,
) -> Result<axum::Json<IntraTransaction>, StatusCode> {
    let client_request = event.0;

    let conn = pool
        .get_conn()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let svc = Service::new(&conn, None);

    let request_id = client_request.id.parse::<i32>().unwrap();

    let approvals = svc
        .get_approvals_by_transaction_id(request_id)
        .await
        .map_err(|e| {
            tracing::error!("error: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if approvals
        .clone()
        .0
        .into_iter()
        .filter(|a| a.account_name == client_request.auth_account && a.approval_time.is_none())
        .count()
        == 0
    {
        tracing::error!("transaction request not found");
        return Err(StatusCode::BAD_REQUEST);
    }

    let transaction_items = svc
        .get_transaction_items_by_transaction_id(request_id)
        .await
        .map_err(|e| {
            tracing::error!("error: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let mut transaction_request = svc.get_transaction_by_id(request_id).await.map_err(|e| {
        tracing::error!("error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    transaction_request
        .build(transaction_items, approvals)
        .unwrap();

    let intra_transaction_request =
        IntraTransaction::new(client_request.auth_account, transaction_request);

    Ok(axum::Json(intra_transaction_request))
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let readiness_check_path = envvar::required(READINESS_CHECK_PATH).unwrap();

    let conn_uri = DB::create_conn_uri_from_env_vars();

    let pool = DB::new_pool(&conn_uri).await;

    let app = Router::new()
        .route("/", post(handle_event))
        .route(
            readiness_check_path.as_str(),
            get(|| async { StatusCode::OK }),
        )
        .with_state(pool);

    let hostname_or_ip = envvar::optional("HOSTNAME_OR_IP", "0.0.0.0");

    let port = envvar::required("REQUEST_BY_ID_PORT").unwrap();

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
