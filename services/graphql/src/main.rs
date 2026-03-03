use ::types::{
    account_role::AccountRole,
    request_response::{IntraTransaction, IntraTransactions, RequestApprove},
    transaction::Transaction,
};
use ::wsclient::WsClient;
use async_graphql::*;
use async_graphql_axum::{GraphQLProtocol, GraphQLRequest, GraphQLResponse, GraphQLWebSocket};
use async_stream::stream;
use aws_lambda_events::event::apigw::ApiGatewayV2httpRequestContext;
use axum::{
    extract::{State, WebSocketUpgrade},
    http::{HeaderMap, StatusCode},
    response::{self, IntoResponse},
    routing::{get, post},
    Router,
};
use futures_util::{stream::Stream, StreamExt};
use httpclient::HttpClient as Client;
use serde_json::json;
use shutdown::shutdown_signal;
use std::{env, net::ToSocketAddrs};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use tungstenite::error::Error as WsError;
use uribuilder::Uri;

const READINESS_CHECK_PATH: &str = "READINESS_CHECK_PATH";

struct Query;

#[Object]
impl Query {
    async fn balance(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "account_name")] account_name: String,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Result<String, Error> {
        let account_from_token = get_auth_account(ctx, auth_account)?;
        let uri = Uri::new_from_env_var("BALANCE_BY_ACCOUNT_URL").to_string();
        let body = account_auth(account_name, account_from_token);
        let client = Client::new();
        let response_body = client
            .post(uri, body)
            .await
            .map_err(|e| Error::new(e.to_string()))?;
        Ok(response_body)
    }

    #[graphql(name = "transactionsByAccount")]
    async fn transactions_by_account(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "account_name")] account_name: String,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Result<Vec<Transaction>, Error> {
        let account_from_token = get_auth_account(ctx, auth_account)?;
        let uri = Uri::new_from_env_var("TRANSACTIONS_BY_ACCOUNT_URL").to_string();
        let body = account_auth(account_name, account_from_token);
        let client = Client::new();
        let response_body = client
            .post(uri, body)
            .await
            .map_err(|e| Error::new(e.to_string()))?;
        let parsed: IntraTransactions = serde_json::from_str(&response_body)
            .map_err(|e| Error::new(format!("failed to parse response: {e}")))?;
        Ok(parsed.transactions.0)
    }

    #[graphql(name = "transactionByID")]
    async fn transaction_by_id(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "id")] id: String,
        #[graphql(name = "account_name")] account_name: String,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Result<Transaction, Error> {
        let account_from_token = get_auth_account(ctx, auth_account)?;
        let uri = Uri::new_from_env_var("TRANSACTION_BY_ID_URL").to_string();
        let body = id_account_auth(id, account_name, account_from_token);
        let client = Client::new();
        let response_body = client
            .post(uri, body)
            .await
            .map_err(|e| Error::new(e.to_string()))?;
        let intra_transaction: IntraTransaction = serde_json::from_str(&response_body)
            .map_err(|e| Error::new(format!("failed to parse response: {e}")))?;
        Ok(intra_transaction.transaction)
    }

    #[graphql(name = "requestsByAccount")]
    async fn requests_by_account(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "account_name")] account_name: String,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Result<Vec<Transaction>, Error> {
        let account_from_token = get_auth_account(ctx, auth_account)?;
        let uri = Uri::new_from_env_var("REQUESTS_BY_ACCOUNT_URL").to_string();
        let body = account_auth(account_name, account_from_token);
        let client = Client::new();
        let response_body = client
            .post(uri, body)
            .await
            .map_err(|e| Error::new(e.to_string()))?;
        let parsed: IntraTransactions = serde_json::from_str(&response_body)
            .map_err(|e| Error::new(format!("failed to parse response: {e}")))?;
        Ok(parsed.transactions.0)
    }

    #[graphql(name = "requestByID")]
    async fn request_by_id(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "id")] id: String,
        #[graphql(name = "account_name")] account_name: String,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Result<Transaction, Error> {
        let account_from_token = get_auth_account(ctx, auth_account)?;
        let uri = Uri::new_from_env_var("REQUEST_BY_ID_URL").to_string();
        let body = id_account_auth(id, account_name, account_from_token);
        let client = Client::new();
        let response_body = client
            .post(uri, body)
            .await
            .map_err(|e| Error::new(e.to_string()))?;
        let intra_transaction: IntraTransaction = serde_json::from_str(&response_body)
            .map_err(|e| Error::new(format!("failed to parse response: {e}")))?;
        Ok(intra_transaction.transaction)
    }

    #[graphql(name = "rules")]
    async fn rules(
        &self,
        #[graphql(name = "transaction")] transaction: Transaction,
    ) -> Result<Transaction, Error> {
        let uri = Uri::new_from_env_var("RULE_URL").to_string();
        let body = json!(transaction).to_string();
        let client = Client::new();
        let response_body = client
            .post(uri, body)
            .await
            .map_err(|e| Error::new(e.to_string()))?;
        let intra_transaction: IntraTransaction = serde_json::from_str(&response_body)
            .map_err(|e| Error::new(format!("failed to parse response: {e}")))?;
        Ok(intra_transaction.transaction)
    }
}

