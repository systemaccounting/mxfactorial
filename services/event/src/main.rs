use futures::channel::mpsc;
use futures::{stream, FutureExt, StreamExt, TryStreamExt};
use pg::postgres::DB;
use serde::Deserialize;
use shutdown::shutdown_signal;
use std::{env, sync::Arc};
use tokio_postgres::{AsyncMessage, NoTls};
mod events;

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
enum EventType {
    Equilibrium,
    Cron,
}

#[derive(Deserialize)]
struct EventPayload {
    event: EventType,
    id: String,
}

struct AppState {
    pool: pg::postgres::ConnectionPool,
    cache: Arc<dyn cache::Cache>,
    pubsub: Arc<dyn pubsub::PubSub>,
    queue: Option<Arc<dyn queue::Queue>>,
}

async fn process_pending(state: &AppState) {
    let conn = state.pool.get_conn().await;
    let rows = match conn
        .0
        .query(
            "UPDATE transaction SET event_time = NOW() WHERE equilibrium_time IS NOT NULL AND event_time IS NULL RETURNING id",
            &[],
        )
        .await
    {
        Ok(rows) => rows,
        Err(e) => {
            tracing::error!("failed to claim pending transactions: {}", e);
            return;
        }
    };

    for row in rows {
        let transaction_id: i32 = row.get(0);
        let tid = transaction_id.to_string();
        tracing::info!("processing transaction_id: {}", tid);

        if let Err(e) = events::handle_gdp(&state.pool, &state.cache, &state.pubsub, &tid).await {
            tracing::error!("gdp handler error for {}: {}", tid, e);
        }

        if let Some(ref q) = state.queue {
            if let Err(e) =
                events::handle_threshold_profit(&state.pool, &state.cache, q, &tid).await
            {
                tracing::error!("threshold handler error for {}: {}", tid, e);
            }
        }
    }
}

#[tokio::main]
async fn main() {
    if let Ok(level) = env::var("RUST_LOG") {
        tracing_subscriber::fmt().with_env_filter(level).init();
    } else {
        tracing_subscriber::fmt().init();
    }

    let conn_uri = DB::create_conn_uri_from_env_vars();
    let pool = DB::new_pool(&conn_uri).await;

    let cache = cache::new()
        .await
        .expect("cache required for event service");
    let pubsub = pubsub::new()
        .await
        .expect("pubsub required for event service");
    let queue = queue::new().await;

    let state = AppState {
        pool,
        cache,
        pubsub,
        queue,
    };

    // drain any rows left from before startup (crash recovery)
    process_pending(&state).await;

    let shutdown = shutdown_signal();
    tokio::pin!(shutdown);

    loop {
        let (client, mut connection) = match tokio_postgres::connect(conn_uri.as_str(), NoTls).await
        {
            Ok(conn) => conn,
            Err(e) => {
                tracing::info!("failed to connect to postgres: {}", e);
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

        tracing::info!("listening on event channel");

        // drain rows accumulated during reconnection
        process_pending(&state).await;

        loop {
            let message = tokio::select! {
                msg = rx.next() => msg,
                _ = &mut shutdown => {
                    tracing::info!("shutting down");
                    handler.abort();
                    return;
                }
            };

            match message {
                Some(message) => match message {
                    AsyncMessage::Notification(n) => {
                        match serde_json::from_str::<EventPayload>(n.payload()) {
                            Ok(payload) => match payload.event {
                                EventType::Equilibrium => process_pending(&state).await,
                                EventType::Cron => {
                                    if let Some(ref q) = state.queue {
                                        if let Err(e) =
                                            events::handle_cron(&state.pool, q, &payload.id).await
                                        {
                                            tracing::error!(
                                                "cron handler error for {}: {}",
                                                payload.id,
                                                e
                                            );
                                        }
                                    } else {
                                        tracing::error!(
                                            "cron event received but no queue configured"
                                        );
                                    }
                                }
                            },
                            Err(e) => {
                                tracing::error!("failed to parse event payload: {}", e);
                            }
                        }
                    }
                    _ => {
                        tracing::info!("unhandled message: {:?}", message);
                    }
                },
                None => {
                    tracing::info!("connection terminated, reconnecting");
                    handler.abort();
                    break;
                }
            }
        }
    }
}
