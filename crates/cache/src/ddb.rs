use async_trait::async_trait;
use aws_sdk_dynamodb::{
    operation::update_item::UpdateItemError,
    types::{AttributeValue, ReturnValue},
    Client,
};
use std::sync::OnceLock;
use types::{
    account::AccountProfile,
    account_role::AccountRole,
    rule::{ApprovalRuleInstances, TransactionItemRuleInstances},
};

use crate::{Cache, CacheError, CacheKey};

static CACHE_TABLE_HASH_KEY: OnceLock<String> = OnceLock::new();
static CACHE_TABLE_RANGE_KEY: OnceLock<String> = OnceLock::new();

fn get_hash_key() -> &'static str {
    CACHE_TABLE_HASH_KEY
        .get_or_init(|| std::env::var("CACHE_TABLE_HASH_KEY").unwrap_or_else(|_| "pk".to_string()))
}

fn get_range_key() -> &'static str {
    CACHE_TABLE_RANGE_KEY
        .get_or_init(|| std::env::var("CACHE_TABLE_RANGE_KEY").unwrap_or_else(|_| "sk".to_string()))
}

pub struct DdbClient {
    client: Client,
    table_name: String,
}

impl DdbClient {
    pub async fn new() -> Result<Self, CacheError> {
        let config = aws_config::load_from_env().await;
        let client = Client::new(&config);
        let table_name = std::env::var("TRANSACTION_DDB_TABLE").map_err(|_| {
            CacheError::ConnectionError("TRANSACTION_DDB_TABLE not set".to_string())
        })?;

        Ok(Self { client, table_name })
    }

    async fn get_item(&self, pk: &str, sk: &str) -> Result<Option<String>, CacheError> {
        let result = self
            .client
            .get_item()
            .table_name(&self.table_name)
            .key(get_hash_key(), AttributeValue::S(pk.to_string()))
            .key(get_range_key(), AttributeValue::S(sk.to_string()))
            .send()
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        match result.item {
            Some(item) => {
                if let Some(AttributeValue::S(data)) = item.get("data") {
                    Ok(Some(data.clone()))
                } else {
                    Ok(None)
                }
            }
            None => Ok(None),
        }
    }

    async fn put_item(&self, pk: &str, sk: &str, data: &str) -> Result<(), CacheError> {
        self.client
            .put_item()
            .table_name(&self.table_name)
            .item(get_hash_key(), AttributeValue::S(pk.to_string()))
            .item(get_range_key(), AttributeValue::S(sk.to_string()))
            .item("data", AttributeValue::S(data.to_string()))
            .send()
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        Ok(())
    }

    async fn query_items(&self, pk: &str) -> Result<Vec<String>, CacheError> {
        let result = self
            .client
            .query()
            .table_name(&self.table_name)
            .key_condition_expression("#pk = :pk")
            .expression_attribute_names("#pk", get_hash_key())
            .expression_attribute_values(":pk", AttributeValue::S(pk.to_string()))
            .send()
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        let items = result.items.unwrap_or_default();
        let mut data_values = Vec::new();

        for item in items {
            if let Some(AttributeValue::S(data)) = item.get("data") {
                data_values.push(data.clone());
            }
        }

        Ok(data_values)
    }
}

#[async_trait]
impl Cache for DdbClient {
    async fn get_transaction_item_rules(
        &self,
        role: AccountRole,
        state: &str,
    ) -> Result<TransactionItemRuleInstances, CacheError> {
        let pk = CacheKey::rules_state(role, state).to_string();
        let items = self.query_items(&pk).await?;

        if items.is_empty() {
            return Err(CacheError::CacheMiss);
        }

        let rules: Result<Vec<_>, _> = items.iter().map(|s| serde_json::from_str(s)).collect();

        rules
            .map(TransactionItemRuleInstances)
            .map_err(|e| CacheError::DeserializationError(e.to_string()))
    }

    async fn set_transaction_item_rules(
        &self,
        role: AccountRole,
        state: &str,
        rules: &TransactionItemRuleInstances,
    ) -> Result<(), CacheError> {
        let pk = CacheKey::rules_state(role, state).to_string();
        for rule in &rules.0 {
            let sk = rule.id.clone().unwrap_or_else(|| "_".to_string());
            let json = serde_json::to_string(rule)
                .map_err(|e| CacheError::SerializationError(e.to_string()))?;
            self.put_item(&pk, &sk, &json).await?;
        }
        Ok(())
    }

