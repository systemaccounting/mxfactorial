use ::types::{
    account_role::AccountRole,
    request_response::{IntraTransaction, IntraTransactions, RequestApprove},
    transaction::Transaction,
    transaction_item::{TransactionItem, TransactionItems},
};
use ::wsclient::WsClient;
use async_graphql::*;
use async_graphql_axum::{GraphQL, GraphQLProtocol, GraphQLWebSocket};
use async_stream::stream;
use aws_lambda_events::event::apigw::ApiGatewayV2httpRequestContext;
use axum::{
    extract::{State, WebSocketUpgrade},
    http::{HeaderMap, StatusCode},
    response::{self, IntoResponse},
    routing::get,
    Router,
};
use futures_util::{stream::Stream, StreamExt};
use httpclient::HttpClient as Client;
use serde_json::json;
use shutdown::shutdown_signal;
use std::{env, net::ToSocketAddrs, result::Result};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use tungstenite::error::Error as WsError;
use uribuilder::Uri;

const READINESS_CHECK_PATH: &str = "READINESS_CHECK_PATH";
const GRAPHQL_RESOURCE: &str = "query";
const SUBSCRIPTION_RESOURCE: &str = "ws";

struct Query;

#[Object]
impl Query {
    async fn balance(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "account_name")] account_name: String,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> String {
        let account_from_token = get_auth_account(ctx, auth_account).unwrap();
        let uri = Uri::new_from_env_var("BALANCE_BY_ACCOUNT_URL").to_string();
        let body = account_auth(account_name, account_from_token);
        let client = Client::new();
        let response = client.post(uri, body).await.unwrap();
        response.text().await.unwrap()
    }

    #[graphql(name = "transactionsByAccount")]
    async fn transactions_by_account(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "account_name")] account_name: String,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Vec<Transaction> {
        let account_from_token = get_auth_account(ctx, auth_account).unwrap();
        let uri = Uri::new_from_env_var("TRANSACTIONS_BY_ACCOUNT_URL").to_string();
        let body = account_auth(account_name, account_from_token);
        let client = Client::new();
        let response = client.post(uri, body).await.unwrap();
        let response_body = response.text().await.unwrap();
        let response_body: IntraTransactions = serde_json::from_str(&response_body).unwrap();
        response_body.transactions.0
    }

    #[graphql(name = "transactionByID")]
    async fn transaction_by_id(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "id")] id: String,
        #[graphql(name = "account_name")] account_name: String,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Transaction {
        let account_from_token = get_auth_account(ctx, auth_account).unwrap();
        let uri = Uri::new_from_env_var("TRANSACTION_BY_ID_URL").to_string();
        let body = id_account_auth(id, account_name, account_from_token);
        let client = Client::new();
        let response = client.post(uri, body).await.unwrap();
        let response_body = response.text().await.unwrap();
        let intra_transaction: IntraTransaction = serde_json::from_str(&response_body).unwrap();
        intra_transaction.transaction
    }

    #[graphql(name = "requestsByAccount")]
    async fn requests_by_account(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "account_name")] account_name: String,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Vec<Transaction> {
        let account_from_token = get_auth_account(ctx, auth_account).unwrap();
        let uri = Uri::new_from_env_var("REQUESTS_BY_ACCOUNT_URL").to_string();
        let client = Client::new();
        let body = account_auth(account_name, account_from_token);
        let response = client.post(uri, body).await.unwrap();
        let response_body = response.text().await.unwrap();
        let response_body: IntraTransactions = serde_json::from_str(&response_body).unwrap();
        response_body.transactions.0
    }

    #[graphql(name = "requestByID")]
    async fn request_by_id(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "id")] id: String,
        #[graphql(name = "account_name")] account_name: String,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Transaction {
        let account_from_token = get_auth_account(ctx, auth_account).unwrap();
        let uri = Uri::new_from_env_var("REQUEST_BY_ID_URL").to_string();
        let body = id_account_auth(id, account_name, account_from_token);
        let client = Client::new();
        let response = client.post(uri, body).await.unwrap();
        let response_body = response.text().await.unwrap();
        let intra_transaction: IntraTransaction = serde_json::from_str(&response_body).unwrap();
        intra_transaction.transaction
    }

    #[graphql(name = "rules")]
    async fn rules(
        &self,
        #[graphql(name = "transaction_items")] transaction_items: Vec<TransactionItem>,
    ) -> Transaction {
        let uri = Uri::new_from_env_var("RULE_URL").to_string();
        let client = Client::new();
        let body = json!(transaction_items).to_string();
        let response = client.post(uri, body).await.unwrap();
        let response_body = response.text().await.unwrap();
        let intra_transaction: IntraTransaction = serde_json::from_str(&response_body).unwrap();
        intra_transaction.transaction
    }
}

