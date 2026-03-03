use axum::{
    extract::{Json, State},
    http::StatusCode,
    routing::{get, post},
    Router,
};
use cache::Cache;
use pg::postgres::{ConnectionPool, DatabaseConnection, DB};
use rule::{create_response, expected_values, label_approved_transaction_items};
use service::{Service, ServiceError};
use shutdown::shutdown_signal;
use std::{net::ToSocketAddrs, sync::Arc};
use types::approval::{Approval, Approvals};
use types::{
    account_role::{RoleSequence, CREDITOR_FIRST, DEBITOR_FIRST},
    request_response::IntraTransaction,
    time::TZTime,
    transaction::Transaction,
    transaction_item::{TransactionItem, TransactionItems},
};
mod rules;

#[derive(Clone)]
struct Store {
    pool: ConnectionPool,
    cache: Option<Arc<dyn Cache>>,
}

// used by lambda to test for service availability
const READINESS_CHECK_PATH: &str = "READINESS_CHECK_PATH";

async fn apply_transaction_item_rules<'a>(
    svc: &'a Service<'a, DatabaseConnection>,
    role_sequence: RoleSequence,
    transaction_items: &TransactionItems,
) -> Result<TransactionItems, ServiceError> {
    let accounts = transaction_items.list_accounts();

    let initial_account_profiles = svc
        .get_account_profiles(accounts)
        .await
        .map_err(|e| ServiceError::internal(&e.to_string()))?;

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
                .ok_or_else(|| {
                    ServiceError::internal(&format!("profile not found for {account}"))
                })?;

            // add profile id to transaction item
            let profile_id = account_profile.clone().id.ok_or_else(|| {
                ServiceError::internal(&format!("missing profile id for {account}"))
            })?;
            current_tr_item.set_profile_id(role, profile_id);

            // get rules matching state in account profile
            let state_rules = svc
                .get_state_tr_item_rule_instances(role, account_profile.state_name.to_string())
                .await
                .map_err(|e| ServiceError::internal(&e.to_string()))?;

            // apply state rules to transaction item
            for rule_instance in state_rules.clone().0.iter() {
                let state_added_tr_items = rules::transaction_item::match_transaction_item_rule(
                    rule_instance,
                    current_tr_item.clone(),
                )
                .map_err(|e| ServiceError::internal(&e.to_string()))?;
                // first item is updated original, rest are computed
                if !state_added_tr_items.0.is_empty() {
                    current_tr_item = state_added_tr_items.0[0].clone();
                    for item in state_added_tr_items.0.into_iter().skip(1) {
                        rule_added.0.push(item);
                    }
                }
            }

            // get rules matching account and rule
            let account_rules = svc
                .get_tr_item_rule_instances_by_role_account(role, account.clone())
                .await
                .map_err(|e| ServiceError::internal(&e.to_string()))?;

            // apply account rules to transaction item
            for rule_instance in account_rules.clone().0.iter() {
                let account_added_tr_items = rules::transaction_item::match_transaction_item_rule(
                    rule_instance,
                    current_tr_item.clone(),
                )
                .map_err(|e| ServiceError::internal(&e.to_string()))?;
                // first item is updated original, rest are computed
                if !account_added_tr_items.0.is_empty() {
                    current_tr_item = account_added_tr_items.0[0].clone();
                    for item in account_added_tr_items.0.into_iter().skip(1) {
                        rule_added.0.push(item);
                    }
                }
            }
        }

        // avoid fetching more account profiles
        // when zero transaction items added
        if !rule_added.0.is_empty() {
            let added_accounts = rule_added.list_accounts();

            let added_profile_ids = svc
                .get_profile_ids_by_account_names(added_accounts)
                .await
                .map_err(|e| ServiceError::internal(&e.to_string()))?;

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

    Ok(response)
}

async fn apply_approval_rules<'a>(
    svc: &'a Service<'a, DatabaseConnection>,
    role_sequence: RoleSequence,
    transaction_items: &mut TransactionItems,
    approval_time: &TZTime,
) -> Result<(), ServiceError> {
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
            let approvers = svc
                .get_account_approvers(account)
                .await
                .map_err(|e| ServiceError::internal(&e.to_string()))?;

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
                    .map_err(|e| ServiceError::internal(&e.to_string()))?;

                // loop through each approval rule and apply
                for rule_instance in approval_rules.0.iter() {
                    // apply approval rule_instance(s) on behalf of each approver
                    rules::approval::match_approval_rule(
                        rule_instance,
                        tr_item,
                        &mut approval,
                        approval_time,
                    )
                    .map_err(|e| ServiceError::internal(&e.to_string()))?;
                }

                // add post rule approval to approvals list
                approvals.0.push(approval);
            }
        }

        // attach post rule approvals to each transaction_item
        tr_item.approvals = Some(approvals);
    }

    Ok(())
}

