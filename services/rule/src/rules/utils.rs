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

#[cfg(test)]
mod tests {
    use super::*;
    use regex::Regex;

    #[test]
    fn it_converts_number_to_fixed_string() {
        let test_number = 8.0;
        let got = number_to_fixed_string(test_number);
        let want = String::from("8.000");
        assert_eq!(got, want, "got {}, want {}", got, want)
    }

    #[test]
    fn it_creates_rule_exec_id() {
        let got = create_rule_exec_id();
        let want = Regex::new(r"[\w*-]{8}").unwrap().is_match(&got);
        assert!(want)
    }
}
