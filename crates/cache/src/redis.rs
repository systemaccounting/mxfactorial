use async_trait::async_trait;
use fred::prelude::*;
use fred::types::Message;
use tokio::sync::broadcast::Receiver as BroadcastReceiver;
use types::{
    account::AccountProfile,
    account_role::AccountRole,
    rule::{ApprovalRuleInstances, TransactionItemRuleInstances},
};

use crate::{Cache, CacheError, CacheKey};

pub struct RedisClient {
    inner: Client,
}

impl RedisClient {
    pub async fn new() -> Result<Self, CacheError> {
        let redis_uri = Self::redis_uri_from_env()?;
        let redis_config =
            Config::from_url(&redis_uri).map_err(|e| CacheError::ConnectionError(e.to_string()))?;
        let redis_client = Builder::from_config(redis_config)
            .build()
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;
        Ok(Self {
            inner: redis_client,
        })
    }

    fn redis_uri_from_env() -> Result<String, CacheError> {
        Ok(envvar::redis_uri()?)
    }

    pub async fn init(&self) -> Result<(), Error> {
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
    ) -> Result<Value, Error> {
        self.inner.eval(script, keys, args).await
    }

    pub async fn subscribe(&self, channels: Vec<String>) -> Result<(), Error> {
        self.inner.subscribe(channels).await
    }

    pub fn message_rx(&self) -> BroadcastReceiver<Message> {
        self.inner.message_rx()
    }

    pub async fn get(&self, key: &str) -> Result<Option<String>, Error> {
        self.inner.get(key).await
    }

    pub async fn set(&self, key: &str, value: &str) -> Result<(), Error> {
        self.inner.set(key, value, None, None, false).await
    }

    pub async fn sadd(&self, key: &str, value: &str) -> Result<i64, Error> {
        self.inner.sadd(key, value).await
    }

    pub async fn smembers(&self, key: &str) -> Result<Vec<String>, Error> {
        self.inner.smembers(key).await
    }

    pub async fn srem(&self, key: &str, value: &str) -> Result<i64, Error> {
        self.inner.srem(key, value).await
    }

    pub async fn del(&self, key: &str) -> Result<i64, Error> {
        self.inner.del(key).await
    }

    pub async fn lpush(&self, key: &str, value: &str) -> Result<i64, Error> {
        self.inner.lpush(key, value).await
    }

    pub async fn brpoplpush(
        &self,
        source: &str,
        dest: &str,
        timeout_secs: f64,
    ) -> Result<Option<String>, Error> {
        self.inner.brpoplpush(source, dest, timeout_secs).await
    }

    pub async fn lrem(&self, key: &str, count: i64, value: &str) -> Result<i64, Error> {
        self.inner.lrem(key, count, value).await
    }
}

#[async_trait]
impl Cache for RedisClient {
    async fn get_transaction_item_rules(
        &self,
        role: AccountRole,
        state: &str,
    ) -> Result<TransactionItemRuleInstances, CacheError> {
        let key = CacheKey::rules_state(role, state).to_string();
        let members: Vec<String> = self
            .smembers(&key)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        if members.is_empty() {
            return Err(CacheError::CacheMiss);
        }

        let rules: Result<Vec<_>, _> = members.iter().map(|s| serde_json::from_str(s)).collect();

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
        let key = CacheKey::rules_state(role, state).to_string();
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
    ) -> Result<ApprovalRuleInstances, CacheError> {
        let key = CacheKey::rules_approval(role, account).to_string();
        let members: Vec<String> = self
            .smembers(&key)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        if members.is_empty() {
            return Err(CacheError::CacheMiss);
        }

        let rules: Result<Vec<_>, _> = members.iter().map(|s| serde_json::from_str(s)).collect();

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
        let key = CacheKey::rules_approval(role, account).to_string();
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
    ) -> Result<TransactionItemRuleInstances, CacheError> {
        let key = CacheKey::rules_account(role, account).to_string();
        let members: Vec<String> = self
            .smembers(&key)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        if members.is_empty() {
            return Err(CacheError::CacheMiss);
        }

        let rules: Result<Vec<_>, _> = members.iter().map(|s| serde_json::from_str(s)).collect();

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
        let key = CacheKey::rules_account(role, account).to_string();
        for rule in &rules.0 {
            let json = serde_json::to_string(rule)
                .map_err(|e| CacheError::SerializationError(e.to_string()))?;
            self.sadd(&key, &json)
                .await
                .map_err(|e| CacheError::ConnectionError(e.to_string()))?;
        }
        Ok(())
    }

