use core::fmt;
use nanoid::nanoid;

const FIXED_DECIMAL_PLACES: usize = 3;
const RULE_EXEC_ID_SIZE: usize = 8;

pub fn number_to_fixed_string<T: fmt::Display>(num: T) -> String {
    format!("{num:.FIXED_DECIMAL_PLACES$}")
}

pub fn create_rule_exec_id() -> String {
    nanoid!(RULE_EXEC_ID_SIZE)
}
