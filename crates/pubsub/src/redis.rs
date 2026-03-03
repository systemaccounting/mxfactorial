use async_trait::async_trait;
use fred::prelude::*;
use tokio::sync::broadcast::{self, Receiver, Sender};

use crate::{Message, PubSub, PubSubError};

pub struct RedisPubSub {
    inner: Client,
    tx: Sender<Message>,
}

impl RedisPubSub {
    pub async fn new() -> Result<Self, PubSubError> {
        let redis_uri = redis_uri_from_env();
        let redis_config = Config::from_url(&redis_uri)
            .map_err(|e| PubSubError::ConnectionError(e.to_string()))?;
        let redis_client = Builder::from_config(redis_config)
            .build()
            .map_err(|e| PubSubError::ConnectionError(e.to_string()))?;

        redis_client
            .init()
            .await
            .map_err(|e| PubSubError::ConnectionError(e.to_string()))?;

        // create broadcast channel for forwarding redis messages
        let (tx, _) = broadcast::channel(256);

        // spawn task to forward fred messages to our broadcast channel
        let tx_clone = tx.clone();
        let mut rx = redis_client.message_rx();
        tokio::spawn(async move {
            while let Ok(msg) = rx.recv().await {
                let channel = String::from_utf8_lossy(msg.channel.inner()).to_string();
                if let Some(payload) = msg.value.as_string() {
                    let _ = tx_clone.send(Message { channel, payload });
                }
            }
        });

        Ok(Self {
            inner: redis_client,
            tx,
        })
    }
}

fn redis_uri_from_env() -> String {
    envvar::redis_uri().unwrap()
}

#[async_trait]
impl PubSub for RedisPubSub {
    async fn publish(&self, channel: &str, message: &str) -> Result<(), PubSubError> {
        self.inner
            .publish::<(), _, _>(channel, message)
            .await
            .map_err(|e| PubSubError::PublishError(e.to_string()))
    }

    async fn subscribe(&self, channels: Vec<String>) -> Result<(), PubSubError> {
        self.inner
            .subscribe(channels)
            .await
            .map_err(|e| PubSubError::SubscribeError(e.to_string()))
    }

    fn message_rx(&self) -> Receiver<Message> {
        self.tx.subscribe()
    }
}