struct Mutation;

#[Object]
impl Mutation {
    async fn create_request(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "transaction")] transaction: Transaction,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Result<Transaction, Error> {
        let account_from_token = get_auth_account(ctx, auth_account)?;
        let uri = Uri::new_from_env_var("REQUEST_CREATE_URL").to_string();
        let request = IntraTransaction::new(account_from_token, transaction);
        let body = json!(request).to_string();
        let client = Client::new();
        let response_body = client
            .post(uri, body)
            .await
            .map_err(|e| Error::new(e.to_string()))?;
        let intra_transaction: IntraTransaction = serde_json::from_str(&response_body)
            .map_err(|e| Error::new(format!("failed to parse response: {e}")))?;
        Ok(intra_transaction.transaction)
    }

    async fn approve_request(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "id")] transaction_id: String,
        #[graphql(name = "account_name")] account_name: String,
        #[graphql(name = "account_role")] account_role: AccountRole,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Result<Transaction, Error> {
        let account_from_token = get_auth_account(ctx, auth_account)?;
        let uri = Uri::new_from_env_var("REQUEST_APPROVE_URL").to_string();
        let request = RequestApprove::new(
            account_from_token,
            transaction_id,
            account_name,
            account_role,
        );
        let body = json!(request).to_string();
        let client = Client::new();
        let response_body = client
            .post(uri, body)
            .await
            .map_err(|e| Error::new(e.to_string()))?;
        let intra_transaction: IntraTransaction = serde_json::from_str(&response_body)
            .map_err(|e| Error::new(format!("failed to parse response: {e}")))?;
        Ok(intra_transaction.transaction)
    }
}

struct Subscription;

#[Subscription]
impl Subscription {
    async fn query_gdp(
        &self,
        _ctx: &Context<'_>,
        #[graphql(name = "date")] date: String,
        #[graphql(name = "country")] country: Option<String>,
        #[graphql(name = "region")] region: Option<String>,
        #[graphql(name = "municipality")] municipality: Option<String>,
    ) -> impl Stream<Item = f64> {
        stream! {
            let resource = match envvar::required("MEASURE_RESOURCE") {
                Ok(r) => r,
                Err(e) => {
                    tracing::error!("{}", e);
                    return;
                }
            };
            let uri = Uri::new_from_env_var("MEASURE_URL")
                .with_path(resource.as_str())
                .with_ws()
                .to_string();
            let ws_client = WsClient::new(uri, "gdp".to_string(), date, country, region, municipality);

            let measure_socket = match ws_client.connect().await {
                Ok(ws) => {
                    tracing::info!("graphql websocket connection created with measure");
                    ws
                }
                Err(_e) => {
                    tracing::info!("graphql failed to create webSocket with measure: {:?}", _e);
                    return;
                }
            };

            // the async-graphql crate limits the scope of the websocket lifecycle to where its upgraded:
            // https://github.com/async-graphql/async-graphql/issues/1022#issuecomment-1214541591
            // this means it cant send a close message to the measure service from inside the subscription
            // todo: add on_close(closed) callback support to graphql subscription context so
            // a close message can be written/sent to the measure service
            let (_write, mut read) = measure_socket.split();

            loop {
                match read.next().await {
                    Some(Ok(msg)) => {
                        match msg {
                            tungstenite::Message::Text(text) => {
                                match serde_json::from_str::<f64>(&text) {
                                    Ok(gdp) => {
                                        tracing::info!("sending gdp from measure: {}", gdp);
                                        yield gdp;
                                    }
                                    Err(e) => {
                                        tracing::error!("failed to parse gdp value from measure: {}", e);
                                    }
                                }
                            }
                            _ => {
                                tracing::info!("received non-text message from measure: {:?}", msg);
                            }
                        }
                    }
                    Some(Err(e)) => {
                        match e {
                            WsError::ConnectionClosed => {
                                tracing::info!("graphql received closed message from measure");
                            }
                            _ => {
                                tracing::info!("graphql message receipt failure from measure: {:?}", e);
                            }
                        }
                        break;
                    }
                    None => {
                        tracing::info!("graphql received closed message from measure");
                        break;
                    }
                }
            }
        }
    }
}

