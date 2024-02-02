use sea_query::{Expr, OnConflict, PostgresQueryBuilder, Query, Values};
use types::account::AccountIden as Account;
use types::account::AccountOwnerIden as AccountOwner;

pub fn insert_account_sql(account: String) -> (String, Values) {
    Query::insert()
        .into_table(Account::Table)
        .columns([Account::Name])
        .values_panic([account.into()])
        .on_conflict(OnConflict::column(Account::Name).do_nothing().to_owned())
        .build(PostgresQueryBuilder)
}

pub fn delete_owner_account_sql(account: String) -> (String, Values) {
    Query::delete()
        .from_table(AccountOwner::Table)
        .and_where(Expr::col(AccountOwner::OwnerAccount).eq(account))
        .build(PostgresQueryBuilder)
}

pub fn delete_account_sql(account: String) -> (String, Values) {
    Query::delete()
        .from_table(Account::Table)
        .and_where(Expr::col(Account::Name).eq(account))
        .build(PostgresQueryBuilder)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_insert_account_sql() {
        let account = "test_account".to_string();
        let (sql, values) = insert_account_sql(account);
        assert_eq!(
            sql,
            r#"INSERT INTO "account" ("name") VALUES ($1) ON CONFLICT ("name") DO NOTHING"#
        );
        assert_eq!(values, Values(vec!["test_account".into()]));
    }

    #[test]
    fn test_delete_owner_account_sql() {
        let account = "test_account".to_string();
        let (sql, values) = delete_owner_account_sql(account);
        assert_eq!(
            sql,
            r#"DELETE FROM "account_owner" WHERE "owner_account" = $1"#
        );
        assert_eq!(values, Values(vec!["test_account".into()]));
    }

    #[test]
    fn test_delete_account_sql() {
        let account = "test_account".to_string();
        let (sql, values) = delete_account_sql(account);
        assert_eq!(sql, r#"DELETE FROM "account" WHERE "name" = $1"#);
        assert_eq!(values, Values(vec!["test_account".into()]));
    }
}
