use fred::prelude::*;
use futures_channel::mpsc;
use futures_util::{stream, FutureExt, StreamExt, TryStreamExt};
use serde::Deserialize;
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
    let pg_uri = pg_conn_uri();

    let (client, mut connection) = tokio_postgres::connect(pg_uri.as_str(), NoTls)
        .await
        .unwrap();

    let (tx, mut rx) = mpsc::unbounded();

    let stream =
        stream::poll_fn(move |cx| connection.poll_message(cx)).map_err(|e| panic!("{}", e));

    let connection = stream.forward(tx).map(|r| r.unwrap());

    tokio::spawn(connection);

    client.batch_execute("LISTEN event;").await.unwrap(); // add more listeners in multiline string

    let redis_uri = redis_conn_uri();
    let redis_config = RedisConfig::from_url(&redis_uri).unwrap();
    let redis_client = Builder::from_config(redis_config).build().unwrap();
    redis_client.init().await.unwrap();

    loop {
        // block until message received
        let message = match rx.next().await {
            Some(message) => message,
            None => continue,
        };

        match message {
            AsyncMessage::Notification(n) => {
                // search for json_build_object in schema
                // for matching postgres Event structure
                match serde_json::from_str::<Event>(n.payload()) {
                    Ok(event) => {
                        match event.name.as_str() {
                            "gdp" => {
                                // parse event value as Gdp map
                                let gdp_map = events::Gdp::new(event.value.as_str());
                                events::redis_incrby_gdp(&redis_client, gdp_map).await;
                            }
                            _ => {
                                println!("unknown event: {}", event.name);
                            }
                        }
                    }
                    Err(e) => {
                        println!("{}", e);
                    }
                }
            }
            _ => continue, // todo: handle error
        };
    }
}
