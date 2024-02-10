use serde::Deserialize;
use serde_aux::serde_introspection::serde_introspect;
use std::collections::HashMap;

pub const INSERT_INTO: &str = "INSERT INTO";

pub const SELECT: &str = "SELECT";

pub const FROM: &str = "FROM";

pub const WHERE: &str = "WHERE";

pub const VALUES: &str = "VALUES";

pub const ON_CONFLICT: &str = "ON CONFLICT";

pub const DO_NOTHING: &str = "DO NOTHING";

pub const DELETE_FROM: &str = "DELETE FROM";

pub const IN: &str = "IN";

pub const STAR: &str = "*";

pub const EQUAL: &str = "=";

pub const UPDATE: &str = "UPDATE";

pub const SET: &str = "SET";

pub const CHANGE_ACCOUNT_BALANCES: &str = "change_account_balances";

pub const AND: &str = "AND";

pub const RETURNING: &str = "RETURNING";

pub const OR: &str = "OR";

pub const DISTINCT: &str = "DISTINCT";

pub const COALESCE: &str = "coalesce";

pub const CONCAT: &str = "||";

pub const AS: &str = "AS";

pub const WITH: &str = "WITH";

pub fn values_params(
    columns: &[String],
    row_count: usize,
    positional_parameter: &mut i32,
) -> String {
    let mut values = String::new();
    for i in 0..row_count {
        values.push('(');
        for c in 0..columns.len() {
            values.push_str(&format!("${}", *positional_parameter));
            *positional_parameter += 1;
            if c < columns.len() - 1 {
                values.push_str(", ");
            }
        }
        values.push(')');
        if i < row_count - 1 {
            values.push_str(", ");
        }
    }
    values
}

pub fn in_params(row_count: usize) -> String {
    let mut positional_parameter = 1;
    let mut values = String::new();
    values.push('(');
    for i in 0..row_count {
        values.push_str(&format!("${}", positional_parameter));
        positional_parameter += 1;
        if i < row_count - 1 {
            values.push_str(", ");
        }
    }
    values.push(')');
    values
}

pub fn balance_change_params(row_count: usize) -> String {
    let mut positional_parameter = 1;
    let mut values = String::new();
    for i in 0..row_count {
        values.push('(');
        for c in 0..3 {
            values.push_str(&format!("${}", positional_parameter));
            positional_parameter += 1;
            if c < 2 {
                values.push_str(", ");
            }
        }
        values.push(')');
        if i < row_count - 1 {
            values.push_str(", ");
        }
    }
    values
}

#[derive(Debug)]
pub struct Table {
    pub name: &'static str,
    pub columns: HashMap<String, String>,
}

pub trait TableTrait<T> {
    fn new() -> Self;
    fn get_column(&self, column: &str) -> String;
    fn name(&self) -> &str;
}

impl Table {
    pub fn new<T: for<'a> Deserialize<'a>>(name: &'static str) -> Self {
        let column_names = serde_introspect::<T>();
        let mut map = HashMap::new();
        for cn in column_names {
            map.insert(String::from(*cn), String::from(*cn));
        }
        Self { name, columns: map }
    }

    pub fn get_column(&self, column: &str) -> String {
        self.columns.get(column).unwrap().to_owned() // panic if column does not exist
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_values_params() {
        let columns = vec![
            String::from("column1"),
            String::from("column2"),
            String::from("column3"),
        ];
        let mut p = 1;
        let row_count = 3;
        let expected = String::from("($1, $2, $3), ($4, $5, $6), ($7, $8, $9)");
        assert_eq!(values_params(&columns, row_count, &mut p), expected);
    }

    #[test]
    fn it_creates_in_params() {
        let row_count = 3;
        let expected = String::from("($1, $2, $3)");
        assert_eq!(in_params(row_count), expected);
    }

    #[test]
    fn it_creates_balance_change_params() {
        let row_count = 3;
        let expected = String::from("($1, $2, $3), ($4, $5, $6), ($7, $8, $9)");
        assert_eq!(balance_change_params(row_count), expected);
    }
}
