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

pub const CHANGE_BALANCES: &str = "change_balances";

pub const AND: &str = "AND";

pub const RETURNING: &str = "RETURNING";

pub const OR: &str = "OR";

pub const DISTINCT: &str = "DISTINCT";

pub const COALESCE: &str = "coalesce";

pub const CONCAT: &str = "||";

pub const AS: &str = "AS";

pub const WITH: &str = "WITH";

pub const ROW: &str = "ROW";

pub const TEXT: &str = "text";

pub const IS: &str = "IS";

pub const NULL: &str = "NULL";

pub const EXISTS: &str = "EXISTS";

pub const ARRAY: &str = "ARRAY";

pub fn create_value_params(
    columns: Columns,
    row_count: usize,
    positional_parameter: &mut i32,
) -> String {
    let mut values = String::new();
    for i in 0..row_count {
        values.push('(');
        for (j, c) in columns.clone().enumerate() {
            values.push_str(&format!("${}", *positional_parameter));
            if let Some(cast_type) = &c.cast_value_as {
                values.push_str(&format!("::{}", cast_type));
            }
            *positional_parameter += 1;
            if j < columns.len() - 1 {
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

pub fn create_params(count: usize, positional_parameter: &mut i32) -> String {
    let mut values = String::new();
    for i in 0..count {
        values.push_str(&format!("${positional_parameter}"));
        *positional_parameter += 1;
        if i < count - 1 {
            values.push_str(", ");
        }
    }
    values
}

#[derive(Debug)]
pub struct Table {
    pub name: &'static str,
    pub columns: HashMap<String, Column>,
}

pub trait TableTrait {
    fn new() -> Self;
    fn get_column(&self, column_name: &str) -> Column;
    fn get_column_name(&self, name: &str) -> String;
    fn name(&self) -> &str;
    fn column_count(&self) -> usize;
}

impl Table {
    pub fn new<T: for<'a> Deserialize<'a>>(name: &'static str) -> Self {
        let column_names = serde_introspect::<T>();
        let mut map = HashMap::new();
        for cn in column_names {
            let column = Column::new(cn);
            map.insert(String::from(*cn), column);
        }
        Self { name, columns: map }
    }

    pub fn get_column(&self, column_name: &str) -> Column {
        let column = self.columns.get(column_name);
        match column {
            Some(c) => c.clone(),
            None => panic!(
                "column {} does not exist in table {}",
                column_name, self.name
            ),
        }
    }

    pub fn get_column_name(&self, column_name: &str) -> String {
        self.get_column(column_name).name().to_owned()
    }

    pub fn name(&self) -> &str {
        self.name
    }

    pub fn len(&self) -> usize {
        self.columns.len()
    }

    pub fn is_empty(&self) -> bool {
        self.columns.is_empty()
    }
}

#[derive(Debug, Clone)]
pub struct Column {
    pub name: String,
    pub cast_column_as: Option<tokio_postgres::types::Type>,
    pub cast_value_as: Option<tokio_postgres::types::Type>,
}

impl Column {
    pub fn new(name: &str) -> Self {
        Self {
            name: String::from(name),
            cast_column_as: None,
            cast_value_as: None,
        }
    }

    pub fn cast_column_as(mut self, cast_column_as: tokio_postgres::types::Type) -> Self {
        self.cast_column_as = Some(cast_column_as);
        self
    }

    pub fn cast_value_as(mut self, cast_value_as: tokio_postgres::types::Type) -> Self {
        self.cast_value_as = Some(cast_value_as);
        self
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn name_with_casting(&self) -> String {
        if self.cast_column_as.is_some() {
            format!("{}::{}", self.name, self.cast_column_as.clone().unwrap())
        } else {
            self.name.clone()
        }
    }
}

impl std::fmt::Display for Column {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", self.name)
    }
}

#[derive(Debug, Clone)]
pub struct Columns(pub Vec<Column>);

impl Columns {
    pub fn join(&self) -> String {
        let mut result = String::new();
        for (i, c) in self.clone().enumerate() {
            result.push_str(c.name());
            if i < self.0.len() - 1 {
                result.push_str(", ");
            }
        }
        result
    }

    pub fn join_with_casting(&self) -> String {
        let mut result = String::new();
        for (i, c) in self.clone().enumerate() {
            result.push_str(c.name());
            if c.cast_column_as.is_some() {
                result.push_str(&format!("::{}", c.cast_column_as.clone().unwrap()));
            }
            if i < self.0.len() - 1 {
                result.push_str(", ");
            }
        }
        result
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
}

impl std::ops::Index<usize> for Columns {
    type Output = Column;

    fn index(&self, index: usize) -> &Self::Output {
        &self.0[index]
    }
}

impl<'a> IntoIterator for &'a Columns {
    type Item = &'a Column;
    type IntoIter = std::slice::Iter<'a, Column>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.iter()
    }
}

impl Iterator for Columns {
    type Item = Column;

    fn next(&mut self) -> Option<Self::Item> {
        if !self.0.is_empty() {
            Some(self.0.remove(0))
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_will_create_value_params() {
        let columns = Columns(vec![
            Column::new("column1"),
            Column::new("column2"),
            Column::new("column3"),
        ]);
        let mut p = 1;
        let row_count = 3;
        let expected = String::from("($1, $2, $3), ($4, $5, $6), ($7, $8, $9)");
        assert_eq!(create_value_params(columns, row_count, &mut p), expected);
    }

    #[test]
    fn it_will_create_params() {
        let row_count = 3;
        let expected = String::from("$1, $2, $3");
        assert_eq!(create_params(row_count, &mut 1), expected);
    }
}
