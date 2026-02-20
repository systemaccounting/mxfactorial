pub mod redis;
pub mod sqs;

use async_trait::async_trait;
use std::{env, sync::Arc};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum QueueError {
    #[error("connection error: {0}")]
    ConnectionError(String),
    #[error("send error: {0}")]
    SendError(String),
    #[error("receive error: {0}")]
    ReceiveError(String),
    #[error("no message available")]
    NoMessage,
}

pub struct Message {
    pub body: String,
    pub handle: String, // receipt handle for ack
}

#[async_trait]
pub trait Queue: Send + Sync {
    async fn send(&self, payload: &str) -> Result<(), QueueError>;
    async fn receive(&self) -> Result<Message, QueueError>; // blocks until message
    async fn ack(&self, msg: &Message) -> Result<(), QueueError>;
}

/// create queue client based on environment
/// - lambda or SQS_QUEUE_URL set: sqs
/// - REDIS_HOST set: redis
/// - otherwise: none
pub async fn new() -> Option<Arc<dyn Queue>> {
    if env::var("AWS_LAMBDA_FUNCTION_NAME").is_ok() || env::var("SQS_QUEUE_URL").is_ok() {
        match sqs::SqsQueue::new().await {
            Ok(queue) => {
                tracing::info!("sqs queue initialized");
                Some(Arc::new(queue) as Arc<dyn Queue>)
            }
            Err(e) => {
                tracing::warn!("sqs init failed: {}", e);
                None
            }
        }
    } else if env::var("REDIS_HOST").is_ok() {
        match redis::RedisQueue::new().await {
            Ok(queue) => {
                tracing::info!("redis queue initialized");
                Some(Arc::new(queue) as Arc<dyn Queue>)
            }
            Err(e) => {
                tracing::warn!("redis queue init failed: {}", e);
                None
            }
        }
    } else {
        tracing::info!("no queue backend configured");
        None
    }
}
