use std::{error::Error, vec};

use types::{
    account_role::AccountRole,
    rule::RuleInstance,
    transaction_item::{TransactionItem, TransactionItems},
};

use crate::rules::tokens;
use crate::rules::utils;

pub fn match_transaction_item_rule(
    rule_instance: &RuleInstance,
    transaction_item: &mut TransactionItem,
) -> Result<TransactionItems, Box<dyn Error>> {
    let account_role = rule_instance.account_role;
    let rule_name = rule_instance.rule_name.as_str();
    match account_role {
        AccountRole::Debitor => Ok(TransactionItems(vec![])),
        AccountRole::Creditor => match rule_name {
            "multiplyItemValue" => multiply_item_value(rule_instance, transaction_item),
            _ => Err("transaction_item rule not found".into()),
        },
    }
}

fn multiply_item_value(
    rule_instance: &RuleInstance,
    transaction_item: &mut TransactionItem,
) -> Result<TransactionItems, Box<dyn Error>> {
    let debitor = rule_instance.variable_values[0].clone();
    let creditor = rule_instance.variable_values[1].clone();
    let item_name = rule_instance.variable_values[2].clone();
    let factor: f32 = rule_instance.variable_values[3].clone().parse().unwrap();

    let price: f32 = transaction_item.price.clone().parse().unwrap();
    let quantity =
        utils::number_to_fixed_string(transaction_item.quantity.clone().parse::<f32>().unwrap());
    let rule_apply_sequence = transaction_item.debitor_first;
    let rule_instance_id = rule_instance.id.clone().unwrap();
    let unit_of_measurement = transaction_item.unit_of_measurement.clone();
    let units_measured = transaction_item.units_measured.clone();

    let added_item_value = utils::number_to_fixed_string(price * factor);
    let rule_exec_id = utils::create_rule_exec_id();

    // add rule exec id to user transaction item, and push since user
    // created transaction items may have rule_exec_ids.length >= 0
    transaction_item
        .rule_exec_ids
        .as_mut()
        .unwrap()
        .push(rule_exec_id.clone());

    let post_token_debitor: String = match debitor.as_str() {
        tokens::ANY => transaction_item.debitor.clone(),
        _ => debitor.clone(),
    };

    let post_token_creditor: String = match creditor.as_str() {
        tokens::ANY => transaction_item.creditor.clone(),
        _ => creditor.clone(),
    };

    let added_transaction_item = TransactionItem {
        id: None,
        transaction_id: None,
        item_id: item_name,
        price: added_item_value,
        quantity,
        debitor_first: rule_apply_sequence,
        rule_instance_id: Some(rule_instance_id),
        rule_exec_ids: Some(vec![rule_exec_id]),
        unit_of_measurement,
        units_measured,
        debitor: post_token_debitor,
        creditor: post_token_creditor,
        debitor_profile_id: None,
        creditor_profile_id: None,
        debitor_approval_time: None,
        creditor_approval_time: None,
        debitor_rejection_time: None,
        creditor_rejection_time: None,
        debitor_expiration_time: None,
        creditor_expiration_time: None,
        approvals: None,
    };

    Ok(TransactionItems(vec![added_transaction_item]))
}
