use std::env;

pub fn required(var: &str) -> Result<String, String> {
    env::var(var).map_err(|e| format!("{var} not set: {e}"))
}

pub fn optional(var: &str, default: &str) -> String {
    env::var(var).unwrap_or_else(|_| default.to_string())
}

pub fn redis_uri() -> Result<String, String> {
    let db = required("REDIS_DB")?;
    let host = required("REDIS_HOST")?;
    let port = required("REDIS_PORT")?;
    let username = required("REDIS_USERNAME")?;
    let password = required("REDIS_PASSWORD")?;
    Ok(format!("redis://{username}:{password}@{host}:{port}/{db}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_formats_error_with_var_name() {
        let result = required("NONEXISTENT_TEST_VAR");
        let err = result.unwrap_err();
        assert_eq!(
            err,
            "NONEXISTENT_TEST_VAR not set: environment variable not found"
        );
    }
}
