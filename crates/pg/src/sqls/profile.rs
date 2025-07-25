use crate::sqls::common::*;
use tokio_postgres::types::Type;
use types::account::AccountProfile;

const ACCOUNT_PROFILE_TABLE: &str = "account_profile";

pub struct AccountProfileTable {
    inner: Table,
}

impl TableTrait for AccountProfileTable {
    fn new() -> AccountProfileTable {
        Self {
            inner: Table::new::<AccountProfile>(ACCOUNT_PROFILE_TABLE),
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

    fn column_count(&self) -> usize {
        self.inner.len()
    }
}

impl AccountProfileTable {
    fn select_all_with_text_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("id").cast_column_as(Type::TEXT),
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
            self.get_column("removal_time"),
        ])
    }

    fn select_in_with_casting(&self) -> Columns {
        Columns(vec![
            self.get_column("id").cast_column_as(Type::TEXT),
            self.get_column("account_name"),
        ])
    }

    fn insert_with_casting(&self) -> Columns {
        Columns(vec![
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
            self.get_column("latlng").cast_value_as(Type::POINT),
            self.get_column("email_address"),
            self.get_column("telephone_country_code"),
            self.get_column("telephone_area_code"),
            self.get_column("telephone_number"),
            self.get_column("occupation_id"),
            self.get_column("industry_id"),
        ])
    }

    pub fn insert_account_profile_sql(&self) -> String {
        let columns = self.insert_with_casting();
        let values = create_value_params(columns.clone(), 1, &mut 1);
        format!(
            "{} {} ({}) {} {} {} {}",
            INSERT_INTO,
            self.name(),
            columns.join_with_casting(),
            VALUES,
            values,
            RETURNING,
            self.get_column("id")
                .cast_column_as(Type::TEXT)
                .name_with_casting()
        )
    }

    pub fn select_account_profile_by_account_sql(&self) -> String {
        let columns = self.select_all_with_text_casting().join_with_casting();
        format!(
            "{} {} {} {} {} {} {} $1;",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_name").name(),
            EQUAL
        )
    }

    pub fn select_account_profiles_by_db_cr_accounts_sql(&self) -> String {
        let columns = self.select_all_with_text_casting().join_with_casting();
        format!(
            "{} {} {} {} {} {} {} $1 {} {} {} $2;",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_name").name(),
            EQUAL,
            OR,
            self.get_column("account_name").name(),
            EQUAL
        )
    }

    pub fn select_profile_ids_by_account_names_sql(&self, account_name_count: usize) -> String {
        let columns = self.select_in_with_casting().join_with_casting();
        let in_values = create_params(account_name_count, &mut 1);
        // create sql like: "SELECT id::text, account_name FROM account_profile WHERE account_name IN ($1, $2) AND removal_time IS NULL"
        format!(
            "{} {} {} {} {} {} {} ({}) {} {} {} {}",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_name").name(),
            IN,
            in_values,
            AND,
            self.get_column("removal_time").name(),
            IS,
            NULL
        )
    }

    pub fn select_profiles_by_account_names_sql(&self, account_name_count: usize) -> String {
        let columns = self.select_all_with_text_casting().join_with_casting();
        let in_values = create_params(account_name_count, &mut 1);
        format!(
            "{} {} {} {} {} {} {} ({}) {} {} {} {}",
            SELECT,
            columns,
            FROM,
            self.name(),
            WHERE,
            self.get_column("account_name").name(),
            IN,
            in_values,
            AND,
            self.get_column("removal_time").name(),
            IS,
            NULL
        )
    }

    // todo: add account_owner type and AccountOwnerTable
    pub fn select_approvers() -> String {
        let column_alias = "approver";
        let table = "account_owner";
        let table_alias = "ao";
        let owner_account_column = "owner_account";
        let owner_subaccount_column = "owner_subaccount";
        let owned_account_column = "owned_account";
        let owned_subaccount_column = "owned_subaccount";
        format!(
            "{SELECT} {DISTINCT} {COALESCE}({owner_account_column}, '') {CONCAT} {COALESCE}({owner_subaccount_column}, '') {AS} {column_alias} {FROM} {table} {table_alias} {WHERE} {table_alias}.{owned_account_column} {EQUAL} $1 {OR} {table_alias}.{owned_subaccount_column} {EQUAL} $1"
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_a_select_account_profile_by_account_sql() {
        let test_table = AccountProfileTable::new();
        let expected = "SELECT id::text, account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng::text, email_address, telephone_country_code::text, telephone_area_code::text, telephone_number::text, occupation_id::text, industry_id::text, removal_time FROM account_profile WHERE account_name = $1;";
        assert_eq!(test_table.select_account_profile_by_account_sql(), expected);
    }

    #[test]
    fn it_creates_an_insert_account_profile_sql() {
        let test_table = AccountProfileTable::new();
        let expected = "INSERT INTO account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::point, $17, $18, $19, $20, $21, $22) RETURNING id::text";
        assert_eq!(test_table.insert_account_profile_sql(), expected);
    }

    #[test]
    fn it_creates_a_select_account_profiles_by_db_cr_accounts_sql() {
        let test_table = AccountProfileTable::new();
        let expected = "SELECT id::text, account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng::text, email_address, telephone_country_code::text, telephone_area_code::text, telephone_number::text, occupation_id::text, industry_id::text, removal_time FROM account_profile WHERE account_name = $1 OR account_name = $2;";
        assert_eq!(
            test_table.select_account_profiles_by_db_cr_accounts_sql(),
            expected
        );
    }

    #[test]
    fn it_creates_a_select_profiles_by_account_names_sql() {
        let test_table = AccountProfileTable::new();
        let expected = "SELECT id::text, account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng::text, email_address, telephone_country_code::text, telephone_area_code::text, telephone_number::text, occupation_id::text, industry_id::text, removal_time FROM account_profile WHERE account_name IN ($1, $2) AND removal_time IS NULL";
        assert_eq!(test_table.select_profiles_by_account_names_sql(2), expected);
    }

    #[test]
    fn it_creates_a_select_profile_ids_by_account_names_sql() {
        let test_table = AccountProfileTable::new();
        let expected = "SELECT id::text, account_name FROM account_profile WHERE account_name IN ($1, $2) AND removal_time IS NULL";
        assert_eq!(
            test_table.select_profile_ids_by_account_names_sql(2),
            expected
        );
    }
}
