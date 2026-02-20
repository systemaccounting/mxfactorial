use std::{error::Error, future::Future, time::Duration};
use tokio::time::sleep;

pub struct RetryConfig {
    pub max_retries: u32,
    pub delay: Duration,
    pub service_name: String,
}

pub async fn retry_post<F, Fut>(
    config: &RetryConfig,
    post_fn: F,
) -> Result<String, Box<dyn Error + Send + Sync>>
where
    F: Fn() -> Fut,
    Fut: Future<Output = Result<String, Box<dyn Error + Send + Sync>>>,
{
    let mut attempt = 0;

    loop {
        attempt += 1;
        match post_fn().await {
            Ok(response) => return Ok(response),
            Err(e) => {
                if attempt < config.max_retries {
                    tracing::warn!(
                        "retry {}/{}: {} failed: {:?}",
                        attempt,
                        config.max_retries,
                        config.service_name,
                        e
                    );
                    sleep(config.delay).await;
                } else {
                    tracing::error!(
                        "deadletter: {} failed after {} attempts: {:?}",
                        config.service_name,
                        config.max_retries,
                        e
                    );
                    return Err(e);
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU32, Ordering};
    use std::sync::Arc;

    #[tokio::test]
    async fn it_succeeds_on_first_attempt() {
        let config = RetryConfig {
            max_retries: 3,
            delay: Duration::from_millis(10),
            service_name: "test-service".to_string(),
        };

        let result = retry_post(&config, || async { Ok("success".to_string()) }).await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "success");
    }

    #[tokio::test]
    async fn it_succeeds_after_retries() {
        let config = RetryConfig {
            max_retries: 3,
            delay: Duration::from_millis(10),
            service_name: "test-service".to_string(),
        };

        let attempts = Arc::new(AtomicU32::new(0));
        let attempts_clone = attempts.clone();

        let result = retry_post(&config, || {
            let attempts = attempts_clone.clone();
            async move {
                let count = attempts.fetch_add(1, Ordering::SeqCst) + 1;
                if count < 3 {
                    Err("temporary failure".into())
                } else {
                    Ok("success after retry".to_string())
                }
            }
        })
        .await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "success after retry");
        assert_eq!(attempts.load(Ordering::SeqCst), 3);
    }

    #[tokio::test]
    async fn it_deadletters_after_max_retries() {
        let config = RetryConfig {
            max_retries: 3,
            delay: Duration::from_millis(10),
            service_name: "test-service".to_string(),
        };

        let attempts = Arc::new(AtomicU32::new(0));
        let attempts_clone = attempts.clone();

        let result = retry_post(&config, || {
            let attempts = attempts_clone.clone();
            async move {
                attempts.fetch_add(1, Ordering::SeqCst);
                Err::<String, _>("persistent failure".into())
            }
        })
        .await;

        assert!(result.is_err());
        assert_eq!(attempts.load(Ordering::SeqCst), 3);
    }
}
