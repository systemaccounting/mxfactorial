use async_trait::async_trait;
use tokio::sync::broadcast::{self, Receiver, Sender};

use crate::{Message, PubSub, PubSubError};

pub struct SnsPubSub {
    tx: Sender<Message>,
}

impl SnsPubSub {
    pub async fn new() -> Result<Self, PubSubError> {
        // no client needed - publish is no-op (DDB Stream → EventBridge Pipe → SNS)
        // subscribe is event-triggered (Lambda invoked by SNS)
        let (tx, _) = broadcast::channel(1);
        Ok(Self { tx })
    }
}

#[async_trait]
impl PubSub for SnsPubSub {
    async fn publish(&self, _channel: &str, _message: &str) -> Result<(), PubSubError> {
        // no-op: DynamoDB Stream → EventBridge Pipe → SNS handles publish
        // event service calls pubsub.publish() in both envs, same code path
        Ok(())
    }

    async fn subscribe(&self, _channels: Vec<String>) -> Result<(), PubSubError> {
        // no-op: measure Lambda triggered by SNS event, not polling
        // this method exists for trait compatibility but is unused in Lambda
        Ok(())
    }

    fn message_rx(&self) -> Receiver<Message> {
        // returns empty receiver - Lambda receives messages via SNS trigger
        self.tx.subscribe()
    }
}
