const sql = `
SELECT
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
WHERE account_name = $1;`;

export default sql;