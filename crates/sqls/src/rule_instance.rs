use crate::common::*;
use types::rule::RuleInstance;

const RULE_INSTANCE_TABLE: &str = "rule_instance";

pub struct RuleInstanceTable {
    inner: Table,
}

impl TableTrait<RuleInstanceTable> for RuleInstanceTable {
    fn new() -> RuleInstanceTable {
        Self {
            inner: Table::new::<RuleInstance>(RULE_INSTANCE_TABLE),
        }
    }

    fn get_column(&self, column: &str) -> String {
        self.inner.get_column(column)
    }

    fn name(&self) -> &str {
        self.inner.name
    }
}

impl RuleInstanceTable {
    fn cast_as_text(&self, column: &str) -> String {
        format!("{}::text", self.get_column(column))
    }

    fn select_all_with_text_casting(&self) -> [String; 35] {
        [
            self.cast_as_text("id"),
            self.get_column("rule_type"),
            self.get_column("rule_name"),
            self.get_column("rule_instance_name"),
            self.get_column("variable_values"),
            self.get_column("account_role"),
            self.get_column("item_id"),
            self.cast_as_text("price"),
            self.cast_as_text("quantity"),
            self.get_column("unit_of_measurement"),
            self.cast_as_text("units_measured"),
            self.get_column("account_name"),
            self.get_column("first_name"),
            self.get_column("middle_name"),
            self.get_column("last_name"),
            self.get_column("country_name"),
            self.get_column("street_id"),
            self.get_column("street_name"),
            self.get_column("floor_number"),
            self.get_column("unit_id"),
            self.get_column("city_name"),
            self.get_column("county_name"),
            self.get_column("region_name"),
            self.get_column("state_name"),
            self.get_column("postal_code"),
            self.cast_as_text("latlng"),
            self.get_column("email_address"),
            self.cast_as_text("telephone_country_code"),
            self.cast_as_text("telephone_area_code"),
            self.cast_as_text("telephone_number"),
            self.cast_as_text("occupation_id"),
            self.cast_as_text("industry_id"),
            self.get_column("disabled_time"),
            self.get_column("removed_time"),
            self.get_column("created_at"),
        ]
    }

    pub fn select_rule_instance_by_type_role_account_sql(&self) -> String {
        let columns = self.select_all_with_text_casting();
        format!(
            "{} {} {} {} {} {} {} $1 {} {} {} $2 {} {} {} $3",
            SELECT,
            columns.join(", "),
            FROM,
            self.name(),
            WHERE,
            self.get_column("rule_type"),
            EQUAL,
            AND,
            self.get_column("account_role"),
            EQUAL,
            AND,
            self.get_column("account_name"),
            EQUAL
        )
    }

    pub fn select_rule_instance_by_type_role_state_sql(&self) -> String {
        let columns = self.select_all_with_text_casting();
        format!(
            "{} {} {} {} {} {} {} $1 {} {} {} $2 {} {} {} $3",
            SELECT,
            columns.join(", "),
            FROM,
            self.name(),
            WHERE,
            self.get_column("rule_type"),
            EQUAL,
            AND,
            self.get_column("account_role"),
            EQUAL,
            AND,
            self.get_column("state_name"),
            EQUAL
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_a_select_rule_instance_by_type_role_account_sql() {
        let test_table = RuleInstanceTable::new();
        assert_eq!(
			test_table.select_rule_instance_by_type_role_account_sql(),
			"SELECT id::text, rule_type, rule_name, rule_instance_name, variable_values, account_role, item_id, price::text, quantity::text, unit_of_measurement, units_measured::text, account_name, first_name, middle_name, last_name, country_name, street_id, street_name, floor_number, unit_id, city_name, county_name, region_name, state_name, postal_code, latlng::text, email_address, telephone_country_code::text, telephone_area_code::text, telephone_number::text, occupation_id::text, industry_id::text, disabled_time, removed_time, created_at FROM rule_instance WHERE rule_type = $1 AND account_role = $2 AND account_name = $3"
		);
    }

    #[test]
    fn it_creates_a_select_rule_instance_by_type_role_state_sql() {
        let test_table = RuleInstanceTable::new();
        assert_eq!(
			test_table.select_rule_instance_by_type_role_state_sql(),
			"SELECT id::text, rule_type, rule_name, rule_instance_name, variable_values, account_role, item_id, price::text, quantity::text, unit_of_measurement, units_measured::text, account_name, first_name, middle_name, last_name, country_name, street_id, street_name, floor_number, unit_id, city_name, county_name, region_name, state_name, postal_code, latlng::text, email_address, telephone_country_code::text, telephone_area_code::text, telephone_number::text, occupation_id::text, industry_id::text, disabled_time, removed_time, created_at FROM rule_instance WHERE rule_type = $1 AND account_role = $2 AND state_name = $3"
		);
    }
}

// todo: replace with above
fn select_rule_instance_base() -> &'static str {
    r#"SELECT
	id::text,
	rule_type,
	rule_name,
	rule_instance_name,
	variable_values,
	account_role,
	item_id,
	price::text,
	quantity::text,
	unit_of_measurement,
	units_measured::text,
	account_name,
	first_name,
	middle_name,
	last_name,
	country_name,
	street_id,
	street_name,
	floor_number,
	unit_id,
	city_name,
	county_name,
	region_name,
	state_name,
	postal_code,
	latlng::text,
	email_address,
	telephone_country_code::text,
	telephone_area_code::text,
	telephone_number::text,
	occupation_id::text,
	industry_id::text,
	disabled_time,
	removed_time,
	created_at
FROM rule_instance
"#
}

pub fn select_rule_instance_by_type_role_account() -> String {
    select_rule_instance_base().to_owned()
        + "WHERE rule_type = $1 AND account_role = $2 AND account_name = $3;"
}

pub fn select_rule_instance_by_type_role_state() -> String {
    select_rule_instance_base().to_owned()
        + "WHERE rule_type = $1 AND account_role = $2 AND state_name = $3;"
}
