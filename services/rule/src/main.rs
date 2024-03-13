use axum::{
    extract::{Json, State},
    http::StatusCode,
    routing::{get, post},
    Router,
};
use pg::{
    model::{DynConnPool, DynDBConn},
    postgres::DB,
};
use rule::{create_response, expected_values, label_approved_transaction_items};
use std::{env, net::ToSocketAddrs, sync::Arc};
use tokio::signal;
use types::approval::{Approval, Approvals};
use types::{
    account_role::{RoleSequence, CREDITOR_FIRST, DEBITOR_FIRST},
    request_response::IntraTransaction,
    time::TZTime,
    transaction_item::TransactionItems,
};
mod rules;

// used by lambda to test for service availability
const READINESS_CHECK_PATH: &str = "READINESS_CHECK_PATH";

async fn apply_transaction_item_rules(
    conn: DynDBConn,
    role_sequence: RoleSequence,
    transaction_items: &TransactionItems,
) -> TransactionItems {
    let accounts = transaction_items.list_accounts();

    let initial_account_profiles = conn.get_account_profiles(accounts).await.unwrap();

    let mut response: TransactionItems = TransactionItems::default();

    for tr_item in transaction_items.0.iter() {
        // create mutable transaction item to add profile ids
        let mut current_tr_item = tr_item.clone();

        // create mutable transaction item vec to add transaction items created by rules
        let mut rule_added: TransactionItems = TransactionItems::default();

        // add rule items per user defined role sequence
        // i.e. execute rules in debitor, creditor OR creditor, debitor
        for role in role_sequence.into_iter() {
            let account = tr_item.get_account_by_role(role);
            // get account profile
            let account_profile = initial_account_profiles
                .match_profile_by_account(account.clone())
                .unwrap();

            // add profile id to transaction item
            current_tr_item.set_profile_id(role, account_profile.clone().id.unwrap()); // todo: handle missing id error

            // get rules matching state in account profile
            let state_rules = conn
                .get_profile_state_rule_instances(role, account_profile.state_name.to_string())
                .await;

            // apply state rules to transaction item
            for rule_instance in state_rules.clone().0.iter() {
                let mut state_added_tr_items =
                    rules::transaction_item::match_transaction_item_rule(
                        rule_instance,
                        &mut current_tr_item,
                    )
                    .unwrap();
                rule_added.0.append(&mut state_added_tr_items.0);
            }

            // get rules matching account and rule
            let account_rules = conn
                .get_rule_instances_by_type_role_account(role, account.clone())
                .await;

            // apply account rules to transaction item
            for rule_instance in account_rules.clone().0.iter() {
                let mut account_added_tr_item =
                    rules::transaction_item::match_transaction_item_rule(
                        rule_instance,
                        &mut current_tr_item,
                    )
                    .unwrap();
                rule_added.0.append(&mut account_added_tr_item.0);
            }
        }

        // avoid fetching more account profiles
        // when zero transaction items added
        if !rule_added.0.is_empty() {
            let added_accounts = rule_added.list_accounts();

            let added_profiles = conn.get_account_profiles(added_accounts).await.unwrap();

            // add account profile ids to rule added transaction items
            // todo: some profiles may be previously fetched when
            // assigning initial_account_profiles, avoid duplicate query
            rule_added.add_profile_ids(added_profiles);
        }

        // add initial transaction item
        response.0.push(current_tr_item);

        // add transaction items created by rules
        response.0.append(&mut rule_added.0);
    }

    response
}

async fn apply_approval_rules(
    conn: DynDBConn,
    role_sequence: RoleSequence,
    transaction_items: &mut TransactionItems,
    approval_time: &TZTime,
) {
    // loop through transaction_item(s)
    for tr_item in transaction_items.0.iter_mut() {
        // create empty list of approvals which will increase as
        // approvers (account owners) are returned from a database query
        let mut approvals = Approvals::default();

        // loop through user defined "debitor, creditor" OR
        // "creditor, debitor" sequence
        for role in role_sequence {
            // get debitor or creditor account from each transaction_item
            let account = tr_item.get_account_by_role(role);

            // query account owners (approvers) of debitor or credit account
            let approvers = conn.get_approvers_for_account(account).await;

            // loop through list of approvers
            for approver in approvers {
                // init an approval with an approver name and role (debitor or creditor)
                let mut approval = Approval {
                    id: None,
                    rule_instance_id: None,
                    transaction_id: None,
                    transaction_item_id: None,
                    account_name: approver.clone(),
                    account_role: role,
                    device_id: None,
                    device_latlng: None,
                    approval_time: None,
                    rejection_time: None,
                    expiration_time: None,
                };

                // query approval rules available for current approver
                let approval_rules = conn
                    .get_approval_rule_instances(role, approver.clone())
                    .await;

                // loop through each approval rule and apply
                for rule_instance in approval_rules.0.iter() {
                    // apply approval rule_instance(s) on behalf of each approver
                    rules::approval::match_approval_rule(
                        rule_instance,
                        tr_item,
                        &mut approval,
                        approval_time,
                    )
                    .unwrap(); // todo: handle error
                }

                // add post rule approval to approvals list
                approvals.0.push(approval);
            }
        }

        // attach post rule approvals to each transaction_item
        tr_item.approvals = Some(approvals);
    }
}

