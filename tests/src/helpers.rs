use crate::requests as r;
use ::types::{
    account_role::AccountRole, request_response::IntraTransaction,
    request_response::RequestApprove, transaction::Transaction,
};
use httpclient::HttpClient as Client;
use serde_json::json;
use std::{env, fs::File, io::BufReader, process::Command};

pub fn restore_testseed() {
    if env::var("AWS_LAMBDA_FUNCTION_NAME").ok().is_some() {
        let restore_output = Command::new("make")
            .arg("-C")
            .arg("../migrations/dumps")
            .arg("restore-rds-testseed")
            .arg("ENV=dev") // cadet todo: assigned ENV from env var
            .output()
            .expect("failed to execute process");

        // cargo test -- --show-output
        let restore_output_str = String::from_utf8(restore_output.stdout).expect("Not UTF8");
        println!("{}", restore_output_str);
    } else {
        let restore_output = Command::new("make")
            .arg("-C")
            .arg("../migrations/dumps")
            .arg("restore-testseed")
            .output()
            .expect("failed to execute process");

        // cargo test -- --show-output
        let _restore_output_str = String::from_utf8(restore_output.stdout).expect("Not UTF8");
        // println!("{}", _restore_output_str); // comment in to print db restore output
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
    let approve_request_uri = env::var("REQUEST_APPROVE_URL").unwrap();
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