use crate::RedisClient;
use fred::prelude::KeysInterface;
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

pub async fn redis_incrby_gdp<'a>(client: &RedisClient, gdp_map: Gdp<'a>) {
    for (key, value) in gdp_map.0.iter() {
        let k = key.to_string();
        let v = value.parse::<f64>().unwrap();
        let _: f64 = client.incr_by_float(&k, v).await.unwrap();
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
