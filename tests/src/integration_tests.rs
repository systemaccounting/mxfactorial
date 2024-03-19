use crate::helpers as h;
use dotenvy::dotenv;

fn _before_each() {
    h::restore_testseed();
    dotenv().expect(".env file not found");
}

// cadet todo: assert all response values
#[cfg(test)]
mod tests {
    use super::*;
    use crate::requests as r;
    use regex::Regex;
    use serde::Deserialize;
    use std::{fs::File, io::BufReader};
    use types::{
        account_role::AccountRole, request_response::IntraTransaction,
        transaction_item::TransactionItem,
    };

    // https://stackoverflow.com/a/3143231
    const DATE_RE: &str =
        r"\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)";

    #[derive(Debug, Deserialize)]
    pub struct TransactionItemsBody {
        pub transaction_items: Vec<TransactionItem>,
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn http_rule_adds_2_objects() {
        _before_each();

        let file = File::open("../pkg/testdata/nullFirstTrItemsNoAppr.json").unwrap();
        let reader = BufReader::new(file);
        let test_transaction_items: Vec<TransactionItem> = serde_json::from_reader(reader).unwrap();

        let got = r::get_rules_http(test_transaction_items.clone()).await;
        let got_rule_added_transaction_items: Vec<TransactionItem> = got
            .transaction
            .transaction_items
            .0
            .into_iter()
            .filter(|tr_item| -> bool { tr_item.rule_instance_id.is_some() })
            .collect();
        assert_eq!(got_rule_added_transaction_items.len(), 2); // want 2 rule added transaction item tax objects

        let mut tax_total: f32 = 0.0;
        for tr_item in got_rule_added_transaction_items {
            // parse strigs as floats
            let price = tr_item.price.parse::<f32>().unwrap();
            let quantity = tr_item.quantity.parse::<f32>().unwrap();
            tax_total += price * quantity;
        }
        // format tax total to 3 decimal places
        tax_total = format!("{:.3}", tax_total).parse::<f32>().unwrap();
        assert_eq!(tax_total, 1.620) // want 1.620 tax total
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn http_request_create_creates_a_request() {
        _before_each();

        let file = File::open("../pkg/testdata/transNoAppr.json").unwrap();
        let reader = BufReader::new(file);
        let test_intra_transaction: IntraTransaction = serde_json::from_reader(reader).unwrap();

        let test_transaction = r::create_request_http(
            test_intra_transaction.auth_account.unwrap(),
            test_intra_transaction.transaction.transaction_items.clone(),
        )
        .await;

        let iso8601: Regex = Regex::new(DATE_RE).unwrap();

        for tr_item in test_transaction.transaction_items.0 {
            assert!(tr_item.debitor_approval_time.is_none());
            assert!(iso8601.is_match(
                tr_item
                    .creditor_approval_time
                    .unwrap()
                    .to_milli_tz()
                    .as_str()
            ));
            if let Some(approvals) = tr_item.approvals {
                for approval in approvals.0.into_iter() {
                    if approval.account_role == AccountRole::Debitor {
                        assert!(approval.approval_time.is_none()); // want an absent timestamp for debitor approval
                    } else {
                        assert!(iso8601.is_match(
                            // want a timestamp for creditor approval
                            approval.approval_time.unwrap().to_milli_tz().as_str()
                        ));
                    }
                }
            }
        }
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn http_request_approve_approves_a_request() {
        _before_each();

        let file = File::open("../pkg/testdata/transNoAppr.json").unwrap();
        let reader = BufReader::new(file);
        let test_intra_transaction: IntraTransaction = serde_json::from_reader(reader).unwrap();

        let test_transaction = r::create_request_http(
            test_intra_transaction.auth_account.unwrap(),
            test_intra_transaction.transaction.transaction_items.clone(),
        )
        .await;

        let test_debitor = test_intra_transaction.transaction.transaction_items.0[0]
            .debitor
            .clone();

        let got = r::approve_request_http(
            test_transaction.id.unwrap(),
            test_debitor.clone(),
            "debitor".to_string(),
            test_debitor,
        )
        .await;

        let iso8601: Regex = Regex::new(DATE_RE).unwrap();

        assert!(iso8601.is_match(got.equilibrium_time.unwrap().to_milli_tz().as_str()));
        assert_eq!(got.transaction_items.0.len(), 6);

        for tr_item in got.transaction_items.0 {
            assert!(iso8601.is_match(
                tr_item
                    .debitor_approval_time
                    .unwrap()
                    .to_milli_tz()
                    .as_str()
            ));
            for approval in tr_item.approvals.unwrap().0 {
                if approval.account_role == AccountRole::Debitor {
                    assert!(
                        iso8601.is_match(approval.approval_time.unwrap().to_milli_tz().as_str())
                    );
                }
            }
        }
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn http_balance_account_returns_account_balance_changes() {
        _before_each();

        // create a test transaction
        h::create_transaction().await;

        let grocery_store_balance =
            r::get_account_balance_http(String::from("GroceryStore"), String::from("GroceryStore"))
                .await;

        let jacob_webb_balance =
            r::get_account_balance_http(String::from("JacobWebb"), String::from("JacobWebb")).await;

        let state_of_california_balance = r::get_account_balance_http(
            String::from("StateOfCalifornia"),
            String::from("StateOfCalifornia"),
        )
        .await;

        assert_eq!(grocery_store_balance, "1020.000");
        assert_eq!(jacob_webb_balance, "978.200");
        assert_eq!(state_of_california_balance, "1001.800");
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn http_transaction_by_id_returns_a_transaction_by_id() {
        _before_each();

        // create a test transaction
        let test_transaction = h::create_transaction().await;

        let debitor = test_transaction.transaction_items.0[0].debitor.clone();

        let got = r::get_transaction_by_id_http(
            debitor.clone(),
            debitor,
            test_transaction.id.clone().unwrap(),
        )
        .await;

        let iso8061: Regex = Regex::new(DATE_RE).unwrap();

        assert_eq!(got.transaction.id.unwrap(), String::from("3")); // want id of 3
        assert!(iso8061.is_match(
            got.transaction
                .equilibrium_time
                .unwrap()
                .to_milli_tz()
                .as_str()
        )); // want a timestamp in equilibrium_time
        assert_eq!(got.transaction.transaction_items.0.len(), 6); // want 6 transaction items

        for tr_item in got.transaction.transaction_items.0 {
            assert!(iso8061.is_match(
                tr_item
                    .debitor_approval_time // want a timestamp in debitor_approval_time
                    .unwrap()
                    .to_milli_tz()
                    .as_str()
            ));
            assert!(iso8061.is_match(
                tr_item
                    .creditor_approval_time // want a timestamp in creditor_approval_time
                    .unwrap()
                    .to_milli_tz()
                    .as_str()
            ));
        }
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn http_transactions_by_account_returns_transactions_by_account() {
        _before_each();

        // create a test transaction
        h::create_transaction().await;

        // create a second test transaction
        let second_transaction = h::create_transaction().await;

        let debitor = second_transaction.transaction_items.0[0].debitor.clone();

        let got = r::get_transactions_by_account_http(debitor.clone(), debitor).await;

        let iso8061: Regex = Regex::new(DATE_RE).unwrap();

        assert_eq!(got.transactions.0.len(), 2); // want 2 transactions
        for tr in got.transactions.0 {
            assert!(iso8061.is_match(tr.equilibrium_time.unwrap().to_milli_tz().as_str())); // want a timestamp in equilibrium_time
            assert_eq!(tr.transaction_items.0.len(), 6); // want 6 transaction items
            for tr_item in tr.transaction_items.0 {
                assert!(iso8061.is_match(
                    tr_item
                        .debitor_approval_time // want a timestamp in debitor_approval_time
                        .unwrap()
                        .to_milli_tz()
                        .as_str()
                ));
                assert!(iso8061.is_match(
                    tr_item
                        .creditor_approval_time // want a timestamp in creditor_approval_time
                        .unwrap()
                        .to_milli_tz()
                        .as_str()
                ));
            }
        }
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn http_request_by_id_returns_a_request_by_id() {
        _before_each();

        let file = File::open("../pkg/testdata/transNoAppr.json").unwrap();
        let reader = BufReader::new(file);
        let test_intra_transaction: IntraTransaction = serde_json::from_reader(reader).unwrap();

        let create_request = r::create_request_http(
            test_intra_transaction.auth_account.unwrap(),
            test_intra_transaction.transaction.transaction_items.clone(),
        )
        .await;

        let debitor = test_intra_transaction.transaction.transaction_items.0[0]
            .debitor
            .clone();

        let got =
            r::get_request_by_id_http(debitor.clone(), debitor, create_request.id.unwrap()).await;

        let iso8061: Regex = Regex::new(DATE_RE).unwrap();

        assert_eq!(got.transaction.id.unwrap(), String::from("3")); // want id of 3
        assert!(got.transaction.equilibrium_time.is_none()); // want an absent timestamp in equilibrium_time
        assert_eq!(got.transaction.transaction_items.0.len(), 6); // want 6 transaction items

        for tr_item in got.transaction.transaction_items.0 {
            assert!(tr_item
                .debitor_approval_time // want an absent timestamp in debitor_approval_time
                .is_none());
            assert!(iso8061.is_match(
                tr_item
                    .creditor_approval_time // want a timestamp in creditor_approval_time
                    .unwrap()
                    .to_milli_tz()
                    .as_str()
            ));
        }
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn http_requests_by_account_returns_requests_by_account() {
        _before_each();

        let file = File::open("../pkg/testdata/transNoAppr.json").unwrap();
        let reader = BufReader::new(file);
        let mut test_intra_transaction: IntraTransaction = serde_json::from_reader(reader).unwrap();

        let debitor = String::from("AaronHill");

        for tr_item in test_intra_transaction
            .transaction
            .transaction_items
            .0
            .iter_mut()
        {
            tr_item.debitor = debitor.clone();
        }

        let wanted_transaction_requests = 2;

        for _ in 0..wanted_transaction_requests {
            r::create_request_http(
                test_intra_transaction.auth_account.clone().unwrap(),
                test_intra_transaction.transaction.transaction_items.clone(),
            )
            .await;
        }

        let got = r::get_requests_by_account_http(debitor.clone(), debitor).await;

        let iso8061: Regex = Regex::new(DATE_RE).unwrap();

        assert_eq!(got.transactions.0.len(), wanted_transaction_requests); // want 2 transaction requests
        for tr in got.transactions.0 {
            assert!(tr.equilibrium_time.is_none()); // want an absent timestamp in equilibrium_time
            assert_eq!(tr.transaction_items.0.len(), 6); // want 6 transaction items
            for tr_item in tr.transaction_items.0 {
                assert!(tr_item
                    .debitor_approval_time // want an absent timestamp in debitor_approval_time
                    .is_none());
                assert!(iso8061.is_match(
                    tr_item
                        .creditor_approval_time // want a timestamp in creditor_approval_time
                        .unwrap()
                        .to_milli_tz()
                        .as_str()
                ));
            }
        }
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn graphql_creates_a_request() {
        _before_each();

        let file = File::open("../pkg/testdata/intRules.json").unwrap();
        let reader = BufReader::new(file);
        let test_transaction_items: TransactionItemsBody = serde_json::from_reader(reader).unwrap();

        let rule_tested_transaction =
            r::get_rules_gql(test_transaction_items.transaction_items.clone())
                .await
                .unwrap();

        let got = r::create_request_gql(
            test_transaction_items.transaction_items[0].creditor.clone(),
            rule_tested_transaction.transaction_items.0,
        )
        .await;

        assert!(got.equilibrium_time.is_none());
        assert_eq!(got.transaction_items.0.len(), 6);
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn graphql_approves_a_request() {
        _before_each();

        let file = File::open("../pkg/testdata/intRules.json").unwrap();
        let reader = BufReader::new(file);
        let test_transaction_items: TransactionItemsBody = serde_json::from_reader(reader).unwrap();

        let rule_tested_transaction =
            r::get_rules_gql(test_transaction_items.transaction_items.clone())
                .await
                .unwrap();

        let test_creditor = test_transaction_items.transaction_items[0].creditor.clone();

        let transaction_request =
            r::create_request_gql(test_creditor, rule_tested_transaction.transaction_items.0).await;

        let test_debitor = test_transaction_items.transaction_items[0].debitor.clone();

        let got = r::approve_request_gql(
            transaction_request.id.unwrap(),
            test_debitor.clone(),
            "debitor".to_string(),
            test_debitor,
        )
        .await;

        let iso8601: Regex = Regex::new(DATE_RE).unwrap();

        assert!(iso8601.is_match(got.equilibrium_time.unwrap().to_milli_tz().as_str()));
        assert_eq!(got.transaction_items.0.len(), 6);

        for tr_item in got.transaction_items.0 {
            assert!(iso8601.is_match(
                tr_item
                    .debitor_approval_time
                    .unwrap()
                    .to_milli_tz()
                    .as_str()
            ));
            assert!(iso8601.is_match(
                tr_item
                    .creditor_approval_time
                    .unwrap()
                    .to_milli_tz()
                    .as_str()
            ));
        }
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn graphql_returns_an_account_balance() {
        _before_each();

        // create a test transaction
        let transaction = h::create_transaction().await;

        // get the debitor account from the transaction
        let debitor = transaction.transaction_items.0[0].debitor.clone();

        let got = r::get_balance_gql(debitor.clone(), debitor).await.unwrap();
        let want = "978.200";

        assert_eq!(got, want)
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn graphql_returns_transactions_by_account() {
        _before_each();

        // create a test transaction
        h::create_transaction().await;

        // create a second test transaction
        let second_transaction = h::create_transaction().await;

        let debitor = second_transaction.transaction_items.0[0].debitor.clone();

        let got = r::get_transactions_by_account_gql(debitor.clone(), debitor).await;

        let iso8061: Regex = Regex::new(DATE_RE).unwrap();

        assert_eq!(got.len(), 2); // want 2 transactions
        for tr in got {
            assert!(iso8061.is_match(tr.equilibrium_time.unwrap().to_milli_tz().as_str())); // want a timestamp in equilibrium_time
            assert_eq!(tr.transaction_items.0.len(), 6); // want 6 transaction items
            for tr_item in tr.transaction_items.0 {
                assert!(iso8061.is_match(
                    tr_item
                        .debitor_approval_time // want a timestamp in debitor_approval_time
                        .unwrap()
                        .to_milli_tz()
                        .as_str()
                ));
                assert!(iso8061.is_match(
                    tr_item
                        .creditor_approval_time // want a timestamp in creditor_approval_time
                        .unwrap()
                        .to_milli_tz()
                        .as_str()
                ));
            }
        }
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn graphql_returns_a_transaction_by_id() {
        _before_each();

        // create a test transaction
        let test_transaction = h::create_transaction().await;

        let debitor = test_transaction.transaction_items.0[0].debitor.clone();

        let got = r::get_transaction_by_id_gql(
            debitor.clone(),
            debitor,
            test_transaction.id.clone().unwrap(),
        )
        .await;

        let iso8061: Regex = Regex::new(DATE_RE).unwrap();

        assert_eq!(got.id.unwrap(), String::from("3")); // want id of 3
        assert!(iso8061.is_match(got.equilibrium_time.unwrap().to_milli_tz().as_str())); // want a timestamp in equilibrium_time
        assert_eq!(got.transaction_items.0.len(), 6); // want 6 transaction items

        for tr_item in got.transaction_items.0 {
            assert!(iso8061.is_match(
                tr_item
                    .debitor_approval_time // want a timestamp in debitor_approval_time
                    .unwrap()
                    .to_milli_tz()
                    .as_str()
            ));
            assert!(iso8061.is_match(
                tr_item
                    .creditor_approval_time // want a timestamp in creditor_approval_time
                    .unwrap()
                    .to_milli_tz()
                    .as_str()
            ));
        }
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn graphql_returns_requests_by_account() {
        _before_each();

        let file = File::open("../pkg/testdata/transNoAppr.json").unwrap();
        let reader = BufReader::new(file);
        let mut test_intra_transaction: IntraTransaction = serde_json::from_reader(reader).unwrap();

        let debitor = String::from("AaronHill");

        for tr_item in test_intra_transaction
            .transaction
            .transaction_items
            .0
            .iter_mut()
        {
            tr_item.debitor = debitor.clone();
        }

        let wanted_transaction_requests = 2;

        for _ in 0..wanted_transaction_requests {
            r::create_request_http(
                test_intra_transaction.transaction.author.clone().unwrap(),
                test_intra_transaction.transaction.transaction_items.clone(),
            )
            .await;
        }

        let got = r::get_requests_by_account_gql(debitor.clone(), debitor).await;

        let iso8061: Regex = Regex::new(DATE_RE).unwrap();

        assert_eq!(got.len(), wanted_transaction_requests); // want 2 transaction requests
        for tr in got {
            assert!(tr.equilibrium_time.is_none()); // want an absent timestamp in equilibrium_time
            assert_eq!(tr.transaction_items.0.len(), 6); // want 6 transaction items
            for tr_item in tr.transaction_items.0 {
                assert!(tr_item
                    .debitor_approval_time // want an absent timestamp in debitor_approval_time
                    .is_none());
                assert!(iso8061.is_match(
                    tr_item
                        .creditor_approval_time // want a timestamp in creditor_approval_time
                        .unwrap()
                        .to_milli_tz()
                        .as_str()
                ));
            }
        }
    }

    #[tokio::test]
    #[cfg_attr(not(feature = "integration_tests"), ignore)]
    async fn graphql_returns_a_request_by_id() {
        _before_each();

        let file = File::open("../pkg/testdata/transNoAppr.json").unwrap();
        let reader = BufReader::new(file);
        let test_intra_transaction: IntraTransaction = serde_json::from_reader(reader).unwrap();

        let create_request = r::create_request_http(
            test_intra_transaction.transaction.author.clone().unwrap(),
            test_intra_transaction.transaction.transaction_items.clone(),
        )
        .await;

        let debitor = test_intra_transaction.transaction.transaction_items.0[0]
            .debitor
            .clone();

        let got =
            r::get_request_by_id_gql(debitor.clone(), debitor, create_request.id.unwrap()).await;

        let iso8061: Regex = Regex::new(DATE_RE).unwrap();

        assert_eq!(got.id.unwrap(), String::from("3")); // want id of 3
        assert!(got.equilibrium_time.is_none()); // want an absent timestamp in equilibrium_time
        assert_eq!(got.transaction_items.0.len(), 6); // want 6 transaction items

        for tr_item in got.transaction_items.0 {
            assert!(tr_item
                .debitor_approval_time // want an absent timestamp in debitor_approval_time
                .is_none());
            assert!(iso8061.is_match(
                tr_item
                    .creditor_approval_time // want a timestamp in creditor_approval_time
                    .unwrap()
                    .to_milli_tz()
                    .as_str()
            ));
        }
    }
}
