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
