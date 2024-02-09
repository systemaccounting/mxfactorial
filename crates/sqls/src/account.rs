use crate::common::*;

const ACCOUNT_TABLE: &str = "account";
const ACCOUNT_OWNER_TABLE: &str = "account_owner";

pub fn insert_account_sql() -> String {
    let columns = ["name".to_owned()];
    let values = values_params(&columns, 1, &mut 1);
    format!(
        "{} {} ({}) {} {} {} {}",
        INSERT_INTO,
        ACCOUNT_TABLE,
        columns.join(", "),
        VALUES,
        values,
        ON_CONFLICT,
        DO_NOTHING,
    )
}

pub fn delete_owner_account_sql() -> String {
    let column = "owner_account";
    format!(
        "{} {} {} {} {} $1",
        DELETE_FROM, ACCOUNT_OWNER_TABLE, WHERE, column, EQUAL
    )
}

pub fn delete_account_sql() -> String {
    let column = "name";
    format!(
        "{} {} {} {} {} $1",
        DELETE_FROM, ACCOUNT_TABLE, WHERE, column, EQUAL
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_an_insert_account_sql() {
        assert_eq!(
            insert_account_sql(),
            "INSERT INTO account (name) VALUES ($1) ON CONFLICT DO NOTHING"
        );
    }

    #[test]
    fn it_creates_a_delete_owner_account_sql() {
        assert_eq!(
            delete_owner_account_sql(),
            "DELETE FROM account_owner WHERE owner_account = $1"
        );
    }

    #[test]
    fn it_creates_a_delete_account_sql() {
        assert_eq!(delete_account_sql(), "DELETE FROM account WHERE name = $1");
    }
}
