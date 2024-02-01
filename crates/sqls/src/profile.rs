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
