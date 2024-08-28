use crate::RedisClient;
use fred::prelude::LuaInterface;
use rust_decimal::prelude::*;
use rust_decimal::Decimal;
use std::collections::HashMap;

// create events for measure api

// hashmap of redis keys and values
// example: 2024-01-01:gdp:usa:cal:losa => 3.00
pub struct Gdp<'a>(HashMap<&'a str, &'a str>);

impl<'a> Gdp<'a> {
    pub fn new(value: &'a str) -> Self {
        let mut map = HashMap::new();
        let parts: Vec<&str> = value.split(',').collect();
        for i in (0..parts.len()).step_by(2) {
            if i + 1 < parts.len() {
                let key = parts[i];
                let value = parts[i + 1];
                map.insert(key, value);
            }
        }
        Gdp(map)
    }
}

// redis lua script:
// 1. increment a key by a float value
// 2. set the GDP_TTL if new
// 3. publish the new value on a channel named after the key
const INCRBY_GDP: &str = r#"
local r = redis.call('INCRBYFLOAT', KEYS[1], ARGV[1])
if r == ARGV[1] then
  redis.call('EXPIRE', KEYS[1], ARGV[2])
end
redis.call('PUBLISH', KEYS[1], r)
"#;

const GDP_TTL: i64 = 60 * 60 * 24 * 3; // secs * mins * hours * days = 3

pub async fn redis_incrby_gdp<'a>(client: &RedisClient, gdp_map: Gdp<'a>) {
    for (key, value) in gdp_map.0.iter() {
        let k = key.to_string();
        let v = trim_string_decimal(&value.parse::<String>().unwrap());
        let _: () = client
            .eval(
                INCRBY_GDP,
                vec![k],
                vec![v.to_string(), GDP_TTL.to_string()],
            )
            .await
            .unwrap();
    }
}

fn trim_string_decimal(s: &str) -> String {
    if s.parse::<f64>().is_ok() {
        let d = Decimal::from_str(s).unwrap();
        // set precision to 3 decimal places
        d.round_dp(3).to_string()
    } else {
        s.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn it_creates_a_2_entry_map_from_4_comma_separated_values() {
        let gdp_map = Gdp::new("2024-01-01:gdp:usa:cal:losa,3.00,2024-01-01:gdp:usa:cal:sac,0.5");
        assert_eq!(gdp_map.0.len(), 2);
        assert_eq!(
            gdp_map.0.get("2024-01-01:gdp:usa:cal:losa").unwrap(),
            &"3.00"
        );
        assert_eq!(gdp_map.0.get("2024-01-01:gdp:usa:cal:sac").unwrap(), &"0.5");
    }
}
