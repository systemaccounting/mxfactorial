use types::{
    account_role::{AccountRole, RoleSequence},
    request_response::IntraTransaction,
    time::TZTime,
    transaction::Transaction,
    transaction_item::TransactionItems,
};

pub fn expected_values(tr_items: &TransactionItems) -> bool {
    // todo: test transaction item values in request
    let _ = tr_items;
    true
}

pub fn create_response(transtaction_items: TransactionItems) -> IntraTransaction {
    IntraTransaction {
        auth_account: None,
        transaction: Transaction {
            id: None,
            rule_instance_id: None,
            author: None,
            author_device_id: None,
            author_device_latlng: None,
            author_role: None,
            equilibrium_time: None,
            sum_value: transtaction_items.sum_value(),
            transaction_items: transtaction_items,
        },
    }
}

pub fn label_approved_transaction_items(
    role_sequence: &RoleSequence,
    transaction_items: TransactionItems,
) -> TransactionItems {
    let mut labeled = transaction_items;

    for tr_item in labeled.0.iter_mut() {
        for role in role_sequence {
            // get list of approvals per role (debitor or creditor)
            let approvals_per_role = tr_item
                .approvals
                .clone()
                .unwrap()
                .get_approvals_per_role(*role);

            // todo: error on 0 approvals_per_role
            if approvals_per_role.0.is_empty() {
                panic!("0 approvals per role");
            }

            let mut approval_count = 0;
            let mut approval_times: Vec<TZTime> = vec![];

            for approval in approvals_per_role.clone().0.into_iter() {
                if approval.approval_time.is_some() {
                    // count role approvals with timestamps
                    approval_count += 1;
                    // save role approval timestamp
                    approval_times.push(approval.approval_time.unwrap())
                }
            }

            // test for timestamps in all role approvals
            if approvals_per_role.clone().0.len() == approval_count {
                // test for latest approval time
                let mut latest_approval_time = approval_times[0];
                for t in approval_times.clone().iter() {
                    if t.0.gt(&latest_approval_time.0) {
                        latest_approval_time = TZTime(t.0)
                    }
                }

                // test for consistent approval times
                if approval_times.len() == approvals_per_role.0.len() {
                    if *role == AccountRole::Debitor {
                        // label transaction item for debitor as approved
                        // (all debitor approvals have timestamps)
                        tr_item.debitor_approval_time = Some(latest_approval_time);
                    };

                    if *role == AccountRole::Creditor {
                        // label transaction item for creditor as approved
                        // (all creditor approvals have timestamps)
                        tr_item.creditor_approval_time = Some(latest_approval_time);
                    };
                }
                // todo: else inconsistent approval time error
            }
        }
    }
    labeled
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration;
    use types::{
        account_role::DEBITOR_FIRST,
        approval::{Approval, Approvals},
        transaction_item::TransactionItem,
    };

    #[test]
    fn it_labels_approved_transaction_items() {
        let test_approval_time = TZTime::now();
        let tr_items = TransactionItems(vec![TransactionItem {
            id: None,
            transaction_id: None,
            item_id: String::from("9% state sales taxk"),
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
            approvals: Some(Approvals(vec![
                Approval {
                    id: None,
                    rule_instance_id: None,
                    transaction_id: None,
                    transaction_item_id: None,
                    account_name: String::from("JacobWebb"),
                    account_role: AccountRole::Debitor,
                    device_id: None,
                    device_latlng: None,
                    approval_time: None,
                    rejection_time: None,
                    expiration_time: None,
                },
                Approval {
                    id: None,
                    rule_instance_id: None,
                    transaction_id: None,
                    transaction_item_id: None,
                    account_name: String::from("BenRoss"),
                    account_role: AccountRole::Creditor,
                    device_id: None,
                    device_latlng: None,
                    // latest approval time
                    approval_time: Some(test_approval_time),
                    rejection_time: None,
                    expiration_time: None,
                },
                Approval {
                    id: None,
                    rule_instance_id: None,
                    transaction_id: None,
                    transaction_item_id: None,
                    account_name: String::from("DanLee"),
                    account_role: AccountRole::Creditor,
                    device_id: None,
                    device_latlng: None,
                    // set 10s earlier
                    approval_time: Some(TZTime(test_approval_time.0 - Duration::seconds(10))),
                    rejection_time: None,
                    expiration_time: None,
                },
                Approval {
                    id: None,
                    rule_instance_id: None,
                    transaction_id: None,
                    transaction_item_id: None,
                    account_name: String::from("MiriamLevy"),
                    account_role: AccountRole::Creditor,
                    device_id: None,
                    device_latlng: None,
                    // set 20s earlier
                    approval_time: Some(TZTime(test_approval_time.0 - Duration::seconds(20))),
                    rejection_time: None,
                    expiration_time: None,
                },
            ])),
        }]);

        // test function
        let got = label_approved_transaction_items(&DEBITOR_FIRST, tr_items);

        // assert #1
        // save creditor_approval_time
        let got_creditor_approval_time = got
            .0
            .clone()
            .into_iter()
            .next()
            .unwrap()
            .creditor_approval_time
            .unwrap();

        // want latest creditor_approval_time
        let want_creditor_approval_time = test_approval_time;

        assert_eq!(
            got_creditor_approval_time, want_creditor_approval_time,
            "got {:?}, want {:?}",
            got_creditor_approval_time, want_creditor_approval_time
        );

        // assert #2
        // save debitor_approval_time
        let got_debitor_approval_time = got
            .0
            .clone()
            .into_iter()
            .next()
            .unwrap()
            .debitor_approval_time;

        // want latest debitor_approval_time
        let want_debitor_approval_time = None;

        assert_eq!(
            got_debitor_approval_time, want_debitor_approval_time,
            "got {:?}, want {:?}",
            got_debitor_approval_time, want_debitor_approval_time
        )
    }
}