fn account_auth(account_name: String, auth_account: String) -> String {
    json!({
        "account_name": account_name,
        "auth_account": auth_account
    })
    .to_string()
}

fn id_account_auth(id: String, account_name: String, auth_account: String) -> String {
    json!({
        "id": id,
        "account_name": account_name,
        "auth_account": auth_account,
    })
    .to_string()
}

fn get_auth_account(ctx: &Context<'_>, account_from_request: String) -> Result<String, Error> {
    if env::var("ENABLE_API_AUTH") == Ok("true".to_string()) {
        let headers = ctx.data::<HeaderMap>()?;
        let amzn_ctx = get_amzn_ctx_from_headers(headers)?;
        let authorizer = amzn_ctx
            .authorizer
            .ok_or_else(|| Error::new("missing authorizer"))?;
        let jwt = authorizer
            .jwt
            .ok_or_else(|| Error::new("missing jwt in authorizer"))?;
        let username = jwt
            .claims
            .get("cognito:username")
            .ok_or_else(|| Error::new("missing cognito:username claim"))?;
        Ok(username.to_string())
    } else {
        Ok(account_from_request)
    }
}

fn get_amzn_ctx_from_headers(headers: &HeaderMap) -> Result<ApiGatewayV2httpRequestContext, Error> {
    let value = headers
        .get("x-amzn-request-context")
        .ok_or_else(|| Error::new("missing x-amzn-request-context header"))?;
    let value_str = value
        .to_str()
        .map_err(|e| Error::new(format!("invalid x-amzn-request-context header: {e}")))?;
    serde_json::from_str(value_str)
        .map_err(|e| Error::new(format!("failed to parse x-amzn-request-context: {e}")))
}

async fn graphiql() -> impl IntoResponse {
    let graphql_resource = envvar::required("GRAPHQL_RESOURCE").unwrap();
    let graphql_ws_resource = envvar::required("GRAPHQL_WS_RESOURCE").unwrap();
    response::Html(
        http::GraphiQLSource::build()
            .endpoint(format!("/{graphql_resource}").as_str())
            .subscription_endpoint(format!("/{graphql_ws_resource}").as_str())
            .finish(),
    )
}

async fn graphql_subscription(
    State(schema): State<Schema<Query, Mutation, Subscription>>,
    protocol: GraphQLProtocol,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    ws.protocols(http::ALL_WEBSOCKET_PROTOCOLS)
        .on_upgrade(move |socket| async move {
            tracing::info!("graphql subscription started");
            GraphQLWebSocket::new(socket, schema, protocol)
                .keepalive_timeout(None)
                .serve()
                .await;
            tracing::info!("graphql subscription closed");
        })
}

async fn graphql(
    State(schema): State<Schema<Query, Mutation, Subscription>>,
    headers: HeaderMap,
    req: GraphQLRequest,
) -> GraphQLResponse {
    let mut req = req.into_inner();
    // reattach headers to request
    req = req.data(headers);
    schema.execute(req).await.into()
}

#[tokio::main]
async fn main() {
    if let Ok(level) = env::var("RUST_LOG") {
        tracing_subscriber::fmt().with_env_filter(level).init();
    } else {
        tracing_subscriber::fmt().init();
    }

    let readiness_check_path = envvar::required(READINESS_CHECK_PATH).unwrap();

    let schema = Schema::build(Query, Mutation, Subscription).finish();

    let graphql_resource = envvar::required("GRAPHQL_RESOURCE").unwrap();
    let graphql_ws_resource = envvar::required("GRAPHQL_WS_RESOURCE").unwrap();

    let app = Router::new()
        .route("/", get(graphiql))
        .route(format!("/{graphql_resource}").as_str(), post(graphql))
        .route(
            readiness_check_path.as_str(), // absolute path so format not used
            get(|| async { StatusCode::OK }),
        )
        .route(
            format!("/{graphql_ws_resource}").as_str(),
            get(graphql_subscription),
        )
        .layer(CorsLayer::permissive())
        .with_state(schema);

    let hostname_or_ip = envvar::optional("HOSTNAME_OR_IP", "0.0.0.0");

    let port = envvar::required("GRAPHQL_PORT").unwrap();

    let serve_addr = format!("{hostname_or_ip}:{port}");

    let mut addrs_iter = serve_addr.to_socket_addrs().unwrap_or(
        format!("{hostname_or_ip}:{port}")
            .to_socket_addrs()
            .unwrap(),
    );

    let addr = addrs_iter.next().unwrap();

    tracing::info!("listening on {}", addr);

    axum::serve(TcpListener::bind(addr).await.unwrap(), app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}
