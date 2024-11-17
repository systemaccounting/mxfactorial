use fred::prelude::*;
use futures_channel::mpsc;
use futures_util::{stream, FutureExt, StreamExt, TryStreamExt};
use serde::Deserialize;
use std::env;
use tokio_postgres::{AsyncMessage, NoTls};
mod events;

fn pg_conn_uri() -> String {
    let pguser = std::env::var("PGUSER").unwrap();
    let pgpassword = std::env::var("PGPASSWORD").unwrap();
    let pghost = std::env::var("PGHOST").unwrap();
    let pgport = std::env::var("PGPORT").unwrap();
    let pgdatabase = std::env::var("PGDATABASE").unwrap();
    let uri = format!(
        "postgresql://{pguser}:{pgpassword}@{pghost}:{pgport}/{pgdatabase}",
        pguser = pguser,
        pgpassword = pgpassword,
        pghost = pghost,
        pgport = pgport,
        pgdatabase = pgdatabase
    );
    uri
}

fn redis_conn_uri() -> String {
    let redis_db = std::env::var("REDIS_DB").unwrap();
    let redis_host = std::env::var("REDIS_HOST").unwrap();
    let redis_port = std::env::var("REDIS_PORT").unwrap();
    let redis_username = std::env::var("REDIS_USERNAME").unwrap();
    let redis_password = std::env::var("REDIS_PASSWORD").unwrap();
    format!(
        "redis://{redis_username}:{redis_password}@{redis_host}:{redis_port}/{redis_db}",
        redis_db = redis_db,
        redis_host = redis_host,
        redis_port = redis_port,
        redis_username = redis_username,
        redis_password = redis_password
    )
}

#[derive(Deserialize, Debug)]
struct Event {
    name: String,
    value: String,
}

#[tokio::main]
async fn main() {
    if let Ok(level) = env::var("RUST_LOG") {
        tracing_subscriber::fmt().with_env_filter(level).init();
    } else {
        tracing_subscriber::fmt().init();
    }

    let pg_uri = pg_conn_uri();
    let redis_uri = redis_conn_uri();
    let redis_config = RedisConfig::from_url(&redis_uri).unwrap();
    let redis_client = Builder::from_config(redis_config).build().unwrap();

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

        if let Err(e) = client.batch_execute("LISTEN event;").await {
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
                AsyncMessage::Notification(n) => match serde_json::from_str::<Event>(n.payload()) {
                    Ok(event) => match event.name.as_str() {
                        "gdp" => {
                            let gdp_map = events::Gdp::new(event.value.as_str());
                            events::redis_incrby_gdp(&redis_client, gdp_map).await;
                        }
                        _ => {
                            tracing::info!("unknown event: {}", event.name);
                        }
                    },
                    Err(e) => {
                        tracing::info!("failed to parse event: {}", e);
                    }
                },
                _ => {
                    tracing::info!("unhandled message: {:?}", message);
                    tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                    continue;
                }
            }
        }
    }
}
