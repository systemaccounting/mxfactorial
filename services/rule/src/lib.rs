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
    approval_time: &TZTime,
) -> TransactionItems {
    let mut approved = transaction_items;

    for tr_item in approved.0.iter_mut() {
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
                // test for approval_times consistency
                let initial_approval_time = approval_times[0].clone();
                let mut same_as_initial = 0;
                for t in approval_times.clone().iter() {
                    if t.0.eq(&initial_approval_time.0) {
                        same_as_initial += 1
                    }
                }

                // test for consistent approval times
                if approval_times.len() == same_as_initial {
                    if *role == AccountRole::Debitor {
                        // label transaction item for debitor as approved
                        // (all debitor approvals have timestamps)
                        tr_item.debitor_approval_time = Some(approval_time.clone());
                    };

                    if *role == AccountRole::Creditor {
                        // label transaction item for creditor as approved
                        // (all creditor approvals have timestamps)
                        tr_item.creditor_approval_time = Some(approval_time.clone());
                    };
                }
                // todo: else inconsistent approval time error
            }
        }
    }
    approved
}
