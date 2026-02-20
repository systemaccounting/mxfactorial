use auto_transact::{retry_post, RetryConfig};
use axum::{
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use httpclient::HttpClient;
use pg::postgres::DB;
use queue::Queue;
use shutdown::shutdown_signal;
use std::{env, net::ToSocketAddrs, sync::Arc, time::Duration};
use tokio::net::TcpListener;
use types::{request_response::IntraTransaction, transaction::Transaction};
use uribuilder::Uri;

const READINESS_CHECK_PATH: &str = "READINESS_CHECK_PATH";

fn retry_config(service_name: &str) -> RetryConfig {
    let max_retries: u32 = env::var("AUTO_TRANSACT_MAX_RETRIES")
        .unwrap_or("3".to_string())
        .parse()
        .unwrap_or(3);
    let delay_ms: u64 = env::var("AUTO_TRANSACT_RETRY_DELAY_MS")
        .unwrap_or("1000".to_string())
        .parse()
        .unwrap_or(1000);
    RetryConfig {
        max_retries,
        delay: Duration::from_millis(delay_ms),
        service_name: service_name.to_string(),
    }
}

async fn process_transaction(transaction: Transaction) -> Result<(), String> {
    let client = HttpClient::new();

    // forward to rule service
    let rule_uri = Uri::new_from_env_var("RULE_URL").to_string();
    let rule_body = serde_json::to_string(&transaction)
        .map_err(|e| format!("serialize for rule failed: {}", e))?;

    let rule_response = client
        .post(rule_uri, rule_body)
        .await
        .map_err(|e| format!("rule request failed: {:?}", e))?;

    let rule_text = rule_response
        .text()
        .await
        .map_err(|e| format!("rule response read failed: {}", e))?;

    let rule_applied: IntraTransaction = serde_json::from_str(&rule_text)
        .map_err(|e| format!("rule response parse failed: {}", e))?;

    tracing::info!("rule applied: {:#?}", rule_applied);

    // set auth_account from transaction author
    let mut rule_applied = rule_applied;
    rule_applied.auth_account = rule_applied.transaction.author.clone();

    // forward to request-create with retry
    let create_uri = Uri::new_from_env_var("REQUEST_CREATE_URL").to_string();
    let create_body = serde_json::to_string(&rule_applied)
        .map_err(|e| format!("serialize for request-create failed: {}", e))?;

    let config = retry_config("request-create");
    let result = retry_post(&config, || {
        let client = HttpClient::new();
        let uri = create_uri.clone();
        let body = create_body.clone();
        async move {
            let response = client
                .post(uri, body)
                .await
                .map_err(|e| -> Box<dyn std::error::Error + Send + Sync> { Box::new(e) })?;
            response
                .text()
                .await
                .map_err(|e| -> Box<dyn std::error::Error + Send + Sync> { Box::new(e) })
        }
    })
    .await;

    match result {
        Ok(text) => {
            tracing::info!("request-create response: {}", text);
            Ok(())
        }
        Err(e) => Err(format!("request-create failed: {:?}", e)),
    }
}

async fn handle_event(Json(transaction): Json<Transaction>) -> StatusCode {
    tracing::info!("received via http: {:#?}", transaction);
    match process_transaction(transaction).await {
        Ok(_) => StatusCode::OK,
        Err(e) => {
            tracing::error!("{}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

async fn handle_sqs_event(Json(event): Json<serde_json::Value>) -> StatusCode {
    let records = match event.get("Records").and_then(|r| r.as_array()) {
        Some(r) => r,
        None => {
            tracing::error!("missing Records in SQS event");
            return StatusCode::BAD_REQUEST;
        }
    };

    for record in records {
        let body = match record.get("body").and_then(|b| b.as_str()) {
            Some(b) => b,
            None => {
                tracing::error!("missing body in SQS record");
                continue;
            }
        };

        match serde_json::from_str::<Transaction>(body) {
            Ok(transaction) => {
                tracing::info!("received via sqs: {:#?}", transaction);
                if let Err(e) = process_transaction(transaction).await {
                    tracing::error!("{}", e);
                    return StatusCode::INTERNAL_SERVER_ERROR;
                }
            }
            Err(e) => {
                tracing::error!("failed to parse sqs body: {:?}", e);
            }
        }
    }

    StatusCode::OK
}

async fn queue_worker(queue: Arc<dyn Queue>) {
    tracing::info!("queue worker started");

    loop {
        match queue.receive().await {
            Ok(msg) => {
                tracing::info!("dequeued: {}", &msg.body[..80.min(msg.body.len())]);

                match serde_json::from_str::<Transaction>(&msg.body) {
                    Ok(transaction) => {
                        match process_transaction(transaction).await {
                            Ok(_) => {
                                if let Err(e) = queue.ack(&msg).await {
                                    tracing::error!("failed to ack message: {:?}", e);
                                }
                            }
                            Err(e) => {
                                tracing::error!("processing failed: {}", e);
                                // dont ack - message stays for retry
                            }
                        }
                    }
                    Err(e) => {
                        tracing::error!("failed to parse queue payload: {:?}", e);
                        // ack malformed payload to remove it
                        let _ = queue.ack(&msg).await;
                    }
                }
            }
            Err(queue::QueueError::NoMessage) => {
                // timeout, continue
            }
            Err(e) => {
                tracing::error!("queue receive error: {:?}", e);
                tokio::time::sleep(Duration::from_secs(1)).await;
            }
        }
    }
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let readiness_check_path = env::var(READINESS_CHECK_PATH)
        .unwrap_or_else(|_| panic!("{READINESS_CHECK_PATH} variable assignment"));

    let conn_uri = DB::create_conn_uri_from_env_vars();
    let pool = DB::new_pool(&conn_uri).await;

    // spawn queue worker when queue backend available
    // in lambda, SQS triggers the function directly via event source mapping
    if env::var("AWS_LAMBDA_FUNCTION_NAME").is_err() {
        if let Some(q) = queue::new().await {
            tokio::spawn(async move {
                queue_worker(q).await;
            });
        }
    }

    let app = Router::new()
        .route("/", post(handle_event))
        .route("/events", post(handle_sqs_event))
        .route(
            readiness_check_path.as_str(),
            get(|| async { StatusCode::OK }),
        )
        .with_state(pool);

    let hostname_or_ip = env::var("HOSTNAME_OR_IP").unwrap_or("0.0.0.0".to_string());
    let port = env::var("AUTO_TRANSACT_PORT").unwrap();
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
