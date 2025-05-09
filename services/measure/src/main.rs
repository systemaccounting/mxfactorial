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
use futures::{sink::SinkExt, stream::StreamExt};
use http::StatusCode;
use pg::postgres::{ConnectionPool, DatabaseConnection, DB};
use redisclient::RedisClient;
use rust_decimal::prelude::*;
use rust_decimal::Decimal;
use serde::Deserialize;
use shutdown::shutdown_signal;
use std::{env, net::SocketAddr};

const READINESS_CHECK_PATH: &str = "READINESS_CHECK_PATH";

#[derive(Debug, Deserialize)]
struct Params {
    measure: String,
    date: String,
    country: Option<String>,
    region: Option<String>,
    // sub_region: Option<String>,
    municipality: Option<String>,
}

impl Params {
    fn redis_gdp_key(&self) -> String {
        let mut key = format!("{}:{}", self.date, self.measure,);
        if self.country.is_some() {
            key.push_str(&format!(":{}", self.country.as_ref().unwrap()));
        }
        if self.region.is_some() {
            key.push_str(&format!(":{}", self.region.as_ref().unwrap()));
        }
        if self.municipality.is_some() {
            key.push_str(&format!(":{}", self.municipality.as_ref().unwrap()));
        }
        key
    }
}

// example websocket uri with query params:
// wscat -c 'ws://localhost:10010/ws?measure=gdp&date=2024-08-21&country=United%20States%20of%20America&region=California&municipality=Sacramento'

#[tokio::main]
async fn main() {
    if let Ok(level) = env::var("RUST_LOG") {
        tracing_subscriber::fmt().with_env_filter(level).init();
    } else {
        tracing_subscriber::fmt().init();
    }

    let readiness_check_path = env::var(READINESS_CHECK_PATH)
        .unwrap_or_else(|_| panic!("{READINESS_CHECK_PATH} variable assignment"));

    let conn_uri = DB::create_conn_uri_from_env_vars();
    let pool = DB::new_pool(&conn_uri).await;

    let app = Router::new()
        .route("/ws", get(ws_handler))
        .route(
            readiness_check_path.as_str(), // absolute path so format not used
            get(|| async { StatusCode::OK }),
        )
        .with_state(pool);

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
    let redis_client = RedisClient::new().await;
    redis_client.init().await.unwrap();

    // subscribe to redis channel named after redis key
    redis_client.subscribe(vec![redis_gdp_key]).await.unwrap();

    // proxy redis subscription to websocket
    proxy_redis_subscription(redis_client, socket).await
}

async fn proxy_redis_subscription(redis_client: RedisClient, socket: WebSocket) {
    let (mut ws_tx, mut ws_rx) = socket.split();
    let mut redis_stream = redis_client.message_rx();

    loop {
        tokio::select! {
            ws_msg = ws_rx.next() => {
                if ws_msg.is_none() {
                    tracing::error!("measure received empty message from graphql");
                    break;
                }
            },
            redis_msg = redis_stream.recv() => {
                match redis_msg {
                    Ok(message) => {
                        let message = message.value.as_string().unwrap();
                        let gdp = trim_string_decimal(message.as_str());
                        let msg = Message::Text(gdp.clone());
                        match ws_tx.send(msg).await {
                            Ok(_) => {
                                tracing::info!("message sent to graphql: {}", gdp);
                            },
                            Err(e) => {
                                tracing::error!("error sending message to graphql: {}", e);
                                break;
                            }
                        }
                    }
                    Err(e) => {
                        tracing::error!("error receiving message from graphql: {}", e);
                        break;
                    }
                }
            }
        }
    }

    match ws_tx.close().await {
        Ok(_) => {
            tracing::info!("websocket with graphql closed");
        }
        Err(e) => {
            tracing::error!("error closing websocket with graphql: {}", e);
        }
    }
}

async fn redis_names(pg_conn: &DatabaseConnection, ws_params: Params) -> Params {
    let mut keys: Params = Params {
        measure: ws_params.measure,
        date: ws_params.date,
        country: None,
        region: None,
        municipality: None,
    };
    if ws_params.country.is_some() {
        keys.country = Some(query_key(pg_conn, ws_params.country.unwrap()).await);
    } else {
        return keys;
    }
    if ws_params.region.is_some() {
        keys.region = Some(query_key(pg_conn, ws_params.region.unwrap()).await);
    } else {
        return keys;
    }
    if ws_params.municipality.is_some() {
        keys.municipality = Some(query_key(pg_conn, ws_params.municipality.unwrap()).await);
    }
    keys
}

async fn query_key(pg_conn: &DatabaseConnection, place: String) -> String {
    pg_conn
        .0
        .query_one("SELECT value FROM redis_name WHERE key = $1", &[&place])
        .await
        .unwrap()
        .get(0)
}

fn trim_string_decimal(s: &str) -> String {
    if s.parse::<f64>().is_ok() {
        let d = Decimal::from_str(s).unwrap();
        // set precision to 3 decimal places
        d.round_dp(3).to_string()
    } else {
        s.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_a_redis_gdp_key() {
        let params = Params {
            measure: "gdp".to_string(),
            date: "2024-08-20".to_string(),
            country: Some("usa".to_string()),
            region: Some("cal".to_string()),
            municipality: Some("sac".to_string()),
        };
        assert_eq!(
            params.redis_gdp_key(),
            "2024-08-20:gdp:usa:cal:sac".to_string()
        );
    }
}
