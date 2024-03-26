use aws_lambda_events::event::cognito::CognitoEventUserPoolsPreSignup;
use fakeit::{address, name, words};
use lambda_runtime::{service_fn, Error, LambdaEvent};
use pg::postgres::DB;
use rand::Rng;
use rust_decimal::Decimal;
use serde_json::Value;
use service::Service;
use types::account::AccountProfile;
use unicode_segmentation::UnicodeSegmentation;

fn random_number(min: i32, max: i32) -> i32 {
    let mut rng = rand::thread_rng();
    rng.gen_range(min..max)
}

pub fn guess_first_and_last_names(account: &str) -> (String, String) {
    let rem = &account[1..];
    let mut next_capital_letter_index = 0;
    for (i, v) in rem.graphemes(true).enumerate() {
        if v.chars().next().unwrap().is_uppercase() {
            next_capital_letter_index = i + 1;
            break;
        }
    }
    if next_capital_letter_index == 0 {
        next_capital_letter_index = account.len() / 2;
    }
    let first_name = account[..next_capital_letter_index].to_string();
    let last_name = account[next_capital_letter_index..].to_string();
    (first_name, last_name)
}

fn create_fake_profile(account_name: &str) -> AccountProfile {
    let (first_name, last_name) = guess_first_and_last_names(account_name);
    let test_account = account_name.to_string();
    let description = Some(words::sentence(3)).map(|desc| desc.trim_end_matches('.').to_string());
    let middle_name = name::last();
    let country_name = "United States of America".to_string();
    let street_number = address::street_number();
    let street_name = address::street_name();
    let floor_number = random_number(1, 30);
    let unit_number = random_number(100, 999);
    let city_name = address::city();
    let county_name = format!("{} County", city_name);
    let region = None;
    let state_name = "California".to_string();
    let postal_code = address::zip();
    let latlng = format!("({}, {})", address::latitude(), address::longitude(),);
    let email_address = format!("{}@address.xz", account_name.to_lowercase());
    let tele_country_code = 1;
    let tele_area_code = random_number(100, 999);
    let tele_number = random_number(1000000, 9999999);
    let occ_id = random_number(1, 12);
    let ind_id = random_number(1, 11);

    AccountProfile {
        id: None,
        account_name: test_account,
        description,
        first_name: Some(first_name.to_string()),
        middle_name: Some(middle_name),
        last_name: Some(last_name.to_string()),
        country_name,
        street_number: Some(street_number.to_string()),
        street_name: Some(street_name.to_string()),
        floor_number: Some(floor_number.to_string()),
        unit_number: Some(unit_number.to_string()),
        city_name,
        county_name: Some(county_name),
        region_name: region,
        state_name,
        postal_code,
        latlng: Some(latlng),
        email_address,
        telephone_country_code: Some(tele_country_code.to_string()),
        telephone_area_code: Some(tele_area_code.to_string()),
        telephone_number: Some(tele_number.to_string()),
        occupation_id: Some(occ_id.to_string()),
        industry_id: Some(ind_id.to_string()),
        removal_time: None,
    }
}

async fn func(event: LambdaEvent<CognitoEventUserPoolsPreSignup>) -> Result<Value, Error> {
    let (event, _context) = event.into_parts();

    let mut cognito_event = event.clone();
    cognito_event.response.auto_confirm_user = true;

    // https://docs.rs/aws_lambda_events/latest/aws_lambda_events/event/cognito/struct.CognitoEventUserPoolsPreSignupRequest.html
    if let Some(skip) = event.request.client_metadata.get("skip") {
        if skip == "true" {
            return Ok(serde_json::to_value(cognito_event).unwrap());
        }
    }

    let cognito_user = event.cognito_event_user_pools_header.user_name.unwrap();

    let fake_profile = create_fake_profile(&cognito_user);

    let initial_account_balance = std::env::var("INITIAL_ACCOUNT_BALANCE").unwrap();

    let decimal_balance: Decimal = initial_account_balance.parse().unwrap();

    let conn_uri = DB::create_conn_uri_from_env_vars();

    let pool = DB::new_pool(&conn_uri).await;

    let conn = pool.get_conn().await;

    conn.0
        .execute(
            "DELETE FROM account_balance WHERE account_name = $1;",
            &[&cognito_user],
        )
        .await
        .map_err(|e| {
            tracing::error!("error: {}", e);
            Error::from(e)
        })?;

    conn.0
        .execute(
            "DELETE FROM rule_instance WHERE account_name = $1;",
            &[&cognito_user],
        )
        .await
        .map_err(|e| {
            tracing::error!("error: {}", e);
            Error::from(e)
        })?;

    conn.0
        .execute(
            "DELETE FROM account_profile WHERE account_name = $1;",
            &[&cognito_user],
        )
        .await
        .map_err(|e| {
            tracing::error!("error: {}", e);
            Error::from(e)
        })?;

    conn.0
        .execute(
            "DELETE FROM account_owner WHERE owner_account = $1;",
            &[&cognito_user],
        )
        .await
        .map_err(|e| {
            tracing::error!("error: {}", e);
            Error::from(e)
        })?;

    conn.0
        .execute("DELETE FROM subaccount WHERE name = $1;", &[&cognito_user])
        .await
        .map_err(|e| {
            tracing::error!("error: {}", e);
            Error::from(e)
        })?;

    conn.0
        .execute("DELETE FROM account WHERE name = $1;", &[&cognito_user])
        .await
        .map_err(|e| {
            tracing::error!("error: {}", e);
            Error::from(e)
        })?;

    let svc = Service::new(conn);

    let _ = svc
        .create_account_from_cognito_trigger(fake_profile, decimal_balance, 0)
        .await
        .map_err(|e| {
            tracing::error!("error: {}", e);
            Box::new(e)
        });

    Ok(serde_json::to_value(cognito_event).unwrap())
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let func = service_fn(func);
    lambda_runtime::run(func).await?;
    Ok(())
}
