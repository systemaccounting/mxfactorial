use axum::{
    extract::{Json, State},
    http::StatusCode,
    routing::{get, post},
    Router,
};
use pg::postgres::{ConnectionPool, DatabaseConnection, DB};
use rule::{create_response, expected_values, label_approved_transaction_items};
use service::Service;
use shutdown::shutdown_signal;
use std::{env, net::ToSocketAddrs};
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
    svc: &Service<DatabaseConnection>,
    role_sequence: RoleSequence,
    transaction_items: &TransactionItems,
) -> TransactionItems {
    let accounts = transaction_items.list_accounts();

    let initial_account_profiles = svc.get_account_profiles(accounts).await.unwrap();

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
            let state_rules = svc
                .get_state_tr_item_rule_instances(role, account_profile.state_name.to_string())
                .await
                .unwrap();

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
            let account_rules = svc
                .get_tr_item_rule_instances_by_role_account(role, account.clone())
                .await
                .unwrap();

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

            let added_profile_ids = svc
                .get_profile_ids_by_account_names(added_accounts)
                .await
                .unwrap();

            // add account profile ids to rule added transaction items
            // todo: some profiles may be previously fetched when
            // assigning initial_account_profiles, avoid duplicate query
            rule_added.add_profile_ids(added_profile_ids);
        }

        // add initial transaction item
        response.0.push(current_tr_item);

        // add transaction items created by rules
        response.0.append(&mut rule_added.0);
    }

    response
}

async fn apply_approval_rules(
    svc: &Service<DatabaseConnection>,
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
            let approvers = svc.get_account_approvers(account).await.unwrap();

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
                let approval_rules = svc
                    .get_approval_rule_instances(role, approver.clone())
                    .await
                    .unwrap();

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
    State(pool): State<ConnectionPool>,
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
    let conn = pool.get_conn().await;

    // create service with conn
    let svc = Service::new(conn);

    let mut rule_applied_tr_items =
        apply_transaction_item_rules(&svc, role_sequence, &transaction_items).await;

    // create an approval time to be used for all automated approvals
    let approval_time = TZTime::now();

    apply_approval_rules(
        &svc,
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

    let pool = DB::new_pool(&conn_uri).await;

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
