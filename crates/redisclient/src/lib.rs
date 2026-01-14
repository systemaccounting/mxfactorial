use async_trait::async_trait;
use cache::{Cache, CacheError};
use fred::prelude::*;
use fred::types::Message;
use std::sync::OnceLock;
use tokio::sync::broadcast::Receiver as BroadcastReceiver;
use types::{account::AccountProfile, account_role::AccountRole, rule::RuleInstances};

static CACHE_KEY_RULES_STATE: OnceLock<String> = OnceLock::new();
static CACHE_KEY_RULES_ACCOUNT: OnceLock<String> = OnceLock::new();
static CACHE_KEY_PROFILE: OnceLock<String> = OnceLock::new();
static CACHE_KEY_PROFILE_ID: OnceLock<String> = OnceLock::new();
static CACHE_KEY_APPROVERS: OnceLock<String> = OnceLock::new();

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

pub struct RedisClient {
    inner: fred::clients::RedisClient,
}

impl RedisClient {
    pub async fn new() -> Self {
        let redis_uri = Self::redis_uri_from_env();
        let redis_config = RedisConfig::from_url(&redis_uri).unwrap();
        let redis_client = Builder::from_config(redis_config).build().unwrap();
        Self {
            inner: redis_client,
        }
    }

    fn redis_uri_from_env() -> String {
        let redis_db = std::env::var("REDIS_DB").unwrap();
        let redis_host = std::env::var("REDIS_HOST").unwrap();
        let redis_port = std::env::var("REDIS_PORT").unwrap();
        let redis_username = std::env::var("REDIS_USERNAME").unwrap();
        let redis_password = std::env::var("REDIS_PASSWORD").unwrap();
        redis_uri(
            &redis_db,
            &redis_host,
            &redis_port,
            &redis_username,
            &redis_password,
        )
    }

    pub async fn init(&self) -> Result<(), RedisError> {
        match self.inner.init().await {
            Ok(_) => {
                tracing::info!("redis client initialized");
                Ok(())
            }
            Err(e) => {
                tracing::error!("failed to initialize redis client: {:?}", e);
                Err(e)
            }
        }
    }

    pub async fn eval(
        &self,
        script: &str,
        keys: Vec<String>,
        args: Vec<String>,
    ) -> Result<RedisValue, RedisError> {
        self.inner.eval(script, keys, args).await
    }

    pub async fn subscribe(&self, channels: Vec<String>) -> Result<(), RedisError> {
        self.inner.subscribe(channels).await
    }

    pub fn message_rx(&self) -> BroadcastReceiver<Message> {
        self.inner.message_rx()
    }

    pub async fn get(&self, key: &str) -> Result<Option<String>, RedisError> {
        self.inner.get(key).await
    }

    pub async fn set(&self, key: &str, value: &str) -> Result<(), RedisError> {
        self.inner.set(key, value, None, None, false).await
    }

    pub async fn sadd(&self, key: &str, value: &str) -> Result<i64, RedisError> {
        self.inner.sadd(key, value).await
    }

    pub async fn smembers(&self, key: &str) -> Result<Vec<String>, RedisError> {
        self.inner.smembers(key).await
    }

    pub async fn srem(&self, key: &str, value: &str) -> Result<i64, RedisError> {
        self.inner.srem(key, value).await
    }
}

