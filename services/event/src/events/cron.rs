use pg::postgres::ConnectionPool;
use std::sync::Arc;
use types::account_role::AccountRole;
use types::transaction::Transaction;

const RULE_INSTANCE_QUERY: &str = r#"
SELECT author, author_role FROM transaction_rule_instance WHERE id = $1
"#;

pub async fn handle_cron(
    pool: &ConnectionPool,
    queue: &Arc<dyn queue::Queue>,
    rule_instance_id: &str,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get_conn().await?;
    let ri_id: i32 = rule_instance_id.parse()?;

    let rows = conn.0.query(RULE_INSTANCE_QUERY, &[&ri_id]).await?;
    let row = rows
        .first()
        .ok_or_else(|| format!("no rule instance found for id {}", rule_instance_id))?;

    let author: Option<String> = row.get(0);
    let author_role: Option<String> = row.get(1);

    let transaction = Transaction::from_rule_instance(
        rule_instance_id.to_string(),
        author,
        author_role.map(AccountRole::from),
    );

    queue.send(&serde_json::to_string(&transaction)?).await?;
    tracing::info!(
        "queued cron transaction for rule_instance_id {}",
        rule_instance_id
    );

    Ok(())
}
