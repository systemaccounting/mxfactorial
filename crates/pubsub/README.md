<p align="center">
  <a href="https://www.systemaccounting.org/" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

pubsub trait with redis and sns implementations. ephemeral broadcast messaging for gdp updates from event service to measure service

`pubsub::new()` factory returns the backend based on environment:
- **lambda** (`AWS_LAMBDA_FUNCTION_NAME` or `SNS_TOPIC_ARN` set): sns
- **local** (`REDIS_HOST` set): redis
- **neither**: none

### usage

```rust
let pubsub = pubsub::new().await;

// publish
pubsub.publish("channel", "message").await?;

// subscribe
pubsub.subscribe(vec!["channel".to_string()]).await?;
let mut rx = pubsub.message_rx();
while let Ok(msg) = rx.recv().await {
    println!("{}: {}", msg.channel, msg.payload);
}
```

### trait methods

- `publish` — send message to channel
- `subscribe` — listen on channels
- `message_rx` — get broadcast receiver for incoming messages

### implementations

**redis** (`src/redis.rs`) — uses fred client with native pub/sub. spawns a task to forward fred messages to a tokio broadcast channel

**sns** (`src/sns.rs`) — publish and subscribe are both no-ops. in lambda, DynamoDB Stream → EventBridge Pipe → SNS handles publish, and measure lambda is triggered by SNS event directly

### dependencies

| env var | description |
|---|---|
| `REDIS_HOST` | redis host (local) |
| `REDIS_PORT` | redis port (default 6379) |
| `REDIS_PASSWORD` | redis password |
| `REDIS_USERNAME` | redis username (default "default") |
| `REDIS_DB` | redis database number (default 0) |
| `AWS_LAMBDA_FUNCTION_NAME` | triggers sns backend |
| `SNS_TOPIC_ARN` | sns topic arn (also triggers sns backend) |
