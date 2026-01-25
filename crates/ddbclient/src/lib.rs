use async_trait::async_trait;
use aws_sdk_dynamodb::{types::AttributeValue, Client};
use cache::{Cache, CacheError};
use std::sync::OnceLock;
use types::{
    account::AccountProfile,
    account_role::AccountRole,
    rule::{ApprovalRuleInstances, TransactionItemRuleInstances},
};

static CACHE_TABLE_HASH_KEY: OnceLock<String> = OnceLock::new();
static CACHE_TABLE_RANGE_KEY: OnceLock<String> = OnceLock::new();
static CACHE_KEY_RULES_STATE: OnceLock<String> = OnceLock::new();
static CACHE_KEY_RULES_ACCOUNT: OnceLock<String> = OnceLock::new();
static CACHE_KEY_PROFILE: OnceLock<String> = OnceLock::new();
static CACHE_KEY_PROFILE_ID: OnceLock<String> = OnceLock::new();
static CACHE_KEY_APPROVERS: OnceLock<String> = OnceLock::new();

fn get_hash_key() -> &'static str {
    CACHE_TABLE_HASH_KEY
        .get_or_init(|| std::env::var("CACHE_TABLE_HASH_KEY").unwrap_or_else(|_| "pk".to_string()))
}

fn get_range_key() -> &'static str {
    CACHE_TABLE_RANGE_KEY
        .get_or_init(|| std::env::var("CACHE_TABLE_RANGE_KEY").unwrap_or_else(|_| "sk".to_string()))
}

fn get_cache_key_rules_state() -> &'static str {
    CACHE_KEY_RULES_STATE.get_or_init(|| {
        std::env::var("CACHE_KEY_RULES_STATE").unwrap_or_else(|_| "rules:state".to_string())
    })
}

fn get_cache_key_rules_account() -> &'static str {
    CACHE_KEY_RULES_ACCOUNT.get_or_init(|| {
        std::env::var("CACHE_KEY_RULES_ACCOUNT").unwrap_or_else(|_| "rules:account".to_string())
    })
}

fn get_cache_key_profile() -> &'static str {
    CACHE_KEY_PROFILE.get_or_init(|| {
        std::env::var("CACHE_KEY_PROFILE").unwrap_or_else(|_| "profile".to_string())
    })
}

fn get_cache_key_profile_id() -> &'static str {
    CACHE_KEY_PROFILE_ID.get_or_init(|| {
        std::env::var("CACHE_KEY_PROFILE_ID").unwrap_or_else(|_| "profile_id".to_string())
    })
}

fn get_cache_key_approvers() -> &'static str {
    CACHE_KEY_APPROVERS.get_or_init(|| {
        std::env::var("CACHE_KEY_APPROVERS").unwrap_or_else(|_| "approvers".to_string())
    })
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

fn rules_state_key(role: AccountRole, state: &str) -> String {
    format!(
        "{}:{}:{}",
        get_cache_key_rules_state(),
        role.to_string().to_lowercase(),
        state
    )
}

fn rules_account_key(role: AccountRole, account: &str) -> String {
    format!(
        "{}:{}:{}",
        get_cache_key_rules_account(),
        role.to_string().to_lowercase(),
        account
    )
}

fn profile_key(account: &str) -> String {
    format!("{}:{}", get_cache_key_profile(), account)
}

fn profile_id_key(account: &str) -> String {
    format!("{}:{}", get_cache_key_profile_id(), account)
}

fn approvers_key(account: &str) -> String {
    format!("{}:{}", get_cache_key_approvers(), account)
}

#[async_trait]
impl Cache for DdbClient {
    async fn get_transaction_item_rules(
        &self,
        role: AccountRole,
        state: &str,
    ) -> Result<TransactionItemRuleInstances, CacheError> {
        let pk = rules_state_key(role, state);
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
        let pk = rules_state_key(role, state);
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
        let pk = rules_account_key(role, account);
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
        let pk = rules_account_key(role, account);
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
        let pk = rules_account_key(role, account);
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
        let pk = rules_account_key(role, account);
        for rule in &rules.0 {
            let sk = rule.id.clone().unwrap_or_else(|| "_".to_string());
            let json = serde_json::to_string(rule)
                .map_err(|e| CacheError::SerializationError(e.to_string()))?;
            self.put_item(&pk, &sk, &json).await?;
        }
        Ok(())
    }

    async fn get_account_profile(&self, account: &str) -> Result<AccountProfile, CacheError> {
        let pk = profile_key(account);
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
        let pk = profile_key(account);
        let json = serde_json::to_string(profile)
            .map_err(|e| CacheError::SerializationError(e.to_string()))?;
        self.put_item(&pk, "_", &json).await
    }

    async fn get_profile_id(&self, account: &str) -> Result<String, CacheError> {
        let pk = profile_id_key(account);
        let data = self.get_item(&pk, "_").await?;

        data.ok_or(CacheError::CacheMiss)
    }

    async fn set_profile_id(&self, account: &str, id: &str) -> Result<(), CacheError> {
        let pk = profile_id_key(account);
        self.put_item(&pk, "_", id).await
    }

    async fn get_account_approvers(&self, account: &str) -> Result<Vec<String>, CacheError> {
        let pk = approvers_key(account);
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
        let pk = approvers_key(account);
        for approver in approvers {
            self.put_item(&pk, approver, approver).await?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_rules_state_key() {
        let key = rules_state_key(AccountRole::Creditor, "California");
        assert!(key.ends_with(":creditor:California"));
    }

    #[test]
    fn it_creates_rules_account_key() {
        let key = rules_account_key(AccountRole::Debitor, "JacobWebb");
        assert!(key.ends_with(":debitor:JacobWebb"));
    }

    #[test]
    fn it_creates_profile_key() {
        let key = profile_key("GroceryStore");
        assert!(key.ends_with(":GroceryStore"));
    }

    #[test]
    fn it_creates_profile_id_key() {
        let key = profile_id_key("GroceryStore");
        assert!(key.ends_with(":GroceryStore"));
    }

    #[test]
    fn it_creates_approvers_key() {
        let key = approvers_key("GroceryStore");
        assert!(key.ends_with(":GroceryStore"));
    }
}
