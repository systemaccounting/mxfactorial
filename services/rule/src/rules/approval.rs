use std::error::Error;

use types::{
    account_role::AccountRole, approval::Approval, rule::ApprovalRuleInstance, time::TZTime,
    transaction_item::TransactionItem,
};

pub fn match_approval_rule(
    rule_instance: &ApprovalRuleInstance,
    transaction_item: &TransactionItem,
    approval: &mut Approval,
    approval_time: &TZTime,
) -> Result<(), Box<dyn Error>> {
    let rule_name = rule_instance.rule_name.as_str();
    match rule_name {
        "approveAnyCreditItem" => {
            approve_any_credit_item(rule_instance, transaction_item, approval, approval_time)
        }
        "approveItemBetweenAccounts" => {
            approve_item_between_accounts(rule_instance, transaction_item, approval, approval_time)
        }
        _ => Ok(()),
    }
}

// approveItemBetweenAccounts: matches specific debitor/creditor/item_id
// variable_values = [DEBITOR, CREDITOR, ITEM_ID, APPROVER_ROLE, APPROVER_NAME]
fn approve_item_between_accounts(
    rule_instance: &ApprovalRuleInstance,
    transaction_item: &TransactionItem,
    approval: &mut Approval,
    approval_time: &TZTime,
) -> Result<(), Box<dyn Error>> {
    let debitor = rule_instance.variable_values[0].clone();
    let creditor = rule_instance.variable_values[1].clone();
    let item_id = rule_instance.variable_values[2].clone();
    let approver_role: AccountRole = rule_instance.variable_values[3]
        .clone()
        .parse()
        .map_err(|e| format!("unsupported approver role: {e}"))?;
    let approver_account = rule_instance.variable_values[4].clone();

    // match debitor/creditor/item_id on transaction_item and approver on approval
    if transaction_item.debitor == debitor
        && transaction_item.creditor == creditor
        && transaction_item.item_id == item_id
        && approval.account_role == approver_role
        && approval.account_name == approver_account
    {
        approval.rule_instance_id = rule_instance.id.clone();
        approval.transaction_id = transaction_item.transaction_id.clone();
        approval.transaction_item_id = transaction_item.id.clone();
        approval.approval_time = Some(*approval_time);
    }
    Ok(())
}

// approveAnyCreditItem: auto-approves creditor items
// variable_values = [CREDITOR, APPROVER_ROLE, APPROVER_NAME]
fn approve_any_credit_item(
    rule_instance: &ApprovalRuleInstance,
    transaction_item: &TransactionItem,
    approval: &mut Approval,
    approval_time: &TZTime,
) -> Result<(), Box<dyn Error>> {
    let _creditor = rule_instance.variable_values[0].clone();
    let approver_role: AccountRole = rule_instance.variable_values[1]
        .clone()
        .parse()
        .map_err(|e| format!("unsupported approver role: {e}"))?;
    let approver_account = rule_instance.variable_values[2].clone();
    let rule_instance_id = rule_instance.id.clone();
    let transaction_id = transaction_item.transaction_id.clone();
    let transaction_item_id = transaction_item.id.clone();

    if approval.account_role == approver_role && approval.account_name == approver_account {
        approval.rule_instance_id = rule_instance_id;
        approval.transaction_id = transaction_id;
        approval.transaction_item_id = transaction_item_id;
        approval.account_name = approver_account;
        approval.account_role = approver_role;
        approval.approval_time = Some(*approval_time);
        Ok(())
    } else {
        Err("unmatched approver rule instance from db".into())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_approval_rule_instance(
        rule_name: &str,
        variable_values: Vec<&str>,
    ) -> ApprovalRuleInstance {
        ApprovalRuleInstance {
            id: Some("1".to_string()),
            rule_name: rule_name.to_string(),
            rule_instance_name: "TestRule".to_string(),
            variable_values: variable_values.iter().map(|s| s.to_string()).collect(),
            account_role: AccountRole::Creditor,
            account_name: "GroceryStore".to_string(),
            disabled_time: None,
            removed_time: None,
            created_at: None,
        }
    }

    fn test_transaction_item() -> TransactionItem {
        TransactionItem {
            id: None,
            transaction_id: None,
            item_id: "bread".to_string(),
            price: "3.000".to_string(),
            quantity: "2.000".to_string(),
            rule_instance_id: None,
            rule_exec_ids: Some(vec![]),
            unit_of_measurement: None,
            units_measured: None,
            debitor: "JacobWebb".to_string(),
            creditor: "GroceryStore".to_string(),
            debitor_profile_id: None,
            creditor_profile_id: None,
            debitor_approval_time: None,
            creditor_approval_time: None,
            debitor_rejection_time: None,
            creditor_rejection_time: None,
            debitor_expiration_time: None,
            creditor_expiration_time: None,
            approvals: None,
        }
    }

    fn test_approval() -> Approval {
        Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: "GroceryStore".to_string(),
            account_role: AccountRole::Creditor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: None,
        }
    }

    #[test]
    fn it_errors_on_unsupported_role_in_approve_any_credit_item() {
        let rule_instance = test_approval_rule_instance(
            "approveAnyCreditItem",
            vec!["GroceryStore", "not_a_role", "GroceryStore"],
        );
        let tr_item = test_transaction_item();
        let mut approval = test_approval();
        let approval_time = TZTime::now();

        let result = match_approval_rule(&rule_instance, &tr_item, &mut approval, &approval_time);

        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("unsupported approver role"));
    }

    #[test]
    fn it_errors_on_unsupported_role_in_approve_item_between_accounts() {
        let rule_instance = test_approval_rule_instance(
            "approveItemBetweenAccounts",
            vec![
                "JacobWebb",
                "GroceryStore",
                "bread",
                "not_a_role",
                "GroceryStore",
            ],
        );
        let tr_item = test_transaction_item();
        let mut approval = test_approval();
        let approval_time = TZTime::now();

        let result = match_approval_rule(&rule_instance, &tr_item, &mut approval, &approval_time);

        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("unsupported approver role"));
    }
}