async fn apply_rules(
    State(pool): State<DynConnPool>,
    transaction_items: Json<TransactionItems>,
) -> Result<axum::Json<IntraTransaction>, StatusCode> {
    if !expected_values(&transaction_items) {
        return Err(StatusCode::BAD_REQUEST);
    };

    let mut role_sequence = CREDITOR_FIRST;

    let mut transaction_items = transaction_items.clone();

    // set defaults for None values
    transaction_items.set_debitor_first_default();
    transaction_items.set_empty_rule_exec_ids();

    match transaction_items.is_debitor_first() {
        Ok(true) => role_sequence = DEBITOR_FIRST,
        Ok(false) => {}
        Err(_e) => {
            return Err(StatusCode::BAD_REQUEST);
        }
    }

    // get connection from pool
    let conn = pool.get_conn().await as DynDBConn;

    let mut rule_applied_tr_items =
        apply_transaction_item_rules(conn.clone(), role_sequence, &transaction_items).await;

    // create an approval time to be used for all automated approvals
    let approval_time = TZTime::now();

    apply_approval_rules(
        conn,
        role_sequence,
        &mut rule_applied_tr_items,
        &approval_time,
    )
    .await;

    let labeled_approved = label_approved_transaction_items(&role_sequence, rule_applied_tr_items);

    let transaction = create_response(labeled_approved);

    let response = axum::Json(transaction);

    Ok(response)
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let readiness_check_path = env::var(READINESS_CHECK_PATH)
        .unwrap_or_else(|_| panic!("{READINESS_CHECK_PATH} variable assignment"));

    let conn_uri = DB::create_conn_uri_from_env_vars();

    let pool = Arc::new(DB::new_pool(&conn_uri).await) as DynConnPool;

    let app = Router::new()
        .route("/", post(apply_rules))
        .route(
            readiness_check_path.as_str(),
            get(|| async { StatusCode::OK }),
        )
        .with_state(pool);

    let hostname_or_ip = env::var("HOSTNAME_OR_IP").unwrap_or("0.0.0.0".to_string());

    let port = env::var("RULE_PORT").unwrap_or("10001".to_string());

    let serve_addr = format!("{hostname_or_ip}:{port}");

    let mut addrs_iter = serve_addr.to_socket_addrs().unwrap_or(
        format!("{hostname_or_ip}:{port}")
            .to_socket_addrs()
            .unwrap(),
    );

    let addr = addrs_iter.next().unwrap();

    tracing::info!("listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}

// from axum/examples/graceful-shutdown
async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    println!("signal received, starting graceful shutdown");
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::async_trait;
    use chrono::{DateTime, Utc};
    use std::error::Error;
    use types::{
        account::{AccountProfile, AccountProfiles, AccountTrait},
        account_role::{AccountRole, DEBITOR_FIRST},
        rule::{RuleInstance, RuleInstanceTrait, RuleInstances},
        transaction_item::TransactionItem,
    };
    struct DBConnStub();
    const TEST_TAX_APPROVERS: &[&str] = &["BenRoss", "DanLee", "MiriamLevy"];

    #[async_trait]
    impl AccountTrait for DBConnStub {
        async fn get_account_profiles(
            &self,
            _accounts: Vec<String>,
        ) -> Result<AccountProfiles, Box<dyn Error>> {
            Ok(AccountProfiles(vec![
                AccountProfile {
                    id: Some(String::from("7")),
                    account_name: String::from("JacobWebb"),
                    description: Some(String::from("Soccer coach")),
                    first_name: Some(String::from("Jacob")),
                    middle_name: Some(String::from("Curtis")),
                    last_name: Some(String::from("Webb")),
                    country_name: String::from("United States of America"),
                    street_number: Some(String::from("205")),
                    street_name: Some(String::from("N Mccarran Blvd")),
                    floor_number: None,
                    unit_number: None,
                    city_name: String::from("Sparks"),
                    county_name: Some(String::from("Washoe County")),
                    region_name: None,
                    state_name: String::from("Nevada"),
                    postal_code: String::from("89431"),
                    latlng: Some(String::from("(39.534552,-119.737825)")),
                    email_address: String::from("jacob@address.xz"),
                    telephone_country_code: Some(String::from("1")),
                    telephone_area_code: Some(String::from("775")),
                    telephone_number: Some(String::from("5555555")),
                    occupation_id: Some(String::from("7")),
                    industry_id: Some(String::from("7")),
                    removal_time: None,
                },
                AccountProfile {
                    id: Some(String::from("11")),
                    account_name: String::from("GroceryStore"),
                    description: Some(String::from("Sells groceries")),
                    first_name: Some(String::from("Grocery")),
                    middle_name: None,
                    last_name: Some(String::from("Store")),
                    country_name: String::from("United States of America"),
                    street_number: Some(String::from("8701")),
                    street_name: Some(String::from("Lincoln Blvd")),
                    floor_number: None,
                    unit_number: None,
                    city_name: String::from("Los Angeles"),
                    county_name: Some(String::from("Los Angeles County")),
                    region_name: None,
                    state_name: String::from("California"),
                    postal_code: String::from("90045"),
                    latlng: Some(String::from("(33.958050,-118.418388)")),
                    email_address: String::from("grocerystore@address.xz"),
                    telephone_country_code: Some(String::from("1")),
                    telephone_area_code: Some(String::from("310")),
                    telephone_number: Some(String::from("5555555")),
                    occupation_id: None,
                    industry_id: Some(String::from("8")),
                    removal_time: None,
                },
                AccountProfile {
                    id: Some(String::from("27")),
                    account_name: String::from("StateOfCalifornia"),
                    description: Some(String::from("State of California")),
                    first_name: None,
                    middle_name: None,
                    last_name: None,
                    country_name: String::from("United States of America"),
                    street_number: Some(String::from("450")),
                    street_name: Some(String::from("N St")),
                    floor_number: None,
                    unit_number: None,
                    city_name: String::from("Sacramento"),
                    county_name: Some(String::from("Sacramento County")),
                    region_name: None,
                    state_name: String::from("California"),
                    postal_code: String::from("95814"),
                    latlng: Some(String::from("(38.5777292,-121.5027026)")),
                    email_address: String::from("stateofcalifornia@address.xz"),
                    telephone_country_code: Some(String::from("1")),
                    telephone_area_code: Some(String::from("916")),
                    telephone_number: Some(String::from("5555555")),
                    occupation_id: None,
                    industry_id: Some(String::from("11")),
                    removal_time: None,
                },
            ]))
        }
        async fn get_approvers_for_account(&self, account: String) -> Vec<String> {
            match account.as_str() {
                "StateOfCalifornia" => {
                    let mut approvers: Vec<String> = vec![];
                    for a in TEST_TAX_APPROVERS {
                        approvers.push(a.to_string())
                    }
                    approvers
                }
                _ => vec![account],
            }
        }
    }

    #[async_trait]
    impl RuleInstanceTrait for DBConnStub {
        async fn get_profile_state_rule_instances(
            &self,
            account_role: AccountRole,
            _state_name: String,
        ) -> RuleInstances {
            if account_role == AccountRole::Debitor {
                return RuleInstances(vec![]);
            }
            RuleInstances(vec![RuleInstance {
                id: Some(String::from("1")),
                rule_type: String::from("transaction_item"),
                rule_name: String::from("multiplyItemValue"),
                rule_instance_name: String::from("NinePercentSalesTax"),
                variable_values: vec![
                    String::from("ANY"),
                    String::from("StateOfCalifornia"),
                    String::from("9% state sales tax"),
                    String::from("0.09"),
                ],
                account_role: AccountRole::Creditor,
                item_id: None,
                price: None,
                quantity: None,
                unit_of_measurement: None,
                units_measured: None,
                account_name: None,
                first_name: None,
                middle_name: None,
                last_name: None,
                country_name: None,
                street_id: None,
                street_name: None,
                floor_number: None,
                unit_id: None,
                city_name: None,
                county_name: None,
                region_name: None,
                state_name: Some(String::from("California")),
                postal_code: None,
                latlng: None,
                email_address: None,
                telephone_country_code: None,
                telephone_area_code: None,
                telephone_number: None,
                occupation_id: None,
                industry_id: None,
                disabled_time: None,
                removed_time: None,
                created_at: Some(TZTime(
                    DateTime::parse_from_rfc3339("2023-02-28T04:21:08.363Z")
                        .unwrap()
                        .with_timezone(&Utc),
                )),
            }])
        }
        async fn get_rule_instances_by_type_role_account(
            &self,
            _account_role: AccountRole,
            _account: String,
        ) -> RuleInstances {
            RuleInstances(vec![])
        }
        async fn get_approval_rule_instances(
            &self,
            _account_role: AccountRole,
            account: String,
        ) -> RuleInstances {
            if TEST_TAX_APPROVERS.contains(&account.as_str()) {
                return RuleInstances(vec![RuleInstance {
                    id: Some(String::from("1")),
                    rule_type: String::from("approval"),
                    rule_name: String::from("approveAnyCreditItem"),
                    rule_instance_name: String::from("ApproveAllCaliforniaCredit"),
                    variable_values: vec![
                        String::from("StateOfCalifornia"),
                        String::from("creditor"),
                        account,
                    ],
                    account_role: AccountRole::Creditor,
                    item_id: None,
                    price: None,
                    quantity: None,
                    unit_of_measurement: None,
                    units_measured: None,
                    account_name: None,
                    first_name: None,
                    middle_name: None,
                    last_name: None,
                    country_name: None,
                    street_id: None,
                    street_name: None,
                    floor_number: None,
                    unit_id: None,
                    city_name: None,
                    county_name: None,
                    region_name: None,
                    state_name: None,
                    postal_code: None,
                    latlng: None,
                    email_address: None,
                    telephone_country_code: None,
                    telephone_area_code: None,
                    telephone_number: None,
                    occupation_id: None,
                    industry_id: None,
                    disabled_time: None,
                    removed_time: None,
                    created_at: Some(TZTime(
                        DateTime::parse_from_rfc3339("2023-02-28T04:21:08.363Z")
                            .unwrap()
                            .with_timezone(&Utc),
                    )),
                }]);
            } else {
                return RuleInstances(vec![]);
            }
        }
    }

    #[tokio::test]
    async fn it_applies_transaction_item_rules() {
        let db_conn_stub = Arc::new(DBConnStub()) as DynDBConn;
        let tr_items = TransactionItems(vec![
            TransactionItem {
                id: None,
                transaction_id: None,
                item_id: String::from("bread"),
                price: String::from("3.000"),
                quantity: String::from("2"),
                debitor_first: Some(false),
                rule_instance_id: None,
                rule_exec_ids: Some(vec![]),
                unit_of_measurement: None,
                units_measured: None,
                debitor: String::from("JacobWebb"),
                creditor: String::from("GroceryStore"),
                debitor_profile_id: None,
                creditor_profile_id: None,
                debitor_approval_time: None,
                creditor_approval_time: None,
                debitor_rejection_time: None,
                creditor_rejection_time: None,
                debitor_expiration_time: None,
                creditor_expiration_time: None,
                approvals: None,
            },
            TransactionItem {
                id: None,
                transaction_id: None,
                item_id: String::from("milk"),
                price: String::from("4.000"),
                quantity: String::from("3"),
                debitor_first: Some(false),
                rule_instance_id: None,
                rule_exec_ids: Some(vec![]),
                unit_of_measurement: None,
                units_measured: None,
                debitor: String::from("JacobWebb"),
                creditor: String::from("GroceryStore"),
                debitor_profile_id: None,
                creditor_profile_id: None,
                debitor_approval_time: None,
                creditor_approval_time: None,
                debitor_rejection_time: None,
                creditor_rejection_time: None,
                debitor_expiration_time: None,
                creditor_expiration_time: None,
                approvals: None,
            },
        ]);

        // test function
        let got = apply_transaction_item_rules(db_conn_stub, DEBITOR_FIRST, &tr_items).await;

        // assert #1:
        // save length of transaction items vec
        let got_length = got.clone().0.len();
        // want length of transaction items vec to be 4 (started with 2)
        let want_length = 4;
        assert_eq!(
            got_length, want_length,
            "got {}, want {}",
            got_length, want_length
        );

        // assert #2:
        // init float32 accumulator
        let mut got_total: f32 = 0.0;
        // loop through transaction items vec
        for tr_item in got.0.into_iter() {
            // parse price
            let price: f32 = tr_item.price.clone().parse().unwrap();
            // parse quantity
            let quantity: f32 = tr_item.quantity.clone().parse().unwrap();
            // add price * quantity from each transaction item to accumulator
            got_total = got_total + (price * quantity);
        }
        // want total price across transaction items vec to be 19.63 (includes rule added taxes)
        let want_total = 19.62;
        assert_eq!(
            got_total, want_total,
            "got {}, want {}",
            got_length, want_total
        );
    }

    #[tokio::test]
    async fn it_applies_approval_rules() {
        let test_approval_time = TZTime::now();
        let db_conn_stub = Arc::new(DBConnStub()) as DynDBConn;
        let mut got_tr_items = TransactionItems(vec![
            TransactionItem {
                id: None,
                transaction_id: None,
                item_id: String::from("bread"),
                price: String::from("3.000"),
                quantity: String::from("2"),
                debitor_first: Some(false),
                rule_instance_id: None,
                rule_exec_ids: Some(vec![]),
                unit_of_measurement: None,
                units_measured: None,
                debitor: String::from("JacobWebb"),
                creditor: String::from("GroceryStore"),
                debitor_profile_id: None,
                creditor_profile_id: None,
                debitor_approval_time: None,
                creditor_approval_time: None,
                debitor_rejection_time: None,
                creditor_rejection_time: None,
                debitor_expiration_time: None,
                creditor_expiration_time: None,
                approvals: None,
            },
            TransactionItem {
                id: None,
                transaction_id: None,
                item_id: String::from("milk"),
                price: String::from("4.000"),
                quantity: String::from("3"),
                debitor_first: Some(false),
                rule_instance_id: None,
                rule_exec_ids: Some(vec![]),
                unit_of_measurement: None,
                units_measured: None,
                debitor: String::from("JacobWebb"),
                creditor: String::from("GroceryStore"),
                debitor_profile_id: None,
                creditor_profile_id: None,
                debitor_approval_time: None,
                creditor_approval_time: None,
                debitor_rejection_time: None,
                creditor_rejection_time: None,
                debitor_expiration_time: None,
                creditor_expiration_time: None,
                approvals: None,
            },
            TransactionItem {
                id: None,
                transaction_id: None,
                item_id: String::from("9% state sales tax"),
                price: String::from("0.270"),
                quantity: String::from("2.000"),
                debitor_first: Some(false),
                rule_instance_id: None,
                rule_exec_ids: Some(vec![]),
                unit_of_measurement: None,
                units_measured: None,
                debitor: String::from("JacobWebb"),
                creditor: String::from("StateOfCalifornia"),
                debitor_profile_id: None,
                creditor_profile_id: None,
                debitor_approval_time: None,
                creditor_approval_time: None,
                debitor_rejection_time: None,
                creditor_rejection_time: None,
                debitor_expiration_time: None,
                creditor_expiration_time: None,
                approvals: None,
            },
            TransactionItem {
                id: None,
                transaction_id: None,
                item_id: String::from("9% state sales tax"),
                price: String::from("0.360"),
                quantity: String::from("3.000"),
                debitor_first: Some(false),
                rule_instance_id: None,
                rule_exec_ids: Some(vec![]),
                unit_of_measurement: None,
                units_measured: None,
                debitor: String::from("JacobWebb"),
                creditor: String::from("StateOfCalifornia"),
                debitor_profile_id: None,
                creditor_profile_id: None,
                debitor_approval_time: None,
                creditor_approval_time: None,
                debitor_rejection_time: None,
                creditor_rejection_time: None,
                debitor_expiration_time: None,
                creditor_expiration_time: None,
                approvals: None,
            },
        ]);

        // test function
        apply_approval_rules(
            db_conn_stub,
            DEBITOR_FIRST,
            &mut got_tr_items,
            &test_approval_time,
        )
        .await;

        // assert #1
        // save length of tax item approvals
        let got_length = got_tr_items
            .0
            .clone()
            .into_iter()
            .nth(3)
            .unwrap()
            .approvals
            .unwrap()
            .0
            .len();
        // want length of approvals vec on tax transaction item to be 4 (started with 0)
        let want_length: usize = 4;
        assert_eq!(
            got_length, want_length,
            "got {}, want {}",
            got_length, want_length
        );

        // assert #2
        // save approval time from first approval
        let got_approval_time = got_tr_items
            .0
            .into_iter()
            .nth(3)
            .unwrap()
            .approvals
            .unwrap()
            .0
            .into_iter()
            .nth(3)
            .unwrap()
            .approval_time
            .unwrap();
        // want approval time
        let want_approval_time = test_approval_time.clone();
        assert_eq!(
            got_approval_time, want_approval_time,
            "got {:?}, want {:?}",
            got_approval_time, want_approval_time
        );
    }

    #[tokio::test]
    async fn it_applies_rules() {
        use axum::extract::{Json, State};
        use pg::model::DBConnPoolTrait;
        let test_tr_items = TransactionItems(vec![
            TransactionItem {
                id: None,
                transaction_id: None,
                item_id: String::from("bread"),
                price: String::from("3.000"),
                quantity: String::from("2"),
                debitor_first: Some(false),
                rule_instance_id: None,
                rule_exec_ids: Some(vec![]),
                unit_of_measurement: None,
                units_measured: None,
                debitor: String::from("JacobWebb"),
                creditor: String::from("GroceryStore"),
                debitor_profile_id: None,
                creditor_profile_id: None,
                debitor_approval_time: None,
                creditor_approval_time: None,
                debitor_rejection_time: None,
                creditor_rejection_time: None,
                debitor_expiration_time: None,
                creditor_expiration_time: None,
                approvals: None,
            },
            TransactionItem {
                id: None,
                transaction_id: None,
                item_id: String::from("milk"),
                price: String::from("4.000"),
                quantity: String::from("3"),
                debitor_first: Some(false),
                rule_instance_id: None,
                rule_exec_ids: Some(vec![]),
                unit_of_measurement: None,
                units_measured: None,
                debitor: String::from("JacobWebb"),
                creditor: String::from("GroceryStore"),
                debitor_profile_id: None,
                creditor_profile_id: None,
                debitor_approval_time: None,
                creditor_approval_time: None,
                debitor_rejection_time: None,
                creditor_rejection_time: None,
                debitor_expiration_time: None,
                creditor_expiration_time: None,
                approvals: None,
            },
        ]);

        struct DBPoolStub();

        #[async_trait]
        impl DBConnPoolTrait for DBPoolStub {
            async fn get_conn(&self) -> DynDBConn {
                return Arc::new(DBConnStub());
            }
        }

        let db_pool_stub = Arc::new(DBPoolStub());

        // test function
        let got_response = apply_rules(State(db_pool_stub), Json(test_tr_items))
            .await
            .unwrap();
        let got_transaction = got_response.0.transaction.clone();

        // assert #1:
        // save length of transaction items vec
        let got_length = got_transaction.clone().transaction_items.0.len();
        let want_length = 4;

        // want length of transaction items vec to be 4 (started with 2)
        assert_eq!(
            got_length, want_length,
            "got {}, want {}",
            got_length, want_length
        );

        // assert #2
        let mut got_tax_tr_item_count = 0;
        for tr_item in got_transaction.clone().transaction_items.0.iter() {
            if tr_item.item_id == "9% state sales tax".to_string() {
                got_tax_tr_item_count = got_tax_tr_item_count + 1
            }
        }
        let want_tax_tr_item_count = 2;
        // want 2 rule added tax transaction items
        assert_eq!(
            got_tax_tr_item_count, want_tax_tr_item_count,
            "got {}, want {}",
            got_tax_tr_item_count, want_tax_tr_item_count
        );

        // assert #3
        let mut got_creditor_approval_count = 0;
        for tr_item in got_transaction.clone().transaction_items.0.iter() {
            if tr_item.creditor_approval_time.is_some()
                && tr_item.item_id == "9% state sales tax".to_string()
            {
                got_creditor_approval_count = got_creditor_approval_count + 1
            }
        }
        let want_creditor_approval_count = 2;
        // want 2 rule added creditor approvals
        assert_eq!(
            got_creditor_approval_count, want_creditor_approval_count,
            "got {}, want {}",
            got_creditor_approval_count, want_creditor_approval_count
        );

        // todo: more tests
    }
}
