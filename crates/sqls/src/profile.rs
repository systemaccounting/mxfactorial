use crate::common::*;
use types::account::AccountProfile;

const ACCOUNT_PROFILE_TABLE: &str = "account_profile";

pub struct AccountProfileTable {
    inner: Table,
}

impl TableTrait<AccountProfileTable> for AccountProfileTable {
    fn new() -> AccountProfileTable {
        Self {
            inner: Table::new::<AccountProfile>(ACCOUNT_PROFILE_TABLE),
        }
    }

    fn get_column(&self, column: &str) -> String {
        self.inner.get_column(column)
    }

    fn name(&self) -> &str {
        self.inner.name
    }
}

impl AccountProfileTable {
    fn cast_as_text(&self, column: &str) -> String {
        format!("{}::text", self.get_column(column))
    }

    fn select_all_with_text_casting(&self) -> [String; 23] {
        [
            self.cast_as_text("id"),
            self.get_column("account_name"),
            self.get_column("description"),
            self.get_column("first_name"),
            self.get_column("middle_name"),
            self.get_column("last_name"),
            self.get_column("country_name"),
            self.get_column("street_number"),
            self.get_column("street_name"),
            self.get_column("floor_number"),
            self.get_column("unit_number"),
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
        ]
    }

    pub fn select_account_profile_by_account_sql(&self) -> String {
        format!(
            "{} {} {} {} {} {} {} $1;",
            SELECT,
            self.select_all_with_text_casting().join(", "),
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_name"),
            EQUAL
        )
    }

    pub fn select_account_profiles_by_db_cr_accounts_sql(&self) -> String {
        format!(
            "{} {} {} {} {} {} {} $1 {} {} {} $2;",
            SELECT,
            self.select_all_with_text_casting().join(", "),
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_name"),
            EQUAL,
            OR,
            self.get_column("account_name"),
            EQUAL
        )
    }

    pub fn select_approvers() -> String {
        // todo: add account_owner type and AccountOwnerTable
        let column_alias = "approver";
        let table = "account_owner";
        let table_alias = "ao";
        let owner_account_column = "owner_account";
        let owner_subaccount_column = "owner_subaccount";
        let owned_account_column = "owned_account";
        let owned_subaccount_column = "owned_subaccount";
        format!(
            "{} {} {}({}, '') {} {}({}, '') {} {} {} {} {} {} {}.{} {} $1 {} {}.{} {} $1",
            SELECT,
            DISTINCT,
            COALESCE,
            owner_account_column,
            CONCAT,
            COALESCE,
            owner_subaccount_column,
            AS,
            column_alias,
            FROM,
            table,
            table_alias,
            WHERE,
            table_alias,
            owned_account_column,
            EQUAL,
            OR,
            table_alias,
            owned_subaccount_column,
            EQUAL
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_a_select_account_profile_by_account_sql() {
        let test_table = AccountProfileTable::new();
        let expected = "SELECT id::text, account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng::text, email_address, telephone_country_code::text, telephone_area_code::text, telephone_number::text, occupation_id::text, industry_id::text FROM account_profile WHERE account_name = $1;";
        assert_eq!(test_table.select_account_profile_by_account_sql(), expected);
    }

    #[test]
    fn it_creates_a_select_account_profiles_by_db_cr_accounts_sql() {
        let test_table = AccountProfileTable::new();
        let expected = "SELECT id::text, account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng::text, email_address, telephone_country_code::text, telephone_area_code::text, telephone_number::text, occupation_id::text, industry_id::text FROM account_profile WHERE account_name = $1 OR account_name = $2;";
        assert_eq!(
            test_table.select_account_profiles_by_db_cr_accounts_sql(),
            expected
        );
    }

    #[test]
    fn it_creates_a_select_approvers_sql() {
        let expected = "SELECT DISTINCT coalesce(owner_account, '') || coalesce(owner_subaccount, '') AS approver FROM account_owner ao WHERE ao.owned_account = $1 OR ao.owned_subaccount = $1";
        assert_eq!(AccountProfileTable::select_approvers(), expected);
    }
}

// todo: replace with above
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
