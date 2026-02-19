<p align="center">
  <a href="https://www.systemaccounting.org/" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

queue trait with redis and sqs implementations. durable job queue with at-least-once delivery for threshold profit dividends from event service to auto-transact

`queue::new()` factory returns the backend based on environment:
- **lambda** (`AWS_LAMBDA_FUNCTION_NAME` or `SQS_QUEUE_URL` set): sqs
- **local** (`REDIS_HOST` set): redis
- **neither**: none

### usage

```rust
let queue = queue::new().await;

// producer (event service)
queue.send(payload).await?;

// consumer (auto-transact)
loop {
    let msg = queue.receive().await?; // blocks until message
    process(&msg.body);
    queue.ack(&msg).await?;
}
```

### trait methods

- `send` — enqueue a message
- `receive` — dequeue next message (blocks until available)
- `ack` — acknowledge message after processing

### flow

```
event service                    auto-transact
     │                                │
     │ queue.send(payload)            │ queue.receive() blocks
     ▼                                ▼
  ┌──────┐                        ┌──────┐
  │ queue │ ───── message ──────► │ queue │
  └──────┘                        └──────┘

Lambda: SQS (long polling, 20s wait)
Local:  Redis (LPUSH/BRPOP, blocks forever)
```

### implementations

**redis** (`src/redis.rs`) — LPUSH to enqueue, BRPOP to dequeue (blocks until available). ack is a no-op since BRPOP already removes the message. queue key defaults to `auto-transact:queue`, configurable via `QUEUE_KEY`

**sqs** (`src/sqs.rs`) — uses aws sdk. long polls with 20s wait time, 1 message per receive. ack deletes the message from the queue

### dependencies

| env var | description |
|---|---|
| `REDIS_HOST` | redis host (local) |
| `REDIS_PORT` | redis port (default 6379) |
| `REDIS_PASSWORD` | redis password |
| `REDIS_USERNAME` | redis username (default "default") |
| `REDIS_DB` | redis database number (default 0) |
| `QUEUE_KEY` | redis queue key (default "auto-transact:queue") |
| `AWS_LAMBDA_FUNCTION_NAME` | triggers sqs backend |
| `SQS_QUEUE_URL` | sqs queue url (also triggers sqs backend) |
