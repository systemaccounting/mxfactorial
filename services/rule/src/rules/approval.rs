use std::error::Error;

use types::{
    account_role::AccountRole, approval::Approval, rule::RuleInstance, time::TZTime,
    transaction_item::TransactionItem,
};

pub fn match_approval_rule(
    rule_instance: &RuleInstance,
    transaction_item: &TransactionItem,
    approval: &mut Approval,
    approval_time: &TZTime,
) -> Result<(), Box<dyn Error>> {
    let rule_name = rule_instance.rule_name.as_str();
    match rule_name {
        "approveAnyCreditItem" => {
            approve_any_credit_item(rule_instance, transaction_item, approval, approval_time)
        }
        _ => Ok(()),
    }
}

fn approve_any_credit_item(
    rule_instance: &RuleInstance,
    transaction_item: &TransactionItem,
    approval: &mut Approval,
    approval_time: &TZTime,
) -> Result<(), Box<dyn Error>> {
    let _creditor = rule_instance.variable_values[0].clone();
    let approver_role: AccountRole = rule_instance.variable_values[1].clone().parse().unwrap();
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
        approval.approval_time = Some(approval_time.clone());
        Ok(())
    } else {
        Err("unmatched approver rule instance from db".into())
    }
}
