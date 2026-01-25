use async_trait::async_trait;
use thiserror::Error;
use types::{
    account::AccountProfile,
    account_role::AccountRole,
    rule::{ApprovalRuleInstances, TransactionItemRuleInstances},
};

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
}
