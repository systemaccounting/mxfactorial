pub mod ddb;
pub mod redis;

use async_trait::async_trait;
use std::{env, sync::Arc, sync::OnceLock};
use thiserror::Error;
use types::{
    account::AccountProfile,
    account_role::AccountRole,
    rule::{ApprovalRuleInstances, TransactionItemRuleInstances},
};

pub use ddb::DdbClient;
pub use redis::RedisClient;

#[derive(Error, Debug)]
pub enum CacheError {
    #[error("cache miss")]
    CacheMiss,
    #[error("connection error: {0}")]
    ConnectionError(String),
    #[error("serialization error: {0}")]
    SerializationError(String),
    #[error("deserialization error: {0}")]
    DeserializationError(String),
}

#[async_trait]
pub trait Cache: Send + Sync {
    // transaction item rules by state
    async fn get_transaction_item_rules(
        &self,
        role: AccountRole,
        state: &str,
    ) -> Result<TransactionItemRuleInstances, CacheError>;

    async fn set_transaction_item_rules(
        &self,
        role: AccountRole,
        state: &str,
        rules: &TransactionItemRuleInstances,
    ) -> Result<(), CacheError>;

    // approval rules by account
    async fn get_approval_rules(
        &self,
        role: AccountRole,
        account: &str,
    ) -> Result<ApprovalRuleInstances, CacheError>;

    async fn set_approval_rules(
        &self,
        role: AccountRole,
        account: &str,
        rules: &ApprovalRuleInstances,
    ) -> Result<(), CacheError>;

    // transaction item rules by account
    async fn get_account_rules(
        &self,
        role: AccountRole,
        account: &str,
    ) -> Result<TransactionItemRuleInstances, CacheError>;

    async fn set_account_rules(
        &self,
        role: AccountRole,
        account: &str,
        rules: &TransactionItemRuleInstances,
    ) -> Result<(), CacheError>;

    // account profiles
    async fn get_account_profile(&self, account: &str) -> Result<AccountProfile, CacheError>;

    async fn set_account_profile(
        &self,
        account: &str,
        profile: &AccountProfile,
    ) -> Result<(), CacheError>;

    // profile id lookup
    async fn get_profile_id(&self, account: &str) -> Result<String, CacheError>;

    async fn set_profile_id(&self, account: &str, id: &str) -> Result<(), CacheError>;

    // account approvers
    async fn get_account_approvers(&self, account: &str) -> Result<Vec<String>, CacheError>;

    async fn set_account_approvers(
        &self,
        account: &str,
        approvers: &[String],
    ) -> Result<(), CacheError>;

    // primitives
    async fn get(&self, key: &str) -> Result<Option<String>, CacheError>;
    async fn set(&self, key: &str, value: &str) -> Result<(), CacheError>;
    async fn smembers(&self, key: &str) -> Result<Vec<String>, CacheError>;
    async fn incr_float(&self, key: &str, amount: &str) -> Result<String, CacheError>;
    async fn incr_and_check_threshold(
        &self,
        key: &str,
        amount: &str,
        threshold: &str,
    ) -> Result<(String, bool), CacheError>;
    async fn del(&self, key: &str) -> Result<(), CacheError>;
}

/// create cache client based on environment
/// - lambda: dynamodb
/// - REDIS_HOST set: redis
/// - otherwise: none
pub async fn new() -> Option<Arc<dyn Cache>> {
    if env::var("AWS_LAMBDA_FUNCTION_NAME").is_ok() {
        match DdbClient::new().await {
            Ok(client) => {
                tracing::info!("dynamodb cache initialized");
                Some(Arc::new(client) as Arc<dyn Cache>)
            }
            Err(e) => {
                tracing::warn!("dynamodb init failed: {}", e);
                None
            }
        }
    } else if env::var("REDIS_HOST").is_ok() {
        let client = RedisClient::new().await;
        if let Err(e) = client.init().await {
            tracing::warn!("redis init failed: {}", e);
            None
        } else {
            tracing::info!("redis cache initialized");
            Some(Arc::new(client) as Arc<dyn Cache>)
        }
    } else {
        tracing::info!("no cache backend configured");
        None
    }
}

static CACHE_KEY_RULES: OnceLock<String> = OnceLock::new();
static CACHE_KEY_STATE: OnceLock<String> = OnceLock::new();
static CACHE_KEY_ACCOUNT: OnceLock<String> = OnceLock::new();
static CACHE_KEY_APPROVAL: OnceLock<String> = OnceLock::new();
static CACHE_KEY_PROFILE: OnceLock<String> = OnceLock::new();
static CACHE_KEY_PROFILE_ID: OnceLock<String> = OnceLock::new();
static CACHE_KEY_APPROVERS: OnceLock<String> = OnceLock::new();

