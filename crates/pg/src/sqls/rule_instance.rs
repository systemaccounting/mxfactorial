use crate::sqls::common::*;
use tokio_postgres::types::Type;
use types::rule::RuleInstance;

const RULE_INSTANCE_TABLE: &str = "rule_instance";

pub struct RuleInstanceTable {
    inner: Table,
}

impl TableTrait for RuleInstanceTable {
    fn new() -> RuleInstanceTable {
        Self {
            inner: Table::new::<RuleInstance>(RULE_INSTANCE_TABLE),
        }
    }

    fn get_column(&self, column: &str) -> Column {
        self.inner.get_column(column)
    }

    fn get_column_name(&self, column: &str) -> String {
        self.inner.get_column_name(column)
    }

    fn name(&self) -> &str {
        self.inner.name
    }
}

impl RuleInstanceTable {
    fn select_all_with_text_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("id").cast_column_as(Type::TEXT),
            self.get_column("rule_type"),
            self.get_column("rule_name"),
            self.get_column("rule_instance_name"),
            self.get_column("variable_values"),
            self.get_column("account_role"),
            self.get_column("item_id"),
            self.get_column("price").cast_column_as(Type::TEXT),
            self.get_column("quantity").cast_column_as(Type::TEXT),
            self.get_column("unit_of_measurement"),
            self.get_column("units_measured").cast_column_as(Type::TEXT),
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
            self.get_column("latlng").cast_column_as(Type::TEXT),
            self.get_column("email_address"),
            self.get_column("telephone_country_code")
                .cast_column_as(Type::TEXT),
            self.get_column("telephone_area_code")
                .cast_column_as(Type::TEXT),
            self.get_column("telephone_number")
                .cast_column_as(Type::TEXT),
            self.get_column("occupation_id").cast_column_as(Type::TEXT),
            self.get_column("industry_id").cast_column_as(Type::TEXT),
            self.get_column("disabled_time"),
            self.get_column("removed_time"),
            self.get_column("created_at"),
        ])
    }

    pub fn insert_columns(&self) -> Columns {
        Columns(vec![
            self.get_column("rule_type"),
            self.get_column("rule_name"),
            self.get_column("rule_instance_name"),
            self.get_column("account_role"),
            self.get_column("account_name"),
            self.get_column("variable_values"),
        ])
    }

    pub fn select_rule_instance_by_type_role_account_sql(&self) -> String {
        let columns = self.select_all_with_text_casting().join_with_casting();
        format!(
            "{} {} {} {} {} {} {} $1 {} {} {} $2 {} {} {} $3",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("rule_type").name(),
            EQUAL,
            AND,
            self.get_column("account_role").name(),
            EQUAL,
            AND,
            self.get_column("account_name").name(),
            EQUAL
        )
    }

    pub fn select_rule_instance_by_type_role_state_sql(&self) -> String {
        let columns = self.select_all_with_text_casting().join_with_casting();
        format!(
            "{} {} {} {} {} {} {} $1 {} {} {} $2 {} {} {} $3",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("rule_type").name(),
            EQUAL,
            AND,
            self.get_column("account_role").name(),
            EQUAL,
            AND,
            self.get_column("state_name").name(),
            EQUAL
        )
    }

    pub fn select_rule_instance_exists_sql(&self) -> String {
        // SELECT EXISTS(SELECT 1 FROM account_profile WHERE rule_type = $1 AND rule_name = $2 AND rule_instance_name = $3 AND account_role = $4 AND account_name = $5 AND variable_values = $6);
        format!(
            "{} {}({} {} {} {} {} {} {} $1 {} {} {} $2 {} {} {} $3 {} {} {} $4 {} {} {} $5 {} {} {} $6);",
            SELECT,
            EXISTS,
            SELECT,
            "1",
            FROM,
            self.name(),
            WHERE,
            self.get_column("rule_type").name(),
            EQUAL,
            AND,
            self.get_column("rule_name").name(),
            EQUAL,
            AND,
            self.get_column("rule_instance_name").name(),
            EQUAL,
            AND,
            self.get_column("account_role").name(),
            EQUAL,
            AND,
            self.get_column("account_name").name(),
            EQUAL,
            AND,
            self.get_column("variable_values").name(),
            EQUAL
        )
    }

    pub fn insert_rule_instance_sql(&self) -> String {
        let columns = self.insert_columns();
        let values = create_value_params(columns.clone(), 1, &mut 1);
        format!(
            "{} {} ({}) {} {}",
            INSERT_INTO,
            self.name(),
            columns.join(),
            VALUES,
            values,
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

    #[test]
    fn it_creates_a_select_rule_instance_exists_sql() {
        let test_table = RuleInstanceTable::new();
        let expected = "SELECT EXISTS(SELECT 1 FROM rule_instance WHERE rule_type = $1 AND rule_name = $2 AND rule_instance_name = $3 AND account_role = $4 AND account_name = $5 AND variable_values = $6);";
        assert_eq!(test_table.select_rule_instance_exists_sql(), expected);
    }

    #[test]
    fn it_creates_an_insert_rule_instance_sql() {
        let test_table = RuleInstanceTable::new();
        let expected = "INSERT INTO rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) VALUES ($1, $2, $3, $4, $5, $6)";
        assert_eq!(test_table.insert_rule_instance_sql(), expected);
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
