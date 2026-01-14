use std::fmt::{Display, Formatter, Result};
use url::Url;

// separate crate from httpclient because it
// creates ws:// uri and doesnt need reqwest

pub enum Protocol {
    Http,
    Https,
    Ws,
}

impl Display for Protocol {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        match self {
            Protocol::Http => write!(f, "http"),
            Protocol::Https => write!(f, "https"),
            Protocol::Ws => write!(f, "ws"),
        }
    }
}

pub struct Uri(Url);

impl Uri {
    pub fn new(uri: &str) -> Self {
        let uri = if !uri.contains("://") {
            format!("{}://{}", Protocol::Http, uri)
        } else {
            uri.to_string()
        };

        let mut url = Url::parse(&uri).unwrap();

        if std::env::var("ENABLE_TLS").is_ok_and(|v| v == "true") {
            url.set_scheme(Protocol::Https.to_string().as_str())
                .unwrap();
        }

        Self(url)
    }

    pub fn new_from_env_var(env_var: &str) -> Self {
        let uri = std::env::var(env_var).unwrap();
        Self::new(&uri)
    }

    pub fn with_ws(self) -> Self {
        let mut url = self.0;
        url.set_scheme(Protocol::Ws.to_string().as_str()).unwrap();
        Self(url)
    }

    pub fn with_path(self, path: &str) -> Self {
        let mut url = self.0;
        url.set_path(path);
        Self(url)
    }
}

impl Display for Uri {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        write!(f, "{}", self.0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scheme_display() {
        assert_eq!(Protocol::Http.to_string(), "http");
        assert_eq!(Protocol::Https.to_string(), "https");
        assert_eq!(Protocol::Ws.to_string(), "ws");
    }

    #[test]
    fn test_new_default_uri() {
        let uri = Uri::new("example.com");
        assert_eq!(uri.to_string(), "http://example.com/");
    }

    #[test]
    fn test_new_localhost_uri() {
        let uri = Uri::new("localhost:8080");
        assert_eq!(uri.to_string(), "http://localhost:8080/");
    }

    #[test]
    fn test_new_https_uri() {
        let uri = Uri::new("https://example.com");
        assert_eq!(uri.to_string(), "https://example.com/");
    }

    #[test]
    fn test_new_ws_uri() {
        let uri = Uri::new("example.com").with_ws();
        assert_eq!(uri.to_string(), "ws://example.com/");
    }

    #[test]
    fn test_http_uri_from_env_var() {
        std::env::set_var("TEST_URI_1", "http://example.com");
        let uri = Uri::new_from_env_var("TEST_URI_1");
        assert_eq!(uri.to_string(), "http://example.com/");
        std::env::remove_var("TEST_URI_1");
    }

    #[test]
    fn test_https_uri_from_env_var() {
        std::env::set_var("TEST_URI_2", "https://example.com");
        let uri = Uri::new_from_env_var("TEST_URI_2");
        assert_eq!(uri.to_string(), "https://example.com/");
        std::env::remove_var("TEST_URI_2");
    }

    #[test]
    fn test_localhost_uri_from_env_var() {
        std::env::set_var("TEST_URI_3", "localhost:8080");
        let uri = Uri::new_from_env_var("TEST_URI_3");
        assert_eq!(uri.to_string(), "http://localhost:8080/");
        std::env::remove_var("TEST_URI_3");
    }

    #[test]
    fn test_with_path() {
        let uri = Uri::new("example.com").with_path("path/to/resource");
        assert_eq!(uri.to_string(), "http://example.com/path/to/resource");
    }
}
