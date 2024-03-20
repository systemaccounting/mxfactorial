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
use types::request_response::{IntraTransaction, RequestApprove};

// used by lambda to test for service availability
const READINESS_CHECK_PATH: &str = "READINESS_CHECK_PATH";

async fn handle_event(
    State(pool): State<ConnectionPool>,
    event: Json<RequestApprove>,
) -> Result<axum::Json<IntraTransaction>, StatusCode> {
    let client_request = event.0;

    let svc = Service::new(pool.get_conn().await);

    let request_id = client_request.id.parse::<i32>().unwrap();

    let transaction_request = svc.get_transaction_by_id(request_id).await.map_err(|e| {
        tracing::error!("error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    if transaction_request.equilibrium_time.is_some() {
        println!("transaction previously approved");
        return Err(StatusCode::BAD_REQUEST);
    }

    let auth_account = client_request.auth_account;
    let approver_role = client_request.account_role;

    let approved_transaction_request = svc
        .approve(auth_account, approver_role, transaction_request)
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

    let port = env::var("REQUEST_APPROVE_PORT").unwrap_or("10003".to_string());

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
