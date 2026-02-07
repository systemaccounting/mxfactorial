use std::{error::Error, vec};

use types::{
    account_role::AccountRole,
    rule::TransactionItemRuleInstance,
    transaction_item::{TransactionItem, TransactionItems},
};

use crate::rules::tokens;
use crate::rules::utils;

pub fn match_transaction_item_rule(
    rule_instance: &TransactionItemRuleInstance,
    transaction_item: TransactionItem,
) -> Result<TransactionItems, Box<dyn Error>> {
    let account_role = rule_instance.account_role;
    let rule_name = rule_instance.rule_name.as_str();
    match account_role {
        AccountRole::Debitor => Ok(TransactionItems(vec![])),
        AccountRole::Creditor => match rule_name {
            "multiplyItemValue" => multiply_item_value(rule_instance, transaction_item),
            "appendMultipliedItemValue" => {
                append_multiplied_item_value(rule_instance, transaction_item)
            }
            _ => Err("transaction_item rule not found".into()),
        },
    }
}

// multiply_item_value returns just the computed item (no original)
// wraps append_multiplied_item_value and returns only the second item
// variable_values = [DEBITOR, CREDITOR, ITEM_NAME, FACTOR]
fn multiply_item_value(
    rule_instance: &TransactionItemRuleInstance,
    transaction_item: TransactionItem,
) -> Result<TransactionItems, Box<dyn Error>> {
    let items = append_multiplied_item_value(rule_instance, transaction_item)?;
    Ok(TransactionItems(vec![items.0[1].clone()]))
}

// append_multiplied_item_value returns [original_with_exec_id, computed_item]
// variable_values = [DEBITOR, CREDITOR, ITEM_NAME, FACTOR]
fn append_multiplied_item_value(
    rule_instance: &TransactionItemRuleInstance,
    transaction_item: TransactionItem,
) -> Result<TransactionItems, Box<dyn Error>> {
    let debitor = rule_instance.variable_values[0].clone();
    let creditor = rule_instance.variable_values[1].clone();
    let item_name = rule_instance.variable_values[2].clone();
    let factor: f32 = rule_instance.variable_values[3].clone().parse().unwrap();

    let price: f32 = transaction_item.price.clone().parse().unwrap();
    let quantity =
        utils::number_to_fixed_string(transaction_item.quantity.clone().parse::<f32>().unwrap());
    let rule_instance_id = rule_instance.id.clone().unwrap();
    let rule_exec_id = utils::create_rule_exec_id();

    // clone original and add rule_exec_id
    let mut original_with_exec_id = transaction_item.clone();
    original_with_exec_id
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

    let computed_item = TransactionItem {
        id: None,
        transaction_id: None,
        item_id: item_name,
        price: utils::number_to_fixed_string(price * factor),
        quantity,
        rule_instance_id: Some(rule_instance_id),
        rule_exec_ids: Some(vec![rule_exec_id]),
        unit_of_measurement: transaction_item.unit_of_measurement.clone(),
        units_measured: transaction_item.units_measured.clone(),
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

    Ok(TransactionItems(vec![original_with_exec_id, computed_item]))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_rule_instance(
        rule_name: &str,
        variable_values: Vec<&str>,
    ) -> TransactionItemRuleInstance {
        TransactionItemRuleInstance {
            id: Some("1".to_string()),
            rule_name: rule_name.to_string(),
            rule_instance_name: "TestRule".to_string(),
            variable_values: variable_values.iter().map(|s| s.to_string()).collect(),
            account_role: AccountRole::Creditor,
            account_name: None,
            item_id: None,
            price: None,
            quantity: None,
            country_name: None,
            city_name: None,
            county_name: None,
            state_name: None,
            latlng: None,
            occupation_id: None,
            industry_id: None,
            disabled_time: None,
            removed_time: None,
            created_at: None,
            transaction_rule_instance_id: None,
        }
    }

    fn test_transaction_item(price: &str, quantity: &str) -> TransactionItem {
        TransactionItem {
            id: None,
            transaction_id: None,
            item_id: "test item".to_string(),
            price: price.to_string(),
            quantity: quantity.to_string(),
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

    #[test]
    fn it_returns_only_computed_item_from_multiply() {
        let rule_instance = test_rule_instance(
            "multiplyItemValue",
            vec!["ANY", "StateOfCalifornia", "1% dividend", "0.01"],
        );
        let item = test_transaction_item("1000.000", "1");

        let result = multiply_item_value(&rule_instance, item).unwrap();

        assert_eq!(result.0.len(), 1);
        assert_eq!(result.0[0].price, "10.000");
        assert_eq!(result.0[0].item_id, "1% dividend");
    }

    #[test]
    fn it_returns_both_items_from_append() {
        let rule_instance = test_rule_instance(
            "appendMultipliedItemValue",
            vec!["ANY", "StateOfCalifornia", "9% sales tax", "0.09"],
        );
        let item = test_transaction_item("10.000", "1");

        let result = append_multiplied_item_value(&rule_instance, item).unwrap();

        assert_eq!(result.0.len(), 2);
        // first item is original with rule_exec_id added
        assert_eq!(result.0[0].item_id, "test item");
        assert!(!result.0[0].rule_exec_ids.as_ref().unwrap().is_empty());
        // second item is computed
        assert_eq!(result.0[1].price, "0.900");
        assert_eq!(result.0[1].item_id, "9% sales tax");
        assert_eq!(result.0[1].creditor, "StateOfCalifornia");
    }

    #[test]
    fn it_uses_any_token_for_debitor() {
        let rule_instance = test_rule_instance(
            "appendMultipliedItemValue",
            vec!["ANY", "StateOfCalifornia", "tax", "0.1"],
        );
        let mut item = test_transaction_item("100.000", "1");
        item.debitor = "CustomDebitor".to_string();

        let result = append_multiplied_item_value(&rule_instance, item).unwrap();

        assert_eq!(result.0[1].debitor, "CustomDebitor");
    }

    #[test]
    fn it_returns_empty_for_debitor_role() {
        let mut rule_instance = test_rule_instance(
            "multiplyItemValue",
            vec!["ANY", "StateOfCalifornia", "item", "0.01"],
        );
        rule_instance.account_role = AccountRole::Debitor;
        let item = test_transaction_item("100.000", "1");

        let result = match_transaction_item_rule(&rule_instance, item).unwrap();

        assert!(result.0.is_empty());
    }

    #[test]
    fn it_errors_on_unknown_rule() {
        let rule_instance = test_rule_instance("unknownRule", vec![]);
        let item = test_transaction_item("100.000", "1");

        let result = match_transaction_item_rule(&rule_instance, item);

        assert!(result.is_err());
    }
}
