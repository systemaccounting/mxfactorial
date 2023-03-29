pub fn select_approvers() -> String {
    r#"SELECT DISTINCT coalesce(owner_account, '') || coalesce(owner_subaccount, '') as approver
FROM account_owner ao
WHERE ao.owned_account = $1 OR ao.owned_subaccount = $1;"#
        .to_owned()
}

fn select_account_profile_base() -> &'static str {
    r#"SELECT
	id::text,
	account_name,
	description,
	first_name,
	middle_name,
	last_name,
	country_name,
	street_number,
	street_name,
	floor_number,
	unit_number,
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
	removal_time,
	created_at
FROM account_profile
"#
}

pub fn select_account_profile_by_account() -> String {
    select_account_profile_base().to_owned() + "WHERE account_name = $1;"
}

pub fn select_account_profiles_by_db_cr_accounts() -> String {
    select_account_profile_base().to_owned() + "WHERE account_name = $1 OR account_name = $2;"
}

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