    async fn get_approval_rules(
        &self,
        role: AccountRole,
        account: &str,
    ) -> Result<ApprovalRuleInstances, CacheError> {
        let pk = CacheKey::rules_approval(role, account).to_string();
        let items = self.query_items(&pk).await?;

        if items.is_empty() {
            return Err(CacheError::CacheMiss);
        }

        let rules: Result<Vec<_>, _> = items.iter().map(|s| serde_json::from_str(s)).collect();

        rules
            .map(ApprovalRuleInstances)
            .map_err(|e| CacheError::DeserializationError(e.to_string()))
    }

    async fn set_approval_rules(
        &self,
        role: AccountRole,
        account: &str,
        rules: &ApprovalRuleInstances,
    ) -> Result<(), CacheError> {
        let pk = CacheKey::rules_approval(role, account).to_string();
        for rule in &rules.0 {
            let sk = rule.id.clone().unwrap_or_else(|| "_".to_string());
            let json = serde_json::to_string(rule)
                .map_err(|e| CacheError::SerializationError(e.to_string()))?;
            self.put_item(&pk, &sk, &json).await?;
        }
        Ok(())
    }

    async fn get_account_rules(
        &self,
        role: AccountRole,
        account: &str,
    ) -> Result<TransactionItemRuleInstances, CacheError> {
        let pk = CacheKey::rules_account(role, account).to_string();
        let items = self.query_items(&pk).await?;

        if items.is_empty() {
            return Err(CacheError::CacheMiss);
        }

        let rules: Result<Vec<_>, _> = items.iter().map(|s| serde_json::from_str(s)).collect();

        rules
            .map(TransactionItemRuleInstances)
            .map_err(|e| CacheError::DeserializationError(e.to_string()))
    }

    async fn set_account_rules(
        &self,
        role: AccountRole,
        account: &str,
        rules: &TransactionItemRuleInstances,
    ) -> Result<(), CacheError> {
        let pk = CacheKey::rules_account(role, account).to_string();
        for rule in &rules.0 {
            let sk = rule.id.clone().unwrap_or_else(|| "_".to_string());
            let json = serde_json::to_string(rule)
                .map_err(|e| CacheError::SerializationError(e.to_string()))?;
            self.put_item(&pk, &sk, &json).await?;
        }
        Ok(())
    }

    async fn get_account_profile(&self, account: &str) -> Result<AccountProfile, CacheError> {
        let pk = CacheKey::profile(account).to_string();
        let data = self.get_item(&pk, "_").await?;

        match data {
            Some(json) => serde_json::from_str(&json)
                .map_err(|e| CacheError::DeserializationError(e.to_string())),
            None => Err(CacheError::CacheMiss),
        }
    }

    async fn set_account_profile(
        &self,
        account: &str,
        profile: &AccountProfile,
    ) -> Result<(), CacheError> {
        let pk = CacheKey::profile(account).to_string();
        let json = serde_json::to_string(profile)
            .map_err(|e| CacheError::SerializationError(e.to_string()))?;
        self.put_item(&pk, "_", &json).await
    }

    async fn get_profile_id(&self, account: &str) -> Result<String, CacheError> {
        let pk = CacheKey::profile_id(account).to_string();
        let data = self.get_item(&pk, "_").await?;

        data.ok_or(CacheError::CacheMiss)
    }

    async fn set_profile_id(&self, account: &str, id: &str) -> Result<(), CacheError> {
        let pk = CacheKey::profile_id(account).to_string();
        self.put_item(&pk, "_", id).await
    }

    async fn get_account_approvers(&self, account: &str) -> Result<Vec<String>, CacheError> {
        let pk = CacheKey::approvers(account).to_string();
        let items = self.query_items(&pk).await?;

        if items.is_empty() {
            return Err(CacheError::CacheMiss);
        }

        Ok(items)
    }

    async fn set_account_approvers(
        &self,
        account: &str,
        approvers: &[String],
    ) -> Result<(), CacheError> {
        let pk = CacheKey::approvers(account).to_string();
        for approver in approvers {
            self.put_item(&pk, approver, approver).await?;
        }
        Ok(())
    }

    async fn get(&self, key: &str) -> Result<Option<String>, CacheError> {
        self.get_item(key, "_").await
    }

    async fn set(&self, key: &str, value: &str) -> Result<(), CacheError> {
        self.put_item(key, "_", value).await
    }

    async fn smembers(&self, key: &str) -> Result<Vec<String>, CacheError> {
        self.query_items(key).await
    }

