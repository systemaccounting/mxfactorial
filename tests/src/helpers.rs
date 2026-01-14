use crate::requests as r;
use ::types::{
    account_role::AccountRole, request_response::IntraTransaction,
    request_response::RequestApprove, transaction::Transaction,
};
use httpclient::HttpClient as Client;
use serde_json::json;
use std::{env, fs::File, io::BufReader, process::Command};
use uribuilder::Uri;

pub fn restore_testseed() {
    // cloud dev env
    if env::var("AWS_LAMBDA_FUNCTION_NAME").ok().is_some() {
        let restore_output = Command::new("bash")
            .arg("scripts/go-migrate-rds.sh")
            .arg("--env")
            .arg("dev")
            .arg("--cmd")
            .arg("reset")
            .current_dir("..")
            .output()
            .expect("failed to execute process");

        if !restore_output.clone().stderr.is_empty() {
            let restore_output_str = String::from_utf8(restore_output.stderr).expect("Not UTF8");
            println!("{restore_output_str}");
        }
        if !restore_output.stdout.is_empty() {
            let restore_output_str = String::from_utf8(restore_output.stdout).expect("Not UTF8");
            println!("{restore_output_str}");
        }
    } else {
        // local env
        let restore_output = Command::new("docker")
            .arg("compose")
            .arg("-f")
            .arg("docker/storage.yaml")
            .arg("run")
            .arg("--rm")
            .arg("go-migrate")
            .arg("--db_type")
            .arg("test")
            .arg("--cmd")
            .arg("reset")
            .current_dir("..")
            .output()
            .expect("failed to execute process");

        // cargo test -- --show-output
        if !restore_output.clone().stderr.is_empty() {
            let restore_output_str = String::from_utf8(restore_output.stderr).expect("Not UTF8");
            println!("{restore_output_str}");
        }
        if !restore_output.stdout.is_empty() {
            let _restore_output_str = String::from_utf8(restore_output.stdout).expect("Not UTF8");
            // println!("{}", _restore_output_str); // comment in to print db restore output
        }
    }
}

pub async fn create_transaction() -> Transaction {
    // load test transaction from file
    let file = File::open("../tests/testdata/transNoAppr.json").unwrap();
    let reader = BufReader::new(file);
    let test_intra_transaction: IntraTransaction = serde_json::from_reader(reader).unwrap();

    // create a transaction request from test transaction
    let create_request = r::create_request_http(
        test_intra_transaction.transaction.author.clone().unwrap(),
        test_intra_transaction.transaction.transaction_items.clone(),
    )
    .await;

    // save the debit approver and transaction id from transaction request
    let debit_approver = create_request.transaction_items.0[0].debitor.clone();
    let transaction_id = create_request.id.clone().unwrap();

    // approve the transaction request using the debit approver and transaction id
    let approve_request_uri = Uri::new_from_env_var("REQUEST_APPROVE_URL").to_string();
    let approve_request_body = RequestApprove::new(
        debit_approver.clone(),
        transaction_id,
        debit_approver,
        AccountRole::Debitor,
    );
    let approve_request_body_json = json!(approve_request_body).to_string();
    let client = Client::new();
    let approve_request_response = client
        .post(approve_request_uri, approve_request_body_json)
        .await
        .unwrap();
    let approve_request_response_body = approve_request_response.text().await.unwrap();
    let approve_request: IntraTransaction =
        serde_json::from_str(&approve_request_response_body).unwrap();
    approve_request.transaction
}

use aws_sdk_dynamodb::{types::AttributeValue, Client as DdbClient};

pub async fn get_cached_state_rule(state: &str) -> String {
    let key = format!("rules:state:creditor:{}", state);
    if env::var("AWS_LAMBDA_FUNCTION_NAME").is_ok() {
        ddb_query(&key).await.remove(0)
    } else {
        let client = redisclient::RedisClient::new().await;
        client.init().await.unwrap();
        client.smembers(&key).await.unwrap().remove(0)
    }
}

pub async fn set_cached_state_rule(state: &str, old: &str, new: &str) {
    let key = format!("rules:state:creditor:{}", state);
    if env::var("AWS_LAMBDA_FUNCTION_NAME").is_ok() {
        let old_json: serde_json::Value = serde_json::from_str(old).unwrap();
        let sk = old_json["id"].as_str().unwrap();
        ddb_put(&key, sk, new).await;
    } else {
        let client = redisclient::RedisClient::new().await;
        client.init().await.unwrap();
        client.srem(&key, old).await.unwrap();
        client.sadd(&key, new).await.unwrap();
    }
}

async fn ddb_query(pk: &str) -> Vec<String> {
    let config = aws_config::load_defaults(aws_config::BehaviorVersion::latest()).await;
    let client = DdbClient::new(&config);
    let table = env::var("TRANSACTION_DDB_TABLE").unwrap();
    let result = client
        .query()
        .table_name(&table)
        .key_condition_expression("#pk = :pk")
        .expression_attribute_names("#pk", "pk")
        .expression_attribute_values(":pk", AttributeValue::S(pk.to_string()))
        .send()
        .await
        .unwrap();
    result
        .items
        .unwrap_or_default()
        .iter()
        .filter_map(|item| item.get("data").and_then(|v| v.as_s().ok()).cloned())
        .collect()
}

async fn ddb_put(pk: &str, sk: &str, data: &str) {
    let config = aws_config::load_defaults(aws_config::BehaviorVersion::latest()).await;
    let client = DdbClient::new(&config);
    let table = env::var("TRANSACTION_DDB_TABLE").unwrap();
    client
        .put_item()
        .table_name(&table)
        .item("pk", AttributeValue::S(pk.to_string()))
        .item("sk", AttributeValue::S(sk.to_string()))
        .item("data", AttributeValue::S(data.to_string()))
        .send()
        .await
        .unwrap();
}