    async fn get_account_profile(&self, account: &str) -> Result<AccountProfile, CacheError> {
        let key = CacheKey::profile(account).to_string();
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
        let key = CacheKey::profile(account).to_string();
        let json = serde_json::to_string(profile)
            .map_err(|e| CacheError::SerializationError(e.to_string()))?;
        self.set(&key, &json)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))
    }

    async fn get_profile_id(&self, account: &str) -> Result<String, CacheError> {
        let key = CacheKey::profile_id(account).to_string();
        let value: Option<String> = self
            .get(&key)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        value.ok_or(CacheError::CacheMiss)
    }

    async fn set_profile_id(&self, account: &str, id: &str) -> Result<(), CacheError> {
        let key = CacheKey::profile_id(account).to_string();
        self.set(&key, id)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))
    }

    async fn get_account_approvers(&self, account: &str) -> Result<Vec<String>, CacheError> {
        let key = CacheKey::approvers(account).to_string();
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
        let key = CacheKey::approvers(account).to_string();
        for approver in approvers {
            self.sadd(&key, approver)
                .await
                .map_err(|e| CacheError::ConnectionError(e.to_string()))?;
        }
        Ok(())
    }

    async fn get(&self, key: &str) -> Result<Option<String>, CacheError> {
        RedisClient::get(self, key)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))
    }

    async fn set(&self, key: &str, value: &str) -> Result<(), CacheError> {
        RedisClient::set(self, key, value)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))
    }

    async fn smembers(&self, key: &str) -> Result<Vec<String>, CacheError> {
        self.inner
            .smembers(key)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))
    }

    async fn incr_float(&self, key: &str, amount: &str) -> Result<String, CacheError> {
        let val: f64 = amount.parse().unwrap_or(0.0);
        let result: f64 = self
            .inner
            .incr_by_float(key, val)
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;
        Ok(result.to_string())
    }

    async fn incr_and_check_threshold(
        &self,
        key: &str,
        amount: &str,
        threshold: &str,
    ) -> Result<(String, bool), CacheError> {
        let script = r#"
local new = redis.call('INCRBYFLOAT', KEYS[1], ARGV[1])
local threshold = tonumber(ARGV[2])
if tonumber(new) >= threshold then
    redis.call('INCRBYFLOAT', KEYS[1], -threshold)
    return new .. ':1'
else
    return new .. ':0'
end
"#;
        let result: String = self
            .inner
            .eval(
                script,
                vec![key.to_string()],
                vec![amount.to_string(), threshold.to_string()],
            )
            .await
            .map_err(|e| CacheError::ConnectionError(e.to_string()))?;

        // parse "value:0" or "value:1"
        match result.rsplit_once(':') {
            Some((value, flag)) => Ok((value.to_string(), flag == "1")),
            None => Ok((result, false)),
        }
    }

    async fn del(&self, key: &str) -> Result<(), CacheError> {
        self.inner
            .del::<i64, _>(key)
            .await
            .map(|_| ())
            .map_err(|e| CacheError::ConnectionError(e.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_rules_state_key() {
        let key = CacheKey::rules_state(AccountRole::Creditor, "California").to_string();
        assert!(key.ends_with(":creditor:California"));
    }

    #[test]
    fn it_creates_rules_account_key() {
        let key = CacheKey::rules_account(AccountRole::Debitor, "JacobWebb").to_string();
        assert!(key.ends_with(":debitor:JacobWebb"));
    }

    #[test]
    fn it_creates_rules_approval_key() {
        let key = CacheKey::rules_approval(AccountRole::Debitor, "IgorPetrov").to_string();
        assert!(key.ends_with(":debitor:IgorPetrov"));
    }

    #[test]
    fn it_creates_profile_key() {
        let key = CacheKey::profile("GroceryStore").to_string();
        assert!(key.ends_with(":GroceryStore"));
    }

    #[test]
    fn it_creates_profile_id_key() {
        let key = CacheKey::profile_id("GroceryStore").to_string();
        assert!(key.ends_with(":GroceryStore"));
    }

    #[test]
    fn it_creates_approvers_key() {
        let key = CacheKey::approvers("GroceryStore").to_string();
        assert!(key.ends_with(":GroceryStore"));
    }
}

#[cfg(all(test, feature = "cache_tests"))]
mod integration_tests {
    use super::*;
    use crate::Cache;
    use types::rule::{ApprovalRuleInstance, TransactionItemRuleInstance};

    async fn get_client() -> RedisClient {
        let client = RedisClient::new()
            .await
            .expect("failed to create redis client");
        client.init().await.expect("failed to init redis");
        client
    }

    async fn delete_test_keys(client: &RedisClient, keys: &[&str]) {
        for key in keys {
            let _: Option<i64> = client.inner.del(*key).await.ok();
        }
    }

    // use test-only names to avoid colliding with warm-cache keys
    const TEST_ACCT: &str = "CacheTestAccount";
    const TEST_STATE: &str = "CacheTestState";

    #[tokio::test]
    async fn it_sets_and_gets_profile_id() {
        let client = get_client().await;
        let key = &CacheKey::profile_id(TEST_ACCT).to_string();
        delete_test_keys(&client, &[key]).await;

        client.set_profile_id(TEST_ACCT, "123").await.unwrap();
        let result = client.get_profile_id(TEST_ACCT).await.unwrap();

        assert_eq!(result, "123");
        delete_test_keys(&client, &[key]).await;
    }

    #[tokio::test]
    async fn it_returns_cache_miss_for_missing_profile_id() {
        let client = get_client().await;
        let key = &CacheKey::profile_id("NonExistent").to_string();
        delete_test_keys(&client, &[key]).await;

        let result = client.get_profile_id("NonExistent").await;
        assert!(matches!(result, Err(CacheError::CacheMiss)));
    }

    #[tokio::test]
    async fn it_sets_and_gets_account_profile() {
        let client = get_client().await;
        let key = &CacheKey::profile(TEST_ACCT).to_string();
        delete_test_keys(&client, &[key]).await;

        let profile = AccountProfile {
            id: Some("1".to_string()),
            account_name: TEST_ACCT.to_string(),
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
            .set_account_profile(TEST_ACCT, &profile)
            .await
            .unwrap();
        let result = client.get_account_profile(TEST_ACCT).await.unwrap();

        assert_eq!(result.account_name, TEST_ACCT);
        assert_eq!(result.state_name, "California");
        delete_test_keys(&client, &[key]).await;
    }

    #[tokio::test]
    async fn it_sets_and_gets_account_approvers() {
        let client = get_client().await;
        let key = &CacheKey::approvers(TEST_ACCT).to_string();
        delete_test_keys(&client, &[key]).await;

        let approvers = vec!["Approver1".to_string(), "Approver2".to_string()];

        client
            .set_account_approvers(TEST_ACCT, &approvers)
            .await
            .unwrap();
        let result = client.get_account_approvers(TEST_ACCT).await.unwrap();

        assert_eq!(result.len(), 2);
        assert!(result.contains(&"Approver1".to_string()));
        assert!(result.contains(&"Approver2".to_string()));
        delete_test_keys(&client, &[key]).await;
    }

    #[tokio::test]
    async fn it_sets_and_gets_transaction_item_rules() {
        let client = get_client().await;
        let key = &CacheKey::rules_state(AccountRole::Creditor, TEST_STATE).to_string();
        delete_test_keys(&client, &[key]).await;

        let rule = TransactionItemRuleInstance {
            id: Some("1".to_string()),
            rule_name: "multiplyItemValue".to_string(),
            rule_instance_name: "NinePercentSalesTax".to_string(),
            variable_values: vec![
                "ANY".to_string(),
                "StateOfCalifornia".to_string(),
                "9% state sales tax".to_string(),
                "0.09".to_string(),
            ],
            account_role: AccountRole::Creditor,
            account_name: None,
            item_id: None,
            price: None,
            quantity: None,
            country_name: None,
            city_name: None,
            county_name: None,
            state_name: Some(TEST_STATE.to_string()),
            latlng: None,
            occupation_id: None,
            industry_id: None,
            disabled_time: None,
            removed_time: None,
            created_at: None,
            transaction_rule_instance_id: None,
        };
        let rules = TransactionItemRuleInstances(vec![rule]);

        client
            .set_transaction_item_rules(AccountRole::Creditor, TEST_STATE, &rules)
            .await
            .unwrap();
        let result = client
            .get_transaction_item_rules(AccountRole::Creditor, TEST_STATE)
            .await
            .unwrap();

        assert_eq!(result.0.len(), 1);
        assert_eq!(result.0[0].rule_name, "multiplyItemValue");
        delete_test_keys(&client, &[key]).await;
    }

    #[tokio::test]
    async fn it_sets_and_gets_approval_rules() {
        let client = get_client().await;
        let key = &CacheKey::rules_approval(AccountRole::Creditor, TEST_ACCT).to_string();
        delete_test_keys(&client, &[key]).await;

        let rule = ApprovalRuleInstance {
            id: Some("1".to_string()),
            rule_name: "approveAnyCreditItem".to_string(),
            rule_instance_name: "ApproveAllCredits".to_string(),
            variable_values: vec![],
            account_role: AccountRole::Creditor,
            account_name: TEST_ACCT.to_string(),
            disabled_time: None,
            removed_time: None,
            created_at: None,
        };
        let rules = ApprovalRuleInstances(vec![rule]);

        client
            .set_approval_rules(AccountRole::Creditor, TEST_ACCT, &rules)
            .await
            .unwrap();
        let result = client
            .get_approval_rules(AccountRole::Creditor, TEST_ACCT)
            .await
            .unwrap();

        assert_eq!(result.0.len(), 1);
        assert_eq!(result.0[0].rule_name, "approveAnyCreditItem");
        delete_test_keys(&client, &[key]).await;
    }
}
