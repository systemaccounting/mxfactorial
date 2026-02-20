use async_trait::async_trait;
use aws_sdk_sqs::Client;
use std::sync::OnceLock;

use crate::{Message, Queue, QueueError};

static QUEUE_URL: OnceLock<String> = OnceLock::new();

fn get_queue_url() -> &'static str {
    QUEUE_URL.get_or_init(|| std::env::var("SQS_QUEUE_URL").expect("SQS_QUEUE_URL required"))
}

pub struct SqsQueue {
    client: Client,
}

impl SqsQueue {
    pub async fn new() -> Result<Self, QueueError> {
        let config = aws_config::load_defaults(aws_config::BehaviorVersion::latest()).await;
        let client = Client::new(&config);
        Ok(Self { client })
    }
}

#[async_trait]
impl Queue for SqsQueue {
    async fn send(&self, payload: &str) -> Result<(), QueueError> {
        self.client
            .send_message()
            .queue_url(get_queue_url())
            .message_body(payload)
            .send()
            .await
            .map(|_| ())
            .map_err(|e| QueueError::SendError(e.to_string()))
    }

    async fn receive(&self) -> Result<Message, QueueError> {
        let resp = self
            .client
            .receive_message()
            .queue_url(get_queue_url())
            .wait_time_seconds(20) // long polling
            .max_number_of_messages(1)
            .send()
            .await
            .map_err(|e| QueueError::ReceiveError(e.to_string()))?;

        let msg = resp.messages().first().ok_or(QueueError::NoMessage)?;

        Ok(Message {
            body: msg.body().unwrap_or_default().to_string(),
            handle: msg.receipt_handle().unwrap_or_default().to_string(),
        })
    }

    async fn ack(&self, msg: &Message) -> Result<(), QueueError> {
        self.client
            .delete_message()
            .queue_url(get_queue_url())
            .receipt_handle(&msg.handle)
            .send()
            .await
            .map(|_| ())
            .map_err(|e| QueueError::ReceiveError(e.to_string()))
    }
}
