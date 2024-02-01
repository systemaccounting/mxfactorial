use sea_query::{PostgresQueryBuilder, Query, Values};
use types::account::AccountIden as Account;

pub fn insert_account_sql(account: String) -> (String, Values) {
    Query::insert()
        .into_table(Account::Table)
        .columns([Account::Name])
        .values_panic([account.into()])
        .build(PostgresQueryBuilder)
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn test_insert_account_sql() {
		let account = "test_account".to_string();
		let (sql, values) = insert_account_sql(account);
		assert_eq!(sql, r#"INSERT INTO "account" ("name") VALUES ($1)"#);
		assert_eq!(values, Values(vec!["test_account".into()]));
	}
}