// build transaction items from transaction_item_rule_instance templates
// when a transaction envelope has rule_instance_id set and empty items
async fn build_items_from_rule_instance(
    conn: &DatabaseConnection,
    transaction_rule_instance_id: &str,
) -> Result<TransactionItems, ServiceError> {
    let tri_id: i32 = transaction_rule_instance_id
        .parse()
        .map_err(|_| ServiceError::bad_request("invalid rule_instance_id"))?;
    let rows = conn
        .0
        .query(
            "SELECT id::text, item_id, price::text, quantity::text, variable_values \
             FROM transaction_item_rule_instance \
             WHERE transaction_rule_instance_id = $1",
            &[&tri_id],
        )
        .await
        .map_err(|e| {
            tracing::error!("query transaction_item_rule_instance failed: {}", e);
            ServiceError::internal("query transaction_item_rule_instance failed")
        })?;

    let mut items = TransactionItems::default();
    for row in rows {
        let tiri_id: String = row.get(0);
        let item_id: String = row.get(1);
        let price: String = row.get(2);
        let quantity: String = row.get(3);
        let variable_values: Vec<String> = row.get(4);

        items.0.push(TransactionItem {
            id: None,
            transaction_id: None,
            item_id,
            price,
            quantity,
            rule_instance_id: Some(tiri_id),
            rule_exec_ids: None,
            unit_of_measurement: None,
            units_measured: None,
            debitor: variable_values.first().cloned().unwrap_or_default(),
            creditor: variable_values.get(1).cloned().unwrap_or_default(),
            debitor_profile_id: None,
            creditor_profile_id: None,
            debitor_approval_time: None,
            creditor_approval_time: None,
            debitor_rejection_time: None,
            creditor_rejection_time: None,
            debitor_expiration_time: None,
            creditor_expiration_time: None,
            approvals: None,
        });
    }
    Ok(items)
}

async fn apply_rules(
    State(state): State<Store>,
    transaction: Json<Transaction>,
) -> Result<axum::Json<IntraTransaction>, ServiceError> {
    if !expected_values(&transaction) {
        return Err(ServiceError::bad_request(
            "missing expected transaction values",
        ));
    };

    let debitor_first = transaction.debitor_first.unwrap_or(false);
    let role_sequence = if debitor_first {
        DEBITOR_FIRST
    } else {
        CREDITOR_FIRST
    };

    // get connection from pool
    let conn = state
        .pool
        .get_conn()
        .await
        .map_err(|_| ServiceError::internal("failed to get db connection"))?;

    // when rule_instance_id is set and items are empty, build items from templates
    let mut transaction_items = if let Some(ref rule_instance_id) = transaction.rule_instance_id {
        if transaction.transaction_items.0.is_empty() {
            build_items_from_rule_instance(&conn, rule_instance_id).await?
        } else {
            transaction.transaction_items.clone()
        }
    } else {
        transaction.transaction_items.clone()
    };

    // set defaults for None values
    transaction_items.set_empty_rule_exec_ids();

    // create service with conn and cache
    let svc = Service::new(&conn, state.cache.clone());

    let mut rule_applied_tr_items =
        apply_transaction_item_rules(&svc, role_sequence, &transaction_items).await?;

    // create an approval time to be used for all automated approvals
    let approval_time = TZTime::now();

    apply_approval_rules(
        &svc,
        role_sequence,
        &mut rule_applied_tr_items,
        &approval_time,
    )
    .await?;

    let labeled_approved = label_approved_transaction_items(&role_sequence, rule_applied_tr_items)
        .map_err(|e| ServiceError::internal(&e))?;

    let response_transaction = create_response(labeled_approved, &transaction);

    let response = axum::Json(response_transaction);

    Ok(response)
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let readiness_check_path = envvar::required(READINESS_CHECK_PATH).unwrap();

    let conn_uri = DB::create_conn_uri_from_env_vars();

    let pool = DB::new_pool(&conn_uri).await;

    let cache = cache::new().await;

    let store = Store { pool, cache };

    let app = Router::new()
        .route("/", post(apply_rules))
        .route(
            readiness_check_path.as_str(),
            get(|| async { StatusCode::OK }),
        )
        .with_state(store);

    let hostname_or_ip = envvar::optional("HOSTNAME_OR_IP", "0.0.0.0");

    let port = envvar::required("RULE_PORT").unwrap();

    let serve_addr = format!("{hostname_or_ip}:{port}");

    let mut addrs_iter = serve_addr.to_socket_addrs().unwrap_or(
        format!("{hostname_or_ip}:{port}")
            .to_socket_addrs()
            .unwrap(),
    );

    let addr = addrs_iter.next().unwrap();

    tracing::info!("listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}
