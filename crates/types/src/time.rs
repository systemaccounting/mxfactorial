use async_graphql::scalar;
use chrono::{DateTime, Duration, NaiveDate, NaiveDateTime, SecondsFormat, Utc};
use postgres_protocol::types;
use postgres_types::{FromSql, ToSql, Type};
use serde::{Deserialize, Serialize, Serializer};
use std::{error::Error, fmt};

#[derive(Eq, PartialEq, Debug, Deserialize, ToSql, Clone, Copy)]

pub struct TZTime(pub DateTime<Utc>);

impl TZTime {
    pub fn now() -> Self {
        Self(chrono::offset::Utc::now())
    }

    pub fn to_milli_tz(&self) -> String {
        self.0.to_rfc3339_opts(SecondsFormat::Millis, true)
    }

    pub fn not_lapsed(&self) -> bool {
        self.0 > TZTime::now().0
    }
}

impl fmt::Display for TZTime {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_milli_tz())
    }
}
scalar!(TZTime);

// https://github.com/sfackler/rust-postgres/blob/7cd7b187a5cb990ceb0ea9531cd3345b1e2799c3/postgres-types/src/chrono_04.rs
fn base() -> NaiveDateTime {
    NaiveDate::from_ymd_opt(2000, 1, 1)
        .unwrap()
        .and_hms_opt(0, 0, 0)
        .unwrap()
}

impl FromSql<'_> for TZTime {
    #[allow(unused_variables)]
    fn from_sql(type_: &Type, raw: &[u8]) -> Result<TZTime, Box<dyn Error + Sync + Send>> {
        let t = types::timestamp_from_sql(raw)?;
        let naive_date_time = base()
            .checked_add_signed(Duration::microseconds(t))
            .unwrap();
        Ok(TZTime(DateTime::from_naive_utc_and_offset(
            naive_date_time,
            Utc,
        )))
    }

    fn accepts(ty: &Type) -> bool {
        *ty == Type::TIMESTAMPTZ
    }
}

// todo: test timestamp created by rule service == timestamp value stored in db by request-create in
// https://github.com/systemaccounting/mxfactorial/blob/fc7a27765bed840dce0876ce2fe75d8df6bc2dcf/services/request-create/cmd/main.go#L330-L336
impl Serialize for TZTime {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_milli_tz())
    }
}

impl From<String> for TZTime {
    fn from(s: String) -> Self {
        Self(
            DateTime::parse_from_rfc3339(&s)
                .unwrap()
                .with_timezone(&Utc),
        )
    }
}

impl From<&str> for TZTime {
    fn from(s: &str) -> Self {
        Self(DateTime::parse_from_rfc3339(s).unwrap().with_timezone(&Utc))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bytes::{BufMut, BytesMut};
    use serde_assert;
    use std::time::SystemTime;
    use time::{format_description, OffsetDateTime};

    #[test]
    fn it_serializes() {
        let test_tz_time = TZTime(
            DateTime::parse_from_rfc3339("2023-10-30T04:56:56Z")
                .unwrap()
                .with_timezone(&Utc),
        );
        let test_serializer = serde_assert::Serializer::builder().build();

        let got = test_tz_time.serialize(&test_serializer).unwrap();
        let want = serde_assert::Tokens(vec![serde_assert::Token::Str(String::from(
            "2023-10-30T04:56:56.000Z",
        ))]);

        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_returns_now() {
        let test_chrono_now = TZTime::now().0;
        let test_sys_time_now: OffsetDateTime = SystemTime::now().into();

        let chrono_time_format = "%FT%H:%M";
        let sys_time_format =
            format_description::parse("[year]-[month]-[day]T[hour]:[minute]").unwrap();

        let got = format!("{}", test_chrono_now.format(chrono_time_format));
        let want = test_sys_time_now.format(&sys_time_format).unwrap();

        assert_eq!(got, want, "got {}, want {}", got, want)
    }

    #[test]
    fn it_returns_naive_date_time() {
        let got = base();
        let want = NaiveDate::from_ymd_opt(2000, 1, 1)
            .unwrap()
            .and_hms_opt(0, 0, 0)
            .unwrap();

        assert_eq!(got, want, "got {}, want {}", got, want)
    }

    #[test]
    fn it_converts_to_tztime_from_sql() {
        let test_pg_type = Type::TIMESTAMPTZ;
        let mut test_buf = BytesMut::new();
        // https://github.com/sfackler/rust-postgres/blob/c5ff8cfd86e897b7c197f52684a37a4f17cecb75/postgres-types/src/lib.rs#L207
        const TIME_SEC_CONVERSION: i64 = 946_684_800;
        const USEC_PER_SEC: i64 = 1_000_000;
        test_buf.put_i64((1_698_641_816 - TIME_SEC_CONVERSION) * USEC_PER_SEC);
        let got = TZTime::from_sql(&test_pg_type, &test_buf).unwrap();
        let want = TZTime(
            DateTime::parse_from_rfc3339("2023-10-30T04:56:56Z")
                .unwrap()
                .with_timezone(&Utc),
        );
        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_accepts_timestamptz_type_from_sql() {
        let test_pg_type = Type::TIMESTAMPTZ;
        assert!(<TZTime as postgres_types::FromSql>::accepts(&test_pg_type))
    }

    #[test]
    fn it_reports_not_lapsed() {
        let test_tz_time = TZTime(
            DateTime::parse_from_rfc3339("3023-01-01T04:56:56Z")
                .unwrap()
                .with_timezone(&Utc),
        );
        assert!(test_tz_time.not_lapsed())
    }

    #[test]
    fn it_reports_lapsed() {
        let test_tz_time = TZTime(
            DateTime::parse_from_rfc3339("2013-10-30T04:56:56Z")
                .unwrap()
                .with_timezone(&Utc),
        );
        assert!(!test_tz_time.not_lapsed())
    }

    #[test]
    fn it_deserializes_time() {
        let date_str = "2023-02-28T04:21:08.363Z";

        let want = TZTime(
            DateTime::parse_from_rfc3339(date_str)
                .unwrap()
                .with_timezone(&Utc),
        );

        let got: TZTime = serde_json::from_str(&format!("\"{}\"", date_str)).unwrap();

        assert_eq!(got, want);
    }
}
