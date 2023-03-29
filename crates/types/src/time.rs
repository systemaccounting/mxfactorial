use chrono::{DateTime, Duration, NaiveDate, NaiveDateTime, Utc};
use postgres_protocol::types;
use postgres_types::{FromSql, ToSql, Type};
use serde::{Deserialize, Serialize};
use std::error::Error;

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, ToSql, Clone)]

pub struct TZTime(#[serde(serialize_with = "milli_tz_format::serialize")] pub DateTime<Utc>);

impl TZTime {
    pub fn now() -> Self {
        Self(chrono::offset::Utc::now())
    }
}

// https://github.com/sfackler/rust-postgres/blob/7cd7b187a5cb990ceb0ea9531cd3345b1e2799c3/postgres-types/src/chrono_04.rs
fn base() -> NaiveDateTime {
    NaiveDate::from_ymd_opt(2000, 1, 1)
        .unwrap()
        .and_hms_opt(0, 0, 0)
        .unwrap()
}

impl<'a> FromSql<'a> for TZTime {
    #[allow(unused_variables)]
    fn from_sql(type_: &Type, raw: &[u8]) -> Result<TZTime, Box<dyn Error + Sync + Send>> {
        let t = types::timestamp_from_sql(raw)?;
        let naive_date_time = base()
            .checked_add_signed(Duration::microseconds(t))
            .unwrap();
        Ok(TZTime(DateTime::from_utc(naive_date_time, Utc)))
    }

    fn accepts(ty: &Type) -> bool {
        *ty == Type::TIMESTAMPTZ
    }
}

mod milli_tz_format {
    use chrono::{DateTime, SecondsFormat, Utc};
    use serde::{self, Serializer};

    pub fn serialize<S>(date: &DateTime<Utc>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let s = date.to_rfc3339_opts(SecondsFormat::Millis, true);
        serializer.serialize_str(&s)
    }
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
