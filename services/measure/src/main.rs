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
use pubsub::PubSub;
use rust_decimal::prelude::*;
use rust_decimal::Decimal;
use serde::Deserialize;
use shutdown::shutdown_signal;
use std::{env, net::SocketAddr, sync::Arc};

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
        if let Some(country) = &self.country {
            key.push_str(&format!(":{}", country));
        }
        if let Some(region) = &self.region {
            key.push_str(&format!(":{}", region));
        }
        if let Some(municipality) = &self.municipality {
            key.push_str(&format!(":{}", municipality));
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
    let abbreviations = abbrev_names(&conn, params).await;

    // concat abbreviated location names to colon separated key: 2024-08-20:gdp:usa:cal:sac
    let gdp_key = abbreviations.redis_gdp_key();

    // create pubsub client for this connection
    let pubsub = match pubsub::new().await {
        Some(p) => p,
        None => {
            tracing::error!("pubsub not available");
            return;
        }
    };

    // subscribe to channel named after gdp key
    if let Err(e) = pubsub.subscribe(vec![gdp_key.clone()]).await {
        tracing::error!("subscribe failed: {}", e);
        return;
    }

    // proxy subscription to websocket
    proxy_subscription(pubsub, gdp_key, socket).await
}

async fn proxy_subscription(pubsub: Arc<dyn PubSub>, channel: String, socket: WebSocket) {
    let (mut ws_tx, mut ws_rx) = socket.split();
    let mut rx = pubsub.message_rx();

    loop {
        tokio::select! {
            ws_msg = ws_rx.next() => {
                if ws_msg.is_none() {
                    tracing::error!("measure received empty message from graphql");
                    break;
                }
            },
            msg = rx.recv() => {
                match msg {
                    Ok(message) => {
                        // filter messages to only our subscribed channel
                        if message.channel != channel {
                            continue;
                        }
                        let gdp = trim_string_decimal(&message.payload);
                        let msg = Message::Text(gdp.clone().into());
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
                        tracing::error!("error receiving pubsub message: {}", e);
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

async fn abbrev_names(pg_conn: &DatabaseConnection, ws_params: Params) -> Params {
    let mut keys: Params = Params {
        measure: ws_params.measure,
        date: ws_params.date,
        country: None,
        region: None,
        municipality: None,
    };
    if let Some(country) = ws_params.country {
        keys.country = Some(query_key(pg_conn, country).await);
    } else {
        return keys;
    }
    if let Some(region) = ws_params.region {
        keys.region = Some(query_key(pg_conn, region).await);
    } else {
        return keys;
    }
    if let Some(municipality) = ws_params.municipality {
        keys.municipality = Some(query_key(pg_conn, municipality).await);
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
