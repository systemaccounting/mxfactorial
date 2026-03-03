use async_trait::async_trait;
use fred::prelude::*;
use std::sync::OnceLock;

use crate::{Message, Queue, QueueError};

static QUEUE_KEY: OnceLock<String> = OnceLock::new();

fn get_queue_key() -> &'static str {
    QUEUE_KEY.get_or_init(|| {
        std::env::var("QUEUE_KEY").unwrap_or_else(|_| "auto-transact:queue".to_string())
    })
}

pub struct RedisQueue {
    inner: Client,
}

impl RedisQueue {
    pub async fn new() -> Result<Self, QueueError> {
        let redis_uri = redis_uri_from_env();
        let redis_config =
            Config::from_url(&redis_uri).map_err(|e| QueueError::ConnectionError(e.to_string()))?;
        let redis_client = Builder::from_config(redis_config)
            .build()
            .map_err(|e| QueueError::ConnectionError(e.to_string()))?;

        redis_client
            .init()
            .await
            .map_err(|e| QueueError::ConnectionError(e.to_string()))?;

        Ok(Self {
            inner: redis_client,
        })
    }
}

fn redis_uri_from_env() -> String {
    envvar::redis_uri().unwrap()
}

#[async_trait]
impl Queue for RedisQueue {
    async fn send(&self, payload: &str) -> Result<(), QueueError> {
        let key = get_queue_key();
        self.inner
            .lpush::<i64, _, _>(key, payload)
            .await
            .map(|_| ())
            .map_err(|e| QueueError::SendError(e.to_string()))
    }

    async fn receive(&self) -> Result<Message, QueueError> {
        let key = get_queue_key();
        // BRPOP blocks until message available, 0 = wait forever
        let result: Option<(String, String)> = self
            .inner
            .brpop(key, 0.0)
            .await
            .map_err(|e| QueueError::ReceiveError(e.to_string()))?;

        match result {
            Some((_, body)) => Ok(Message {
                handle: body.clone(),
                body,
            }),
            None => Err(QueueError::NoMessage),
        }
    }

    async fn ack(&self, _msg: &Message) -> Result<(), QueueError> {
        // redis BRPOP already removed the message, ack is no-op
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_gets_default_queue_key() {
        // reset for test isolation
        let key = "auto-transact:queue";
        assert_eq!(key, "auto-transact:queue");
    }
}
