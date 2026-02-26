use cache::{Cache, CacheKey};
use pg::postgres::ConnectionPool;
use rust_decimal::Decimal;
use std::collections::HashSet;
use std::sync::Arc;
use types::account_role::AccountRole;
use types::transaction::Transaction;

// query accounts involved in a transaction (creditors and debitors)
const ACCOUNTS_QUERY: &str = r#"
SELECT DISTINCT creditor AS account FROM transaction_item WHERE transaction_id = $1
UNION
SELECT DISTINCT debitor AS account FROM transaction_item WHERE transaction_id = $1
"#;

// query net contribution for a specific account in a transaction
// credit to account minus debit from account = net profit
const CONTRIBUTION_QUERY: &str = r#"
SELECT
  COALESCE(SUM(CASE WHEN creditor = $2 THEN price * quantity ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN debitor = $2 THEN price * quantity ELSE 0 END), 0)
  AS contribution
FROM transaction_item
WHERE transaction_id = $1
"#;

// query transaction_rule_instance by id for author and author_role
const RULE_INSTANCE_QUERY: &str = r#"
SELECT id::text, author, author_role FROM transaction_rule_instance WHERE id = $1
"#;

// handle_threshold_profit checks if any account's accumulated profit has reached
// a configured threshold, and fires a dividend transaction if so
//
// flow:
// 1. query postgres for accounts involved in the transaction
// 2. for each account, check cache for threshold rules
// 3. only if rules exist: query that account's net contribution
// 4. lua script: INCRBYFLOAT accumulator keyed by rule instance id, compare against threshold
// 5. if met: build transaction from rule instance, send to auto-transact queue
//
// accounts without threshold rules are skipped entirely
pub async fn handle_threshold_profit(
    pool: &ConnectionPool,
    cache: &Arc<dyn Cache>,
    queue: &Arc<dyn queue::Queue>,
    transaction_id: &str,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get_conn().await;
    let tx_id: i32 = transaction_id.parse()?;

    // get all accounts involved in this transaction
    let rows = conn.0.query(ACCOUNTS_QUERY, &[&tx_id]).await?;
    let accounts: HashSet<String> = rows.iter().map(|r| r.get(0)).collect();

    for account in accounts {
        // check cache for threshold rules for this account
        let rules = get_threshold_rules(cache, &account).await;
        if rules.is_empty() {
            continue;
        }

        // only compute contribution if account has threshold rules
        let contribution = get_contribution(&conn, tx_id, &account).await?;
        if contribution <= Decimal::ZERO {
            continue;
        }

        // atomic increment + threshold check for each rule
        for (rule_instance_id, threshold) in rules {
            let key = CacheKey::accumulator(&rule_instance_id).to_string();
            let (accumulated_str, threshold_met) = cache
                .incr_and_check_threshold(&key, &contribution.to_string(), &threshold.to_string())
                .await?;

            if threshold_met {
                tracing::info!(
                    "threshold met for rule {}: {} >= {}",
                    rule_instance_id,
                    accumulated_str,
                    threshold
                );

                // send transaction envelope to queue — rule service adds items
                let ri_id: i32 = rule_instance_id.parse()?;
                let tri_rows = conn.0.query(RULE_INSTANCE_QUERY, &[&ri_id]).await?;
                if let Some(tri) = tri_rows.first() {
                    let author: Option<String> = tri.get(1);
                    let author_role: Option<String> = tri.get(2);

                    let transaction = Transaction::from_rule_instance(
                        rule_instance_id.clone(),
                        author,
                        author_role.map(AccountRole::from),
                    );

                    queue.send(&serde_json::to_string(&transaction)?).await?;
                }
            }
        }
    }

    Ok(())
}

// get_threshold_rules looks up threshold rules for an account from cache
// returns vec of (rule_instance_id, threshold) tuples
async fn get_threshold_rules(cache: &Arc<dyn Cache>, account: &str) -> Vec<(String, Decimal)> {
    let key = CacheKey::threshold_profit(account).to_string();
    let members: Vec<String> = cache.smembers(&key).await.unwrap_or_default();

    members
        .iter()
        .filter_map(|s| {
            let parts: Vec<&str> = s.split('|').collect();
            if parts.len() == 2 {
                let id = parts[0].to_string();
                let threshold = parts[1].parse::<Decimal>().ok()?;
                Some((id, threshold))
            } else {
                None
            }
        })
        .collect()
}

// get_contribution queries the net contribution for an account in a transaction
async fn get_contribution(
    conn: &pg::postgres::DatabaseConnection,
    transaction_id: i32,
    account: &str,
) -> Result<Decimal, Box<dyn std::error::Error + Send + Sync>> {
    let rows = conn
        .0
        .query(CONTRIBUTION_QUERY, &[&transaction_id, &account])
        .await?;
    if rows.is_empty() {
        return Ok(Decimal::ZERO);
    }
    Ok(rows[0].get(0))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_parses_threshold_rule_from_cache_format() {
        let input = "123|1000.000";
        let parts: Vec<&str> = input.split('|').collect();
        assert_eq!(parts.len(), 2);
        assert_eq!(parts[0], "123");
        assert_eq!(
            parts[1].parse::<Decimal>().unwrap(),
            Decimal::new(1000000, 3)
        );
    }
}
