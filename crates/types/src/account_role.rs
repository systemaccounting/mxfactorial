use postgres_protocol::types;
use postgres_types::{to_sql_checked, FromSql, IsNull, ToSql, Type};
use serde::{Deserialize, Serialize};
use std::error::Error;
use strum_macros::{Display, EnumString};

#[derive(Debug, Display, Eq, PartialEq, Deserialize, Serialize, Clone, Copy, EnumString)]
#[strum(serialize_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum AccountRole {
    Debitor,
    Creditor,
}

impl<'a> FromSql<'a> for AccountRole {
    #[allow(unused_variables)]
    fn from_sql(ty: &Type, raw: &'a [u8]) -> Result<Self, Box<dyn Error + Sync + Send>> {
        match types::text_from_sql(raw)? {
            "debitor" => Ok(AccountRole::Debitor),
            "creditor" => Ok(AccountRole::Creditor),
            _ => Err("postgres TEXT value neither debitor or creditor".into()),
        }
    }

    fn accepts(ty: &Type) -> bool {
        *ty == Type::TEXT
    }
}

impl ToSql for AccountRole {
    #[allow(unused_variables)]
    fn to_sql(
        &self,
        ty: &Type,
        out: &mut postgres_types::private::BytesMut,
    ) -> Result<postgres_types::IsNull, Box<dyn Error + Sync + Send>> {
        // https://github.com/sfackler/rust-postgres/issues/139#issuecomment-367288349
        match *self {
            AccountRole::Debitor => out.extend_from_slice(b"debitor"),
            AccountRole::Creditor => out.extend_from_slice(b"creditor"),
        };
        Ok(IsNull::No)
    }

    #[allow(unused_variables)]
    fn accepts(ty: &Type) -> bool {
        true
    }

    to_sql_checked!();
}

pub type RoleSequence = [AccountRole; 2];

pub const DEBITOR_FIRST: RoleSequence = [AccountRole::Debitor, AccountRole::Creditor];

pub const CREDITOR_FIRST: RoleSequence = [AccountRole::Creditor, AccountRole::Debitor];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_deserializes_debitor() {
        let want = String::from("debitor");
        let got = AccountRole::Debitor.to_string();
        assert_eq!(got, want)
    }

    #[test]
    fn it_deserializes_creditor() {
        let want = String::from("creditor");
        let got = AccountRole::Creditor.to_string();
        assert_eq!(got, want)
    }

    #[test]
    fn it_serializes_debitor() {
        let account_role = "debitor";
        let quoted = format!("\"{}\"", account_role);
        let got: AccountRole = serde_json::from_str(&quoted).unwrap();
        let want = AccountRole::Debitor;
        assert_eq!(got, want)
    }

    #[test]
    fn it_serializes_creditor() {
        let account_role = "creditor";
        let quoted = format!("\"{}\"", account_role);
        let got: AccountRole = serde_json::from_str(&quoted).unwrap();
        let want = AccountRole::Creditor;
        assert_eq!(got, want)
    }
}
