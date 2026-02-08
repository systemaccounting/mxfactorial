use cache::{Cache, CacheKey};
use pg::postgres::ConnectionPool;
use rust_decimal::Decimal;
use std::collections::HashSet;

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

// handle_threshold_profit checks if any account's accumulated profit has reached
// a configured threshold, and fires a dividend transaction if so
//
// flow:
// 1. query postgres for accounts involved in the transaction
// 2. for each account, check cache for threshold rules
// 3. only if rules exist: query that account's net contribution
// 4. lua script: INCRBYFLOAT accumulator keyed by rule instance id, compare against threshold
// 5. if met: POST to auto-transact, DEL accumulator key
//
// accounts without threshold rules are skipped entirely
pub async fn handle_threshold_profit<C: Cache>(
    pool: &ConnectionPool,
    cache: &C,
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

        // increment accumulator for each rule, check threshold
        for (rule_instance_id, threshold) in rules {
            let accumulated = incr_accumulator(cache, &rule_instance_id, contribution).await?;
            if accumulated >= threshold {
                // todo: POST to auto-transact
                // subtract threshold, keeping remainder for next cycle
                let remainder = incr_accumulator(cache, &rule_instance_id, -threshold).await?;
                tracing::info!(
                    "threshold met for rule {}: {} >= {}, remainder={}",
                    rule_instance_id,
                    accumulated,
                    threshold,
                    remainder
                );
            }
        }
    }

    Ok(())
}

// get_threshold_rules looks up threshold rules for an account from cache
// returns vec of (rule_instance_id, threshold) tuples
async fn get_threshold_rules<C: Cache>(cache: &C, account: &str) -> Vec<(String, Decimal)> {
    let key = CacheKey::TransactionRuleInstanceThresholdProfit { account }.to_string();
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

// incr_accumulator increments the accumulator for a rule instance
// returns the new accumulated value
async fn incr_accumulator<C: Cache>(
    cache: &C,
    rule_instance_id: &str,
    contribution: Decimal,
) -> Result<Decimal, Box<dyn std::error::Error + Send + Sync>> {
    let key = CacheKey::TransactionRuleInstanceAccumulator {
        id: rule_instance_id,
    }
    .to_string();
    let result = cache.incr_float(&key, &contribution.to_string()).await?;
    Ok(result.parse()?)
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
