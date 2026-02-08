use chrono::Utc;
use pg::postgres::ConnectionPool;
use redisclient::RedisClient;
use rust_decimal::Decimal;
use std::collections::HashMap;

// redis lua script:
// 1. increment a key by a float value
// 2. set ttl if key is new (first increment sets r == ARGV[1])
// 3. publish the new value on a channel named after the key
const INCRBY_GDP: &str = r#"
local r = redis.call('INCRBYFLOAT', KEYS[1], ARGV[1])
if r == ARGV[1] then
  redis.call('EXPIRE', KEYS[1], ARGV[2])
end
redis.call('PUBLISH', KEYS[1], r)
"#;

// 3 day ttl for gdp keys
const GDP_TTL: i64 = 60 * 60 * 24 * 3;

// query transaction items with creditor location
// creditor latlng determines where value flows to (gdp location)
const GDP_QUERY: &str = r#"
SELECT
  ti.price * ti.quantity AS value,
  ap.latlng::text
FROM transaction_item ti
JOIN account_profile ap ON ap.id = ti.creditor_profile_id
WHERE ti.transaction_id = $1
"#;

// handle_gdp increments redis gdp keys when a transaction reaches equilibrium
// called by main.rs when pg notifies on equilibrium channel
//
// flow:
// 1. query postgres for transaction items and creditor locations
// 2. map: group item values by creditor latlng
// 3. reduce: resolve each latlng to location keys via cache
// 4. increment redis gdp keys per location hierarchy (country, region, municipality)
pub async fn handle_gdp(
    pool: &ConnectionPool,
    redis_client: &RedisClient,
    transaction_id: &str,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let conn = pool.get_conn().await;
    let tx_id: i32 = transaction_id.parse()?;

    let rows = conn.0.query(GDP_QUERY, &[&tx_id]).await?;

    if rows.is_empty() {
        return Ok(());
    }

    // map: group values by latlng
    // a transaction may have multiple items with same creditor location
    // sum them to reduce cache lookups in the next step
    let mut by_latlng: HashMap<String, Decimal> = HashMap::new();
    for row in rows {
        let value: Decimal = row.get(0);
        let latlng: Option<String> = row.get(1);
        if let Some(latlng) = latlng {
            *by_latlng.entry(latlng).or_insert(Decimal::ZERO) += value;
        }
    }

    // reduce: resolve location keys once per unique latlng
    // cache keys:
    //   geocode:{latlng} -> "country|region|municipality"
    //   redis_name:{name} -> abbreviation (e.g. "California" -> "cal")
    let mut totals: HashMap<String, Decimal> = HashMap::new();
    let date_prefix = Utc::now().format("%Y-%m-%d").to_string();

    for (latlng, value) in by_latlng {
        // look up geocode from cache
        let geocode_key = format!("geocode:{}", latlng);
        if let Ok(Some(geocode)) = redis_client.get(&geocode_key).await {
            let parts: Vec<&str> = geocode.split('|').collect();
            if parts.len() == 3 {
                // look up redis abbreviations from cache
                let redis_country = get_redis_name(redis_client, parts[0]).await;
                let redis_region = get_redis_name(redis_client, parts[1]).await;
                let redis_municipality = get_redis_name(redis_client, parts[2]).await;

                // build gdp keys and accumulate value
                incr_gdp_keys(
                    &mut totals,
                    &date_prefix,
                    value,
                    redis_country,
                    redis_region,
                    redis_municipality,
                );
            }
        }
    }

    // increment redis keys
    // each key gets the sum of all transaction items at that location level
    for (key, value) in totals {
        let v = trim_decimal(value);
        redis_client
            .eval(
                INCRBY_GDP,
                vec![key],
                vec![v.to_string(), GDP_TTL.to_string()],
            )
            .await?;
    }

    Ok(())
}

// get_redis_name looks up a location name abbreviation from cache
// e.g. "United States of America" -> "usa", "California" -> "cal"
async fn get_redis_name(redis_client: &RedisClient, name: &str) -> Option<String> {
    let key = format!("redis_name:{}", name);
    redis_client.get(&key).await.ok().flatten()
}

// incr_gdp_keys builds hierarchical gdp keys and increments totals
// keys follow pattern: {date}:gdp:{country}:{region}:{municipality}
// each level includes value from all levels below it
//
// example for sacramento transaction:
//   2024-08-07:gdp:usa         += value
//   2024-08-07:gdp:usa:cal     += value
//   2024-08-07:gdp:usa:cal:sac += value
fn incr_gdp_keys(
    totals: &mut HashMap<String, Decimal>,
    date_prefix: &str,
    value: Decimal,
    country: Option<String>,
    region: Option<String>,
    municipality: Option<String>,
) {
    if let Some(c) = country {
        let country_key = format!("{}:gdp:{}", date_prefix, c);
        *totals.entry(country_key.clone()).or_insert(Decimal::ZERO) += value;

        if let Some(r) = region {
            let region_key = format!("{}:{}", country_key, r);
            *totals.entry(region_key.clone()).or_insert(Decimal::ZERO) += value;

            if let Some(m) = municipality {
                let municipality_key = format!("{}:{}", region_key, m);
                *totals.entry(municipality_key).or_insert(Decimal::ZERO) += value;
            }
        }
    }
}

fn trim_decimal(d: Decimal) -> String {
    d.round_dp(3).to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    #[test]
    fn it_trims_decimal_to_3_places() {
        let d = Decimal::from_str("123.456789").unwrap();
        assert_eq!(trim_decimal(d), "123.457");
    }

    #[test]
    fn it_increments_gdp_keys_for_country_region_municipality() {
        let mut totals = HashMap::new();
        let value = Decimal::from_str("10.00").unwrap();

        incr_gdp_keys(
            &mut totals,
            "2024-08-07",
            value,
            Some("usa".to_string()),
            Some("cal".to_string()),
            Some("sac".to_string()),
        );

        assert_eq!(totals.len(), 3);
        assert_eq!(totals.get("2024-08-07:gdp:usa"), Some(&value));
        assert_eq!(totals.get("2024-08-07:gdp:usa:cal"), Some(&value));
        assert_eq!(totals.get("2024-08-07:gdp:usa:cal:sac"), Some(&value));
    }

    #[test]
    fn it_increments_existing_gdp_keys() {
        let mut totals = HashMap::new();
        let value = Decimal::from_str("10.00").unwrap();

        incr_gdp_keys(
            &mut totals,
            "2024-08-07",
            value,
            Some("usa".to_string()),
            Some("cal".to_string()),
            Some("sac".to_string()),
        );
        incr_gdp_keys(
            &mut totals,
            "2024-08-07",
            value,
            Some("usa".to_string()),
            Some("cal".to_string()),
            Some("rivs".to_string()),
        );

        let twenty = Decimal::from_str("20.00").unwrap();
        assert_eq!(totals.get("2024-08-07:gdp:usa"), Some(&twenty));
        assert_eq!(totals.get("2024-08-07:gdp:usa:cal"), Some(&twenty));
        assert_eq!(totals.get("2024-08-07:gdp:usa:cal:sac"), Some(&value));
        assert_eq!(totals.get("2024-08-07:gdp:usa:cal:rivs"), Some(&value));
    }

    #[test]
    fn it_skips_when_country_is_none() {
        let mut totals = HashMap::new();
        let value = Decimal::from_str("10.00").unwrap();

        incr_gdp_keys(&mut totals, "2024-08-07", value, None, None, None);

        assert!(totals.is_empty());
    }
}
