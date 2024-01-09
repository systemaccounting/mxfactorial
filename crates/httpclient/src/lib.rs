use aws_credential_types::provider::ProvideCredentials;
use aws_sigv4::http_request::{sign, SignableBody, SignableRequest, SigningSettings};
use aws_sigv4::sign::v4;
use aws_smithy_runtime_api::client::identity::Identity;
use reqwest::{Client, Error, Response};
use std::{env, time::SystemTime};

pub struct HttpClient(Client);

impl Default for HttpClient {
    fn default() -> Self {
        Self(Client::new())
    }
}

impl HttpClient {
    pub fn new() -> Self {
        Self::default()
    }

    pub async fn post(&self, url: String, body: String) -> Result<Response, Error> {
        let mut http_request = http::Request::builder()
            .method("POST")
            .uri(url)
            .header(
                "Content-Type",
                http::HeaderValue::from_str("application/json").unwrap(),
            )
            .body(body)
            .unwrap();

        // sign request if running in lambda
        if env::var("AWS_LAMBDA_FUNCTION_NAME").ok().is_some() {
            HttpClient::sign(&mut http_request).await;
        }

        let req = reqwest::Request::try_from(http_request).unwrap();

        self.0.execute(req).await
    }

    async fn sign(http_request: &mut http::Request<String>) {
        let config = aws_config::load_defaults(aws_config::BehaviorVersion::v2023_11_09()).await;
        let region = config.region().unwrap().as_ref();
        let provider = config.credentials_provider().unwrap();
        let credentials = provider.provide_credentials().await.unwrap();
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
            .unwrap()
            .into();

        let signable_request = SignableRequest::new(
            http_request.method().as_str(),
            http_request.uri().to_string(),
            http_request
                .headers()
                .iter()
                .map(|(k, v)| (k.as_str(), v.to_str().unwrap())),
            SignableBody::Bytes(http_request.body().as_bytes()),
        )
        .unwrap();

        let (signing_instructions, _signature) = sign(signable_request, &signing_params)
            .unwrap()
            .into_parts();
        signing_instructions.apply_to_request_http0x(http_request);
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
        let response = test_client.post(url, String::from("")).await.unwrap();
        let response_body: TestMessage = response.json().await.unwrap();

        let got = response_body.message;
        let want = "test".to_string();

        assert_eq!(got, want);
    }
}