struct Mutation;

#[Object]
impl Mutation {
    async fn create_request(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "transaction_items")] transaction_items: Vec<TransactionItem>,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Transaction {
        let account_from_token = get_auth_account(ctx, auth_account).unwrap();
        let uri = Uri::new_from_env_var("REQUEST_CREATE_URL").to_string();
        let client = Client::new();
        let request = IntraTransaction::new(
            account_from_token.clone(),
            Transaction::new(
                account_from_token,
                None,
                TransactionItems::from(transaction_items),
            ),
        );
        let body = json!(request).to_string();
        let response = client.post(uri, body).await.unwrap();
        let response_body = response.text().await.unwrap();
        let intra_transaction: IntraTransaction = serde_json::from_str(&response_body).unwrap();
        intra_transaction.transaction
    }

    async fn approve_request(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "id")] transaction_id: String,
        #[graphql(name = "account_name")] account_name: String,
        #[graphql(name = "account_role")] account_role: AccountRole,
        #[graphql(name = "auth_account")] auth_account: String,
    ) -> Transaction {
        let account_from_token = get_auth_account(ctx, auth_account).unwrap();
        let uri = Uri::new_from_env_var("REQUEST_APPROVE_URL").to_string();
        let client = Client::new();
        let request = RequestApprove::new(
            account_from_token,
            transaction_id,
            account_name,
            account_role,
        );
        let body = json!(request).to_string();
        let response = client.post(uri, body).await.unwrap();
        let response_body = response.text().await.unwrap();
        let intra_transaction: IntraTransaction = serde_json::from_str(&response_body).unwrap();
        intra_transaction.transaction
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
        let resource = env::var("MEASURE_RESOURCE").unwrap();
        let uri = Uri::new_from_env_var("MEASURE_URL")
            .with_path(resource.as_str())
            .with_ws()
            .to_string();
        let ws_client = WsClient::new(uri, "gdp".to_string(), date, country, region, municipality);
        stream! {
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
                                let gdp: f64 = serde_json::from_str(&text).unwrap();
                                tracing::info!("sending gdp from measure: {}", gdp);
                                yield gdp;
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
        let headers = ctx.data::<HeaderMap>().unwrap();
        let amzn_ctx = get_amzn_ctx_from_headers(headers);
        match amzn_ctx.authorizer {
            Some(authorizer) => Ok(authorizer
                .jwt
                .unwrap()
                .claims
                .get("cognito:username")
                .unwrap()
                .to_string()),
            None => {
                tracing::error!("error: missing authorizer");
                Err("error: missing authorizer".into())
            }
        }
    } else {
        Ok(account_from_request)
    }
}

fn get_amzn_ctx_from_headers(headers: &HeaderMap) -> ApiGatewayV2httpRequestContext {
    headers
        .get("x-amzn-request-context")
        .and_then(|value| serde_json::from_str(value.to_str().unwrap()).ok())
        .unwrap()
}

async fn graphiql() -> impl IntoResponse {
    response::Html(
        http::GraphiQLSource::build()
            .endpoint(format!("/{}", GRAPHQL_RESOURCE).as_str())
            .subscription_endpoint(format!("/{}", SUBSCRIPTION_RESOURCE).as_str())
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

#[tokio::main]
async fn main() {
    if let Ok(level) = env::var("RUST_LOG") {
        tracing_subscriber::fmt().with_env_filter(level).init();
    } else {
        tracing_subscriber::fmt().init();
    }

    let readiness_check_path = env::var(READINESS_CHECK_PATH)
        .unwrap_or_else(|_| panic!("{READINESS_CHECK_PATH} variable assignment"));

    let schema = Schema::build(Query, Mutation, Subscription).finish();

    let app = Router::new()
        .route("/", get(graphiql))
        .route_service(
            format!("/{}", GRAPHQL_RESOURCE).as_str(),
            GraphQL::new(schema.clone()),
        )
        .route(
            readiness_check_path.as_str(), // absolute path so format not used
            get(|| async { StatusCode::OK }),
        )
        .route(
            format!("/{}", SUBSCRIPTION_RESOURCE).as_str(),
            get(graphql_subscription),
        )
        .layer(CorsLayer::permissive())
        .with_state(schema);

    let hostname_or_ip = env::var("HOSTNAME_OR_IP").unwrap_or("0.0.0.0".to_string());

    let port = env::var("GRAPHQL_PORT").unwrap();

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
