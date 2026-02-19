pub mod redis;
pub mod sns;

use async_trait::async_trait;
use std::{env, sync::Arc};
use thiserror::Error;
use tokio::sync::broadcast::Receiver;

#[derive(Error, Debug)]
pub enum PubSubError {
    #[error("connection error: {0}")]
    ConnectionError(String),
    #[error("publish error: {0}")]
    PublishError(String),
    #[error("subscribe error: {0}")]
    SubscribeError(String),
}

#[derive(Clone, Debug)]
pub struct Message {
    pub channel: String,
    pub payload: String,
}

#[async_trait]
pub trait PubSub: Send + Sync {
    async fn publish(&self, channel: &str, message: &str) -> Result<(), PubSubError>;
    async fn subscribe(&self, channels: Vec<String>) -> Result<(), PubSubError>;
    fn message_rx(&self) -> Receiver<Message>;
}

/// create pubsub client based on environment
/// - lambda or SNS_TOPIC_ARN set: sns (publish only, subscribe is event-triggered)
/// - REDIS_HOST set: redis
/// - otherwise: none
pub async fn new() -> Option<Arc<dyn PubSub>> {
    if env::var("AWS_LAMBDA_FUNCTION_NAME").is_ok() || env::var("SNS_TOPIC_ARN").is_ok() {
        match sns::SnsPubSub::new().await {
            Ok(pubsub) => {
                tracing::info!("sns pubsub initialized");
                Some(Arc::new(pubsub) as Arc<dyn PubSub>)
            }
            Err(e) => {
                tracing::warn!("sns init failed: {}", e);
                None
            }
        }
    } else if env::var("REDIS_HOST").is_ok() {
        match redis::RedisPubSub::new().await {
            Ok(pubsub) => {
                tracing::info!("redis pubsub initialized");
                Some(Arc::new(pubsub) as Arc<dyn PubSub>)
            }
            Err(e) => {
                tracing::warn!("redis pubsub init failed: {}", e);
                None
            }
        }
    } else {
        tracing::info!("no pubsub backend configured");
        None
    }
}
