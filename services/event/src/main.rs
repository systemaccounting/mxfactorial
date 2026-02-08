use futures_channel::mpsc;
use futures_util::{stream, FutureExt, StreamExt, TryStreamExt};
use pg::postgres::DB;
use redisclient::RedisClient;
use std::env;
use tokio_postgres::{AsyncMessage, NoTls};
mod events;

fn pg_conn_uri() -> String {
    let pguser = std::env::var("PGUSER").unwrap();
    let pgpassword = std::env::var("PGPASSWORD").unwrap();
    let pghost = std::env::var("PGHOST").unwrap();
    let pgport = std::env::var("PGPORT").unwrap();
    let pgdatabase = std::env::var("PGDATABASE").unwrap();
    let uri = format!("postgresql://{pguser}:{pgpassword}@{pghost}:{pgport}/{pgdatabase}");
    uri
}

#[tokio::main]
async fn main() {
    if let Ok(level) = env::var("RUST_LOG") {
        tracing_subscriber::fmt().with_env_filter(level).init();
    } else {
        tracing_subscriber::fmt().init();
    }

    let pg_uri = pg_conn_uri();
    let redis_client = RedisClient::new().await;

    loop {
        match redis_client.init().await {
            Ok(_) => {
                tracing::info!("event connected to redis");
                break;
            }
            Err(_e) => {
                tracing::info!("failed to connect to redis: {}", _e);
                tokio::time::sleep(std::time::Duration::from_secs(5)).await;
            }
        }
    }

    // connection pool for querying transaction data
    let pool = DB::new_pool(&pg_uri).await;

    loop {
        let (client, mut connection) = match tokio_postgres::connect(pg_uri.as_str(), NoTls).await {
            Ok(conn) => conn,
            Err(_e) => {
                tracing::info!("failed to connect to postgres: {}", _e);
                tokio::time::sleep(std::time::Duration::from_secs(5)).await;
                continue;
            }
        };

        let (tx, mut rx) = mpsc::unbounded();

        let stream =
            stream::poll_fn(move |cx| connection.poll_message(cx)).map_err(|e| panic!("{}", e));
        let connection = stream.forward(tx).map(|r| r.unwrap());
        let handler = tokio::spawn(connection);

        if let Err(e) = client.batch_execute("LISTEN equilibrium;").await {
            tracing::info!("failed to execute LISTEN command: {}", e);
            handler.abort();
            continue;
        }

        loop {
            let message = match rx.next().await {
                Some(message) => message,
                None => {
                    tracing::info!("connection terminated. attempting to reconnect...");
                    handler.abort();
                    break;
                }
            };

            match message {
                AsyncMessage::Notification(n) => {
                    let transaction_id = n.payload();
                    if let Err(e) = events::handle_gdp(&pool, &redis_client, transaction_id).await {
                        tracing::error!("gdp handler error: {}", e);
                    }
                    if let Err(e) =
                        events::handle_threshold_profit(&pool, &redis_client, transaction_id).await
                    {
                        tracing::error!("threshold handler error: {}", e);
                    }
                }
                _ => {
                    tracing::info!("unhandled message: {:?}", message);
                    tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                    continue;
                }
            }
        }
    }
}