fn env_or(lock: &'static OnceLock<String>, var: &str, default: &str) -> &'static str {
    let var = var.to_string();
    let default = default.to_string();
    lock.get_or_init(move || env::var(&var).unwrap_or(default))
}

pub enum CacheKey<'a> {
    RulesState { role: AccountRole, state: &'a str },
    RulesAccount { role: AccountRole, account: &'a str },
    RulesApproval { role: AccountRole, account: &'a str },
    Profile { account: &'a str },
    ProfileId { account: &'a str },
    Approvers { account: &'a str },
    TransactionRuleInstanceThresholdProfit { account: &'a str },
    TransactionRuleInstanceAccumulator { id: &'a str },
}

impl<'a> CacheKey<'a> {
    pub fn rules_state(role: AccountRole, state: &'a str) -> Self {
        Self::RulesState { role, state }
    }

    pub fn rules_account(role: AccountRole, account: &'a str) -> Self {
        Self::RulesAccount { role, account }
    }

    pub fn rules_approval(role: AccountRole, account: &'a str) -> Self {
        Self::RulesApproval { role, account }
    }

    pub fn profile(account: &'a str) -> Self {
        Self::Profile { account }
    }

    pub fn profile_id(account: &'a str) -> Self {
        Self::ProfileId { account }
    }

    pub fn approvers(account: &'a str) -> Self {
        Self::Approvers { account }
    }

    pub fn threshold_profit(account: &'a str) -> Self {
        Self::TransactionRuleInstanceThresholdProfit { account }
    }

    pub fn accumulator(id: &'a str) -> Self {
        Self::TransactionRuleInstanceAccumulator { id }
    }

    fn join(parts: &[&str]) -> String {
        parts.join(":")
    }
}

impl<'a> std::fmt::Display for CacheKey<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let rules = env_or(&CACHE_KEY_RULES, "CACHE_KEY_RULES", "rules");
        let state_seg = env_or(&CACHE_KEY_STATE, "CACHE_KEY_STATE", "state");
        let account_seg = env_or(&CACHE_KEY_ACCOUNT, "CACHE_KEY_ACCOUNT", "account");
        let approval_seg = env_or(&CACHE_KEY_APPROVAL, "CACHE_KEY_APPROVAL", "approval");
        let profile = env_or(&CACHE_KEY_PROFILE, "CACHE_KEY_PROFILE", "profile");
        let profile_id = env_or(&CACHE_KEY_PROFILE_ID, "CACHE_KEY_PROFILE_ID", "profile_id");
        let approvers = env_or(&CACHE_KEY_APPROVERS, "CACHE_KEY_APPROVERS", "approvers");
        let key = match self {
            Self::RulesState { role, state } => {
                let r = role.to_string().to_lowercase();
                Self::join(&[rules, state_seg, &r, state])
            }
            Self::RulesAccount { role, account } => {
                let r = role.to_string().to_lowercase();
                Self::join(&[rules, account_seg, &r, account])
            }
            Self::RulesApproval { role, account } => {
                let r = role.to_string().to_lowercase();
                Self::join(&[rules, approval_seg, &r, account])
            }
            Self::Profile { account } => Self::join(&[profile, account]),
            Self::ProfileId { account } => Self::join(&[profile_id, account]),
            Self::Approvers { account } => Self::join(&[approvers, account]),
            Self::TransactionRuleInstanceThresholdProfit { account } => {
                Self::join(&["transaction_rule_instance", "threshold", "profit", account])
            }
            Self::TransactionRuleInstanceAccumulator { id } => {
                Self::join(&["transaction_rule_instance", id, "accumulator"])
            }
        };
        write!(f, "{}", key)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_rules_state_key() {
        let key = CacheKey::rules_state(AccountRole::Creditor, "California").to_string();
        assert_eq!(key, "rules:state:creditor:California");
    }

    #[test]
    fn it_creates_rules_account_key() {
        let key = CacheKey::rules_account(AccountRole::Debitor, "JacobWebb").to_string();
        assert_eq!(key, "rules:account:debitor:JacobWebb");
    }

    #[test]
    fn it_creates_rules_approval_key() {
        let key = CacheKey::rules_approval(AccountRole::Debitor, "IgorPetrov").to_string();
        assert_eq!(key, "rules:approval:debitor:IgorPetrov");
    }

    #[test]
    fn it_creates_profile_key() {
        let key = CacheKey::profile("GroceryStore").to_string();
        assert_eq!(key, "profile:GroceryStore");
    }

    #[test]
    fn it_creates_profile_id_key() {
        let key = CacheKey::profile_id("GroceryStore").to_string();
        assert_eq!(key, "profile_id:GroceryStore");
    }

    #[test]
    fn it_creates_approvers_key() {
        let key = CacheKey::approvers("GroceryStore").to_string();
        assert_eq!(key, "approvers:GroceryStore");
    }

    #[test]
    fn it_creates_threshold_profit_key() {
        let key = CacheKey::threshold_profit("GroceryCo").to_string();
        assert_eq!(key, "transaction_rule_instance:threshold:profit:GroceryCo");
    }

    #[test]
    fn it_creates_accumulator_key() {
        let key = CacheKey::accumulator("1").to_string();
        assert_eq!(key, "transaction_rule_instance:1:accumulator");
    }
}
