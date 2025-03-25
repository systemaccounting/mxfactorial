use fred::prelude::*;
use fred::types::Message;
use tokio::sync::broadcast::Receiver as BroadcastReceiver;

pub struct RedisClient {
    inner: fred::clients::RedisClient,
}

impl RedisClient {
    pub async fn new() -> Self {
        let redis_uri = Self::redis_uri_from_env();
        let redis_config = RedisConfig::from_url(&redis_uri).unwrap();
        let redis_client = Builder::from_config(redis_config).build().unwrap();
        Self {
            inner: redis_client,
        }
    }

    fn redis_uri_from_env() -> String {
        let redis_db = std::env::var("REDIS_DB").unwrap();
        let redis_host = std::env::var("REDIS_HOST").unwrap();
        let redis_port = std::env::var("REDIS_PORT").unwrap();
        let redis_username = std::env::var("REDIS_USERNAME").unwrap();
        let redis_password = std::env::var("REDIS_PASSWORD").unwrap();
        redis_uri(
            &redis_db,
            &redis_host,
            &redis_port,
            &redis_username,
            &redis_password,
        )
    }

    pub async fn init(&self) -> Result<(), RedisError> {
        match self.inner.init().await {
            Ok(_) => {
                tracing::info!("redis client initialized");
                Ok(())
            }
            Err(e) => {
                tracing::error!("failed to initialize redis client: {:?}", e);
                Err(e)
            }
        }
    }

    pub async fn eval(
        &self,
        script: &str,
        keys: Vec<String>,
        args: Vec<String>,
    ) -> Result<RedisValue, RedisError> {
        self.inner.eval(script, keys, args).await
    }

    pub async fn subscribe(&self, channels: Vec<String>) -> Result<(), RedisError> {
        self.inner.subscribe(channels).await
    }

    pub fn message_rx(&self) -> BroadcastReceiver<Message> {
        self.inner.message_rx()
    }
}

fn redis_uri(
    redis_db: &str,
    redis_host: &str,
    redis_port: &str,
    redis_username: &str,
    redis_password: &str,
) -> String {
    format!("redis://{redis_username}:{redis_password}@{redis_host}:{redis_port}/{redis_db}")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_a_redis_conn_uri() {
        let redis_db = "0";
        let redis_host = "localhost";
        let redis_port = "6379";
        let redis_username = "admin";
        let redis_password = "password";
        let uri = redis_uri(
            redis_db,
            redis_host,
            redis_port,
            redis_username,
            redis_password,
        );
        assert_eq!(uri, "redis://admin:password@localhost:6379/0");
    }
}