fn redis_uri(
    redis_db: &str,
    redis_host: &str,
    redis_port: &str,
    redis_username: &str,
    redis_password: &str,
) -> String {
    format!("redis://{redis_username}:{redis_password}@{redis_host}:{redis_port}/{redis_db}")
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
impl Cache for RedisClient {
    async fn get_transaction_item_rules(
        &self,
        role: AccountRole,
        state: &str,
    ) -> Result<RuleInstances, CacheError> {
        let key = rules_state_key(role, state);
        let members: Vec<String> = self
            .smembers(&key)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        if members.is_empty() {
            return Err(CacheError::CacheMiss);
        }

        let rules: Result<Vec<_>, _> = members.iter().map(|s| serde_json::from_str(s)).collect();

        rules
            .map(RuleInstances)
            .map_err(|e| CacheError::DeserializationError(e.to_string()))
    }

    async fn set_transaction_item_rules(
        &self,
        role: AccountRole,
        state: &str,
        rules: &RuleInstances,
    ) -> Result<(), CacheError> {
        let key = rules_state_key(role, state);
        for rule in &rules.0 {
            let json = serde_json::to_string(rule)
                .map_err(|e| CacheError::SerializationError(e.to_string()))?;
            self.sadd(&key, &json)
                .await
                .map_err(|e| CacheError::ConnectionError(e.to_string()))?;
        }
        Ok(())
    }

    async fn get_approval_rules(
        &self,
        role: AccountRole,
        account: &str,
    ) -> Result<RuleInstances, CacheError> {
        let key = rules_account_key(role, account);
        let members: Vec<String> = self
            .smembers(&key)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        if members.is_empty() {
            return Err(CacheError::CacheMiss);
        }

        let rules: Result<Vec<_>, _> = members.iter().map(|s| serde_json::from_str(s)).collect();

        rules
            .map(RuleInstances)
            .map_err(|e| CacheError::DeserializationError(e.to_string()))
    }

    async fn set_approval_rules(
        &self,
        role: AccountRole,
        account: &str,
        rules: &RuleInstances,
    ) -> Result<(), CacheError> {
        let key = rules_account_key(role, account);
        for rule in &rules.0 {
            let json = serde_json::to_string(rule)
                .map_err(|e| CacheError::SerializationError(e.to_string()))?;
            self.sadd(&key, &json)
                .await
                .map_err(|e| CacheError::ConnectionError(e.to_string()))?;
        }
        Ok(())
    }

    async fn get_account_rules(
        &self,
        role: AccountRole,
        account: &str,
    ) -> Result<RuleInstances, CacheError> {
        // same key pattern as approval rules for account-based lookups
        self.get_approval_rules(role, account).await
    }

    async fn set_account_rules(
        &self,
        role: AccountRole,
        account: &str,
        rules: &RuleInstances,
    ) -> Result<(), CacheError> {
        self.set_approval_rules(role, account, rules).await
    }

    async fn get_account_profile(&self, account: &str) -> Result<AccountProfile, CacheError> {
        let key = profile_key(account);
        let value: Option<String> = self
            .get(&key)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        match value {
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
        let key = profile_key(account);
        let json = serde_json::to_string(profile)
            .map_err(|e| CacheError::SerializationError(e.to_string()))?;
        self.set(&key, &json)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))
    }

    async fn get_profile_id(&self, account: &str) -> Result<String, CacheError> {
        let key = profile_id_key(account);
        let value: Option<String> = self
            .get(&key)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        value.ok_or(CacheError::CacheMiss)
    }

    async fn set_profile_id(&self, account: &str, id: &str) -> Result<(), CacheError> {
        let key = profile_id_key(account);
        self.set(&key, id)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))
    }

    async fn get_account_approvers(&self, account: &str) -> Result<Vec<String>, CacheError> {
        let key = approvers_key(account);
        let members: Vec<String> = self
            .smembers(&key)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        if members.is_empty() {
            return Err(CacheError::CacheMiss);
        }

        Ok(members)
    }

    async fn set_account_approvers(
        &self,
        account: &str,
        approvers: &[String],
    ) -> Result<(), CacheError> {
        let key = approvers_key(account);
        for approver in approvers {
            self.sadd(&key, approver)
                .await
                .map_err(|e| CacheError::ConnectionError(e.to_string()))?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_a_redis_conn_uri() {
        let redis_db = "0";
        let redis_host = "localhost";
        let redis_port = "6379";
        let redis_username = "admin";
        let redis_password = "password";
        let uri = redis_uri(
            redis_db,
            redis_host,
            redis_port,
            redis_username,
            redis_password,
        );
        assert_eq!(uri, "redis://admin:password@localhost:6379/0");
    }

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

#[cfg(all(test, feature = "cache_tests"))]
mod integration_tests {
    use super::*;
    use cache::Cache;
    use types::rule::RuleInstance;

    async fn get_client() -> RedisClient {
        let client = RedisClient::new().await;
        client.init().await.expect("failed to init redis");
        client
    }

    async fn delete_test_keys(client: &RedisClient, keys: &[&str]) {
        for key in keys {
            let _: Option<i64> = client.inner.del(*key).await.ok();
        }
    }

    #[tokio::test]
    async fn it_sets_and_gets_profile_id() {
        let client = get_client().await;
        let key = &profile_id_key("TestAccount");
        delete_test_keys(&client, &[key]).await;

        let account = "TestAccount";
        let id = "123";

        client.set_profile_id(account, id).await.unwrap();
        let result = client.get_profile_id(account).await.unwrap();

        assert_eq!(result, id);
    }

    #[tokio::test]
    async fn it_returns_cache_miss_for_missing_profile_id() {
        let client = get_client().await;
        let key = &profile_id_key("NonExistent");
        delete_test_keys(&client, &[key]).await;

        let result = client.get_profile_id("NonExistent").await;
        assert!(matches!(result, Err(CacheError::CacheMiss)));
    }

    #[tokio::test]
    async fn it_sets_and_gets_account_profile() {
        let client = get_client().await;
        let key = &profile_key("TestAccount");
        delete_test_keys(&client, &[key]).await;

        let profile = AccountProfile {
            id: Some("1".to_string()),
            account_name: "TestAccount".to_string(),
            description: Some("Test description".to_string()),
            first_name: Some("Test".to_string()),
            middle_name: None,
            last_name: Some("User".to_string()),
            country_name: "USA".to_string(),
            street_number: None,
            street_name: None,
            floor_number: None,
            unit_number: None,
            city_name: "Los Angeles".to_string(),
            county_name: None,
            region_name: None,
            state_name: "California".to_string(),
            postal_code: "90001".to_string(),
            latlng: None,
            email_address: "test@example.com".to_string(),
            telephone_country_code: None,
            telephone_area_code: None,
            telephone_number: None,
            occupation_id: None,
            industry_id: None,
            removal_time: None,
        };

        client
            .set_account_profile("TestAccount", &profile)
            .await
            .unwrap();
        let result = client.get_account_profile("TestAccount").await.unwrap();

        assert_eq!(result.account_name, "TestAccount");
        assert_eq!(result.state_name, "California");
    }

    #[tokio::test]
    async fn it_sets_and_gets_account_approvers() {
        let client = get_client().await;
        let key = &approvers_key("TestAccount");
        delete_test_keys(&client, &[key]).await;

        let approvers = vec!["Approver1".to_string(), "Approver2".to_string()];

        client
            .set_account_approvers("TestAccount", &approvers)
            .await
            .unwrap();
        let result = client.get_account_approvers("TestAccount").await.unwrap();

        assert_eq!(result.len(), 2);
        assert!(result.contains(&"Approver1".to_string()));
        assert!(result.contains(&"Approver2".to_string()));
    }

    #[tokio::test]
    async fn it_sets_and_gets_transaction_item_rules() {
        let client = get_client().await;
        let key = &rules_state_key(AccountRole::Creditor, "California");
        delete_test_keys(&client, &[key]).await;

        let rule = RuleInstance {
            id: Some("1".to_string()),
            rule_type: "transaction_item".to_string(),
            rule_name: "multiplyItemValue".to_string(),
            rule_instance_name: "NinePercentSalesTax".to_string(),
            variable_values: vec![
                "ANY".to_string(),
                "StateOfCalifornia".to_string(),
                "9% state sales tax".to_string(),
                "0.09".to_string(),
            ],
            account_role: AccountRole::Creditor,
            item_id: None,
            price: None,
            quantity: None,
            unit_of_measurement: None,
            units_measured: None,
            account_name: None,
            first_name: None,
            middle_name: None,
            last_name: None,
            country_name: None,
            street_id: None,
            street_name: None,
            floor_number: None,
            unit_id: None,
            city_name: None,
            county_name: None,
            region_name: None,
            state_name: Some("California".to_string()),
            postal_code: None,
            latlng: None,
            email_address: None,
            telephone_country_code: None,
            telephone_area_code: None,
            telephone_number: None,
            occupation_id: None,
            industry_id: None,
            disabled_time: None,
            removed_time: None,
            created_at: None,
        };
        let rules = RuleInstances(vec![rule]);

        client
            .set_transaction_item_rules(AccountRole::Creditor, "California", &rules)
            .await
            .unwrap();
        let result = client
            .get_transaction_item_rules(AccountRole::Creditor, "California")
            .await
            .unwrap();

        assert_eq!(result.0.len(), 1);
        assert_eq!(result.0[0].rule_name, "multiplyItemValue");
    }

    #[tokio::test]
    async fn it_sets_and_gets_approval_rules() {
        let client = get_client().await;
        let key = &rules_account_key(AccountRole::Creditor, "TestAccount");
        delete_test_keys(&client, &[key]).await;

        let rule = RuleInstance {
            id: Some("1".to_string()),
            rule_type: "approval".to_string(),
            rule_name: "approveAnyCreditItem".to_string(),
            rule_instance_name: "ApproveAllCredits".to_string(),
            variable_values: vec![],
            account_role: AccountRole::Creditor,
            item_id: None,
            price: None,
            quantity: None,
            unit_of_measurement: None,
            units_measured: None,
            account_name: Some("TestAccount".to_string()),
            first_name: None,
            middle_name: None,
            last_name: None,
            country_name: None,
            street_id: None,
            street_name: None,
            floor_number: None,
            unit_id: None,
            city_name: None,
            county_name: None,
            region_name: None,
            state_name: None,
            postal_code: None,
            latlng: None,
            email_address: None,
            telephone_country_code: None,
            telephone_area_code: None,
            telephone_number: None,
            occupation_id: None,
            industry_id: None,
            disabled_time: None,
            removed_time: None,
            created_at: None,
        };
        let rules = RuleInstances(vec![rule]);

        client
            .set_approval_rules(AccountRole::Creditor, "TestAccount", &rules)
            .await
            .unwrap();
        let result = client
            .get_approval_rules(AccountRole::Creditor, "TestAccount")
            .await
            .unwrap();

        assert_eq!(result.0.len(), 1);
        assert_eq!(result.0[0].rule_name, "approveAnyCreditItem");
    }
}
