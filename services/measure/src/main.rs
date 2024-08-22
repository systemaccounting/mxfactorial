use axum::{
    extract::{
        connect_info::ConnectInfo,
        // https://github.com/tokio-rs/axum/blob/main/examples/websockets/src/main.rs
        ws::{Message, WebSocket, WebSocketUpgrade},
        Query,
        State,
    },
    response::IntoResponse,
    routing::get,
    Router,
};
use fred::prelude::*;
use futures::{sink::SinkExt, stream::StreamExt};
use pg::postgres::{ConnectionPool, DatabaseConnection, DB};
use serde::Deserialize;
use shutdown::shutdown_signal;
use std::{env, net::SocketAddr};

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

#[derive(Debug, Deserialize)]
struct Params {
    measure: String,
    date: String,
    country: String,
    region: String,
    // sub_region: String,
    municipality: String,
}

impl Params {
    fn redis_gdp_key(&self) -> String {
        format!(
            "{}:{}:{}:{}:{}", // 2024-08-20:gdp:usa:cal:sac
            self.date, self.measure, self.country, self.region, self.municipality
        )
    }
}

// example websocket uri with query params:
// wscat -c 'ws://localhost:10010/ws?measure=gdp&date=2024-08-21&country=United%20States%20of%20America&region=California&municipality=Sacramento'

#[tokio::main]
async fn main() {
    let conn_uri = DB::create_conn_uri_from_env_vars();
    let pool = DB::new_pool(&conn_uri).await;

    let app = Router::new().route("/ws", get(ws_handler)).with_state(pool);

    let hostname_or_ip = env::var("HOSTNAME_OR_IP").unwrap_or("0.0.0.0".to_string());
    let port = env::var("MEASURE_PORT").unwrap();
    let serve_addr = format!("{hostname_or_ip}:{port}");

    let listener = tokio::net::TcpListener::bind(serve_addr.clone())
        .await
        .unwrap();

    tracing::info!("listening on {}", serve_addr);

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .with_graceful_shutdown(shutdown_signal())
    .await
    .unwrap();
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    State(pool): State<ConnectionPool>,
    query: Query<Params>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, addr, pool, query.0))
}

/// spawn websocket per connection
async fn handle_socket(socket: WebSocket, _who: SocketAddr, pool: ConnectionPool, params: Params) {
    // get abbreviated location names from postgres
    let conn = pool.get_conn().await;
    let abbreviations = redis_names(&conn, params).await;

    // concat abbreviated location names to colon separated redis key: 2024-08-20:gdp:usa:cal:sac
    let redis_gdp_key = abbreviations.redis_gdp_key();

    // connect to redis
    let redis_uri = redis_conn_uri();
    let redis_config = RedisConfig::from_url(&redis_uri).unwrap();
    let redis_client = Builder::from_config(redis_config).build().unwrap();
    redis_client.init().await.unwrap();

    // subscribe to redis channel named after redis key
    redis_client.subscribe(redis_gdp_key).await.unwrap();

    // proxy redis subscription to websocket
    proxy_redis_subscription(redis_client, socket).await
}

async fn proxy_redis_subscription(redis_client: RedisClient, socket: WebSocket) {
    let (mut ws_tx, mut ws_rx) = socket.split();
    let mut redis_stream = redis_client.message_rx();
    while let Ok(message) = redis_stream.recv().await {
        let message = message.value.as_string().unwrap();
        ws_tx.send(Message::Text(message)).await.unwrap();

        tokio::select! {
            ws_msg = ws_rx.next() => {
                if let Some(Ok(Message::Close(_))) = ws_msg {
                    break;
                }
            },
            redis_msg = redis_stream.recv() => {
                match redis_msg {
                    Ok(message) => {
                        let message = message.value.as_string().unwrap();
                        ws_tx.send(Message::Text(message)).await.unwrap();
                    }
                    Err(e) => {
                        tracing::error!("error receiving message: {}", e);
                        break;
                    }
                }
            }
        }
    }
}

async fn redis_names(pg_conn: &DatabaseConnection, ws_params: Params) -> Params {
    let country = query_key(pg_conn, ws_params.country).await;
    let region = query_key(pg_conn, ws_params.region).await;
    let municipality = query_key(pg_conn, ws_params.municipality).await;
    Params {
        measure: ws_params.measure,
        date: ws_params.date,
        country,
        region,
        municipality,
    }
}

async fn query_key(pg_conn: &DatabaseConnection, place: String) -> String {
    pg_conn
        .0
        .query_one("SELECT value FROM redis_name WHERE key = $1", &[&place])
        .await
        .unwrap()
        .get(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_a_redis_gdp_key() {
        let params = Params {
            measure: "gdp".to_string(),
            date: "2024-08-20".to_string(),
            country: "usa".to_string(),
            region: "cal".to_string(),
            municipality: "sac".to_string(),
        };
        assert_eq!(
            params.redis_gdp_key(),
            "2024-08-20:gdp:usa:cal:sac".to_string()
        );
    }
}