    async fn incr_float(&self, key: &str, amount: &str) -> Result<String, CacheError> {
        let current = self
            .get_item(key, "_")
            .await?
            .unwrap_or_else(|| "0".to_string());
        let current_val: f64 = current.parse().unwrap_or(0.0);
        let increment: f64 = amount.parse().unwrap_or(0.0);
        let new_val = current_val + increment;
        let new_str = new_val.to_string();
        self.put_item(key, "_", &new_str).await?;
        Ok(new_str)
    }

    async fn incr_and_check_threshold(
        &self,
        key: &str,
        amount: &str,
        threshold: &str,
    ) -> Result<(String, bool), CacheError> {
        let amount_f64: f64 = amount.parse().unwrap_or(0.0);
        let threshold_f64: f64 = threshold.parse().unwrap_or(0.0);

        // step 1: atomic increment using ADD on numeric attribute
        let result = self
            .client
            .update_item()
            .table_name(&self.table_name)
            .key(get_hash_key(), AttributeValue::S(key.to_string()))
            .key(get_range_key(), AttributeValue::S("_".to_string()))
            .update_expression("ADD #acc :amount")
            .expression_attribute_names("#acc", "acc")
            .expression_attribute_values(":amount", AttributeValue::N(amount_f64.to_string()))
            .return_values(ReturnValue::AllNew)
            .send()
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        let new_val = result
            .attributes()
            .and_then(|attrs| attrs.get("acc"))
            .and_then(|v| match v {
                AttributeValue::N(n) => n.parse::<f64>().ok(),
                _ => None,
            })
            .unwrap_or(0.0);

        if new_val < threshold_f64 {
            return Ok((new_val.to_string(), false));
        }

        // step 2: conditional subtract — only one caller wins
        let subtract_result = self
            .client
            .update_item()
            .table_name(&self.table_name)
            .key(get_hash_key(), AttributeValue::S(key.to_string()))
            .key(get_range_key(), AttributeValue::S("_".to_string()))
            .update_expression("ADD #acc :neg")
            .expression_attribute_names("#acc", "acc")
            .expression_attribute_values(":neg", AttributeValue::N((-threshold_f64).to_string()))
            .expression_attribute_values(":threshold", AttributeValue::N(threshold.to_string()))
            .condition_expression("#acc >= :threshold")
            .send()
            .await;

        match subtract_result {
            Ok(_) => Ok((new_val.to_string(), true)),
            Err(sdk_err) => {
                let is_condition_failed = sdk_err
                    .as_service_error()
                    .is_some_and(UpdateItemError::is_conditional_check_failed_exception);
                if is_condition_failed {
                    Ok((new_val.to_string(), false))
                } else {
                    Err(CacheError::ConnectionError(sdk_err.to_string()))
                }
            }
        }
    }

    async fn del(&self, key: &str) -> Result<(), CacheError> {
        self.client
            .delete_item()
            .table_name(&self.table_name)
            .key(get_hash_key(), AttributeValue::S(key.to_string()))
            .key(get_range_key(), AttributeValue::S("_".to_string()))
            .send()
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_rules_state_key() {
        let key = CacheKey::RulesState {
            role: AccountRole::Creditor,
            state: "California",
        }
        .to_string();
        assert!(key.ends_with(":creditor:California"));
    }

    #[test]
    fn it_creates_rules_account_key() {
        let key = CacheKey::RulesAccount {
            role: AccountRole::Debitor,
            account: "JacobWebb",
        }
        .to_string();
        assert!(key.ends_with(":debitor:JacobWebb"));
    }

    #[test]
    fn it_creates_rules_approval_key() {
        let key = CacheKey::RulesApproval {
            role: AccountRole::Debitor,
            account: "IgorPetrov",
        }
        .to_string();
        assert!(key.ends_with(":debitor:IgorPetrov"));
    }

    #[test]
    fn it_creates_profile_key() {
        let key = CacheKey::Profile {
            account: "GroceryStore",
        }
        .to_string();
        assert!(key.ends_with(":GroceryStore"));
    }

    #[test]
    fn it_creates_profile_id_key() {
        let key = CacheKey::ProfileId {
            account: "GroceryStore",
        }
        .to_string();
        assert!(key.ends_with(":GroceryStore"));
    }

    #[test]
    fn it_creates_approvers_key() {
        let key = CacheKey::Approvers {
            account: "GroceryStore",
        }
        .to_string();
        assert!(key.ends_with(":GroceryStore"));
    }
}
