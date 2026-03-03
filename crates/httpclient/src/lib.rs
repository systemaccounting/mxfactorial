use aws_credential_types::provider::ProvideCredentials;
use aws_sigv4::http_request::{sign, SignableBody, SignableRequest, SigningSettings};
use aws_sigv4::sign::v4;
use aws_smithy_runtime_api::client::identity::Identity;
use reqwest::Client;
use std::{env, time::SystemTime};

#[derive(Debug, thiserror::Error)]
pub enum ClientError {
    #[error("request error: {0}")]
    Request(#[from] reqwest::Error),
    #[error("signing error: {0}")]
    Signing(String),
    #[error("aws config error: {0}")]
    AwsConfig(String),
    #[error("request build error: {0}")]
    Build(String),
    #[error("{message}")]
    Downstream { status: u16, message: String },
}

impl From<String> for ClientError {
    fn from(s: String) -> Self {
        ClientError::Build(s)
    }
}

#[derive(Default)]
pub struct HttpClient(Client);

impl HttpClient {
    pub fn new() -> Self {
        Self::default()
    }

    pub async fn post(&self, url: String, body: String) -> Result<String, ClientError> {
        let mut http_request = http::Request::builder()
            .method("POST")
            .uri(url)
            .header("Content-Type", "application/json")
            .body(body)
            .map_err(|e| ClientError::Build(e.to_string()))?;

        // sign request when testing lambda
        if env::var("AWS_LAMBDA_FUNCTION_NAME").ok().is_some() {
            HttpClient::sign(&mut http_request).await?;
        }

        let req = reqwest::Request::try_from(http_request)
            .map_err(|e| ClientError::Build(e.to_string()))?;

        let response = self.0.execute(req).await?;
        let status = response.status();
        let text = response.text().await?;
        if !status.is_success() {
            let msg = serde_json::from_str::<serde_json::Value>(&text)
                .ok()
                .and_then(|v| v.get("error").and_then(|e| e.as_str()).map(String::from))
                .unwrap_or(text);
            return Err(ClientError::Downstream {
                status: status.as_u16(),
                message: msg,
            });
        }
        Ok(text)
    }

    async fn sign(http_request: &mut http::Request<String>) -> Result<(), ClientError> {
        let config = aws_config::load_defaults(aws_config::BehaviorVersion::latest()).await;
        let region = config
            .region()
            .ok_or_else(|| ClientError::AwsConfig("missing aws region".into()))?
            .as_ref();
        let provider = config
            .credentials_provider()
            .ok_or_else(|| ClientError::AwsConfig("missing credentials provider".into()))?;
        let credentials = provider
            .provide_credentials()
            .await
            .map_err(|e| ClientError::AwsConfig(e.to_string()))?;
        // https://github.com/awslabs/aws-sdk-rust/discussions/868
        let identity = Identity::new(credentials, None);
        let signing_settings = SigningSettings::default();

        let signing_params = v4::SigningParams::builder()
            .identity(&identity)
            .region(region)
            .name("lambda")
            .time(SystemTime::now())
            .settings(signing_settings)
            .build()
            .map_err(|e| ClientError::Signing(e.to_string()))?
            .into();

        let signable_request = SignableRequest::new(
            http_request.method().as_str(),
            http_request.uri().to_string(),
            http_request
                .headers()
                .iter()
                .map(|(k, v)| (k.as_str(), v.to_str().unwrap_or_default())),
            SignableBody::Bytes(http_request.body().as_bytes()),
        )
        .map_err(|e| ClientError::Signing(e.to_string()))?;

        let (signing_instructions, _signature) = sign(signable_request, &signing_params)
            .map_err(|e| ClientError::Signing(e.to_string()))?
            .into_parts();
        signing_instructions.apply_to_request_http1x(http_request);

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use httpmock::prelude::*;
    use serde::{Deserialize, Serialize};

    use crate::HttpClient;

    #[derive(PartialEq, Debug, Serialize, Deserialize)]
    struct TestMessage {
        message: String,
    }

    #[tokio::test]
    async fn it_returns_client_error_on_connection_refused() {
        let client = HttpClient::new();
        let result = client
            .post("http://localhost:1".to_string(), String::new())
            .await;
        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            crate::ClientError::Request(_)
        ));
    }

    #[tokio::test]
    async fn it_receives_a_response() {
        let server = MockServer::start();

        server.mock(|when, then| {
            when.method(POST)
                .path("/")
                .header("Content-Type", "application/json");
            then.status(200)
                .header("Content-Type", "application/json")
                .json_body_obj(&TestMessage {
                    message: "test".to_string(),
                });
        });

        let url = server.base_url() + "/";
        let test_client = HttpClient::new();
        let response_body = test_client.post(url, String::from("")).await.unwrap();
        let parsed: TestMessage = serde_json::from_str(&response_body).unwrap();

        let got = parsed.message;
        let want = "test".to_string();

        assert_eq!(got, want);
    }
}
