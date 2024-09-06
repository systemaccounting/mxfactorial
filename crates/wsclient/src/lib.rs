use std::net::TcpStream;
use tungstenite::{connect, stream::MaybeTlsStream, WebSocket};

pub struct WsClient {
    uri: WsUri,
}

impl WsClient {
    pub fn new(
        base_uri: String,
        measure: String,
        date: String,
        country: Option<String>,
        region: Option<String>,
        municipality: Option<String>,
    ) -> Self {
        let uri = WsUri::new(base_uri, measure, date, country, region, municipality);
        WsClient { uri }
    }

    pub fn connect(
        &self,
    ) -> Result<WebSocket<MaybeTlsStream<TcpStream>>, tungstenite::error::Error> {
        let (ws_stream, _) = connect(self.uri.query_string())?;
        Ok(ws_stream)
    }
}

// todo: merge with Params in services/measure/src/main.rs as separate crate
struct WsUri {
    base_uri: String,
    measure: String,
    date: String,
    country: Option<String>,
    region: Option<String>,
    municipality: Option<String>,
}

impl WsUri {
    pub fn new(
        base_uri: String,
        measure: String,
        date: String,
        country: Option<String>,
        region: Option<String>,
        municipality: Option<String>,
    ) -> Self {
        WsUri {
            base_uri,
            measure,
            date,
            country,
            region,
            municipality,
        }
    }

    pub fn query_string(&self) -> String {
        let mut uri = format!("{}?", self.base_uri);
        uri.push_str(&format!("measure={}", self.measure));
        uri.push_str(&format!("&date={}", self.date));
        if let Some(country) = &self.country {
            uri.push_str(&format!("&country={}", country));
        }
        if let Some(region) = &self.region {
            uri.push_str(&format!("&region={}", region));
        }
        if let Some(municipality) = &self.municipality {
            uri.push_str(&format!("&municipality={}", municipality));
        }
        uri.replace(" ", "%20")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ws_uri() {
        let ws_uri = WsUri::new(
            "ws://localhost:10010/ws".to_string(),
            "gdp".to_string(),
            "2024-08-21".to_string(),
            Some("United States of America".to_string()),
            Some("California".to_string()),
            Some("Sacramento".to_string()),
        );

        assert_eq!(ws_uri.measure, "gdp");
        assert_eq!(ws_uri.date, "2024-08-21");
        assert_eq!(ws_uri.country, Some("United States of America".to_string()));
        assert_eq!(ws_uri.region, Some("California".to_string()));
        assert_eq!(ws_uri.municipality, Some("Sacramento".to_string()));
    }

    #[test]
    fn test_ws_uri_full_query_string() {
        let ws_uri = WsUri::new(
            "ws://localhost:10010/ws".to_string(),
            "gdp".to_string(),
            "2024-08-21".to_string(),
            Some("United States of America".to_string()),
            Some("California".to_string()),
            Some("Sacramento".to_string()),
        );

        assert_eq!(
            ws_uri.query_string(),
            "ws://localhost:10010/ws?measure=gdp&date=2024-08-21&country=United%20States%20of%20America&region=California&municipality=Sacramento"
        );
    }

    #[test]
    fn test_ws_uri_cal_query_string() {
        let ws_uri = WsUri::new(
            "ws://localhost:10010/ws".to_string(),
            "gdp".to_string(),
            "2024-08-21".to_string(),
            Some("United States of America".to_string()),
            Some("California".to_string()),
            None,
        );

        assert_eq!(
            ws_uri.query_string(),
            "ws://localhost:10010/ws?measure=gdp&date=2024-08-21&country=United%20States%20of%20America&region=California"
        );
    }
}
