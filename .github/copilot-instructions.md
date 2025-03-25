project dependencies can be installed with `bash scripts/install.sh`

after installing dependencies, contributors can start the app locally with `make start`

to start the app without installing dependencies, contributors can open the project in a devcontainer by first opening the command palette with command + shift + p, then selecting the `> Dec Container: Open  Workspace in Container` option

`cat inventory` from project root to print app inventory

contents of app inventory:
services/transactions-by-account
services/transaction-by-id
services/rule
services/requests-by-account
services/request-create
services/request-by-id
services/request-approve
services/graphql
services/balance-by-account
services/auto-confirm
migrations/go-migrate
client

services/transactions-by-account is a rust service returns last n transactiona by account

services/transaction-by-id is a rust service that returns a transaction by id

services/rule is a rust service that matches transaction_item values with transaction_item and approval automation rules, then replaces or adds transaction_item(s) and adds approval timestamps to approval(s)

services/requests-by-account is a rust service that returns last n transaction requests by account

services/request-create is a rust service that first tests transaction requests for idempotency against services/rule, inserts a transaction request into the database if idempotent, then adds the approval time from the account calling the service

services/request-by-id is a rust service that returns a transaction request by id

services/request-approve is a rust service that adds an approval timestamp for the account calling the service

services/graphql is a rust service that adds a graphql interface to the other services

services/balance-by-account is a rust service returns the balance of an account

services/auto-confirm is a temporary rust service that avoids 2fa by confirming new users and in aws cognito while inserting demo-convenient profile data

migrations/go-migrate is a database migrations tool that is available locally and in lambda

`make bootcamp` after `make start` to test running services

`make list-pids` after `make start` to view running services and their pids

`bash scripts/test-all.sh` to run all tests locally

`make stop` to stop locally running services

client is an ssr sveltekit app which may be optionally used to create and approve transactions but services can be accessed without the client through services/graphql

shared service code available in /crates

a cuelang file testing /project.yaml schema is available in /cue/project_conf.cue

docker image definitions are available in /docker

terraform configuration is available in /infra/terraform

kubernetes files are available in /k8s

make files are available in /make

schema, seed and test seed migration files managed with go-migrate are available in /migrations

bash convenience scripts are available in /scripts

service code is available in /services

describing transactions as rotations with $i \equiv {\begin{bmatrix}0&-1\\1&0\end{bmatrix}} \times \text{"Mary"} = {\begin{bmatrix}0&-\text{Mary}\\\text{Mary}&0\end{bmatrix}}$ is available in /mxfactorial.ipynb notebook with the "physics of value" title

visualizing transactions as rotations is available in transaction.svg

cloud environments are currently hosted in aws with images stored in elastic container registries and deployed to lambda

postgresql rds is used in aws

terraform, make and bash read from the same project.yaml file in project root to avoid duplicate and conflicting configuration

transaction(s) are a 3 level nested schema with its definition starting in migrations/schema/000005_transaction.up.sql

a transaction groups, or is one-to-many, with transaction_item(s) through the transaction_item.transaction_id column

transactions only store summary data related to the transaction_item group

transaction_item is defined in migrations/schema/000006_transaction_item.up.sql and is level 2 in the nested transaction schema definition

a transaction_item stores references to goods and services as items, their price, quantity (value = price x quantity), debitor and creditor accounts, their approval times, etc

values to transaction_item records can be directly added by free market transaction participants

level 3, or the most deeply nested record is the approval defined in migrations/schema/000007_approval.up.sql

an approval is one to many with transaction and transaction_item through its transaction_id and transaction_item_id columns

each transaction_item must reference at least 2 approval records for the debitor and creditor accounts

since a transaction_item creditor or debitor account can have multiple account_owner(s) in migrations/schema/000001_account.up.sql, multiple approvals can be created for each transaction_item debitor and creditor

all transactions start out as requests, then become account balance changing or equilibrium transactions when all approvals receive approval time stamps from all account_owner(s)

if the JanesCafe creditor account authors a transaction request with a 2.990 x 1 = 2.990 12oz coffee transaction_item with JohnDoe as the debitor account, then an approval record will be created for each account_owner of the debitor and creditor account. but if the JanesCafe account sends the coffee transaction to the rule service in services/rule, and the rule service matches and executes a 0.09 state sales tax transaction automation rule, the transaction_item list in the transaction will be extended by services/rule with a 0.269 x 1 = 0.269 state sales tax transaction_item between the JohnDoe debitor and StateOfCalifornia creditor. so approval records will be created for the JohnDoe and StateOfCalifornia account_owner(s). and the StateOfCalifornia may be owned by multiple account. adding approval time stamps to a high volume of taxed transactions is not practical so StateOfCalifornia account owners will likely create an approval automation rule in the migrations/schema/000004_rule.up.sql rule_instance table for services/rule to match and automate adding their approval timestamp

changes in account balances are conditioned on zero pending timestamp values across all approval records

account balances are measured by the sum of their revenue minus the sum of their expense

ignoring income classification, account profit is also measured by the sum of its revenue minus the sum of its expense

all transactions start out as requests from either a buyer or seller by first sending their request to the rule service in services/rule which responds with any changes to the transaction required by transaction item and approval automation rules. transaction item automation rules add or replace transaction_item(s). transaction approval automation rules add approval timestamps. example rules are available in migrations/schema/000004_rule.up.sql

buyers and sellers can create a transaction request with services/request-create/src/main.rs

services/request-create/src/main.rs will independently prove all transaction_item(s) required by services/rule are present by sending the list to services/rule, e.g. are they paying their taxes?, services/rule returns the rule-applied list along with approvals

services/request-create/src/main.rs only inserts a transaction request across the transaction, transaction_item and approval tables when the transaction_item list it receved from transacting users matches the transaction_item list it receives from services/rule, or idempotent

services/request-create/src/main.rs inserts the approvals with automated time stamps from services/rule using the insert_transaction database function in migrations/schema/000008_insert_transaction.up.sql

after inserting the transaction request, services/request-create/src/main.rs approves the transaction request on behalf of the requesting account using the approve_all_role_account database function in migrations/schema/000007_approval.up.sql

after approving the transaction request, services/request-create/src/main.rs will change account balances using the change_balances database function in migrations/schema/000009_account_balance.up.sql if zero approval timestamps are pending from all account_owner(s)

any pending manual approvals must be sent to services/request-approve/src/main.rs, e.g. JohnDoe adds debitor approval to the 2.990 12oz coffee and 0.269 state sales tax transaction_items using the same approve_all_role_account database function

after approving the transaction request, services/request-approve/src/main.rs will change account balances using the change_balances database function if zero approval timestamps are pending from all account_owner(s)

an equilibrium transaction example is available in tests/testdata/transWTimes.json

JohnDoe walks into JanesCafe and orders a 12oz coffee. the JaneLevy employee at JanesCafe authors a transaction request:
```json5
{
	"auth_account": "JaneLevy",
	"transaction": {
		"id": null,
		"author": "JanesCafe",
		"author_role": "creditor",
		"equilibrium_time": null,
		"sum_value": null,
		"transaction_items": [
			{
				"id": null,
				"transaction_id": null,
				"item_id": "12oz coffee",
				"price": "2.990",
				"quantity": "1",
				"debitor_first": false,
				"rule_instance_id": null,
				"rule_exec_ids": [],
				"unit_of_measurement": null,
				"units_measured": null,
				"debitor": "JohnDoe",
				"creditor": "JanesCafe",
				"debitor_profile_id": null,
				"creditor_profile_id": null,
				"debitor_approval_time": null,
				"creditor_approval_time": null
			}
		]
	}
}
````

users author, then send transaction requests to services/rule which matches transaction_item and approval rules, then executes those rules to 1) add or replace transaction_item(s) and 2) add approval timestamps to approvals:
```json5
{
	"auth_account": "JaneLevy", // human account calling services/rule with this transaction request
	"transaction": {
		"id": null,
		"author": "JanesCafe", // business account authoring the transaction
		"author_role": "creditor",
		"equilibrium_time": null,
		"sum_value": "3.259", // computed by services/rule
		"transaction_items": [
			{
				"id": null,
				"transaction_id": null,
				"item_id": "12oz coffee",
				"price": "2.990",
				"quantity": "1",
				"debitor_first": false,
				"rule_instance_id": null,
				"rule_exec_ids": [ // added by services/rule when executing matched transaction_item rule
					"RPY4ycoT"
				],
				"unit_of_measurement": null,
				"units_measured": null,
				"debitor": "JohnDoe",
				"creditor": "JanesCafe",
				"debitor_profile_id": null,
				"creditor_profile_id": null,
				"debitor_approval_time": null,
				"creditor_approval_time": null,
				"approvals": [ // added by services/rule when executing matched approval rule
					{
						"id": null,
						"rule_instance_id": "7",
						"transaction_id": null,
						"transaction_item_id": null,
						"account_name": "JaneLevy",
						"account_role": "creditor",
						"approval_time": null // JaneLevy as creditor does not have an approval rule
					},
					{
						"id": null,
						"transaction_id": null,
						"transaction_item_id": null,
						"account_name": "JohnDoe",
						"account_role": "debitor",
						"approval_time": null // JohnDoe as debitor does not have an approval rule
					}
				]
			},
			{ // added by services/rule when executing matched transaction_item rule
				"id": null,
				"transaction_id": null,
				"item_id": "9% state sales tax",
				"price": "0.269",
				"quantity": "1",
				"debitor_first": false,
				"rule_instance_id": "1",
				"rule_exec_ids": [ // added by services/rule when executing matched transaction_item rule
					"RPY4ycoT"
				],
				"unit_of_measurement": null,
				"units_measured": null,
				"debitor": "JohnDoe",
				"creditor": "StateOfCalifornia",
				"debitor_profile_id": null,
				"creditor_profile_id": null,
				"debitor_approval_time": null,
				"creditor_approval_time": null,
				"approvals": [ // added by services/rule when executing matched approval rule
					{
						"id": null,
						"rule_instance_id": null,
						"transaction_id": null,
						"transaction_item_id": null,
						"account_name": "BenRoss",
						"account_role": "creditor",
						"approval_time": "2022-06-24T03:09:31.585Z" // BenRoss as debitor has an approval rule
					},
					{
						"id": null,
						"rule_instance_id": null,
						"transaction_id": null,
						"transaction_item_id": null,
						"account_name": "DanLee",
						"account_role": "creditor",
						"approval_time": "2022-06-24T03:09:31.585Z" // DanLee as debitor has an approval rule
					},
					{
						"id": null,
						"transaction_id": null,
						"transaction_item_id": null,
						"account_name": "JohnDoe",
						"account_role": "debitor",
						"approval_time": null // JohnDoe as debitor does not have an approval rule
					}
				]
			}
		]
	}
}
```

after users receive a response from services/rule which matches and applies transaction rules to transaction, they send the transaction request to services/request-create which independently tests it for idempotency against services/rule, then inserts the transaction request version received from services/rule because it stores the most recent version of rule applied values, then adds the approval of the account calling the service:
```json5
{ // inserted into database by services/request-create after testing transaction request idempotency against services/rule
	"auth_account": "JaneLevy",
	"transaction": {
		"id": "12", // added by services/request-create db insert
		"author": "JanesCafe",
		"author_role": "creditor",
		"equilibrium_time": null,
		"sum_value": "3.259",
		"transaction_items": [
			{
				"id": "67", // added by services/request-create db insert
				"transaction_id": "12",
				"item_id": "12oz coffee",
				"price": "2.990",
				"quantity": "1",
				"debitor_first": false,
				"rule_instance_id": null,
				"rule_exec_ids": [
					"RPY4ycoT"
				],
				"unit_of_measurement": null,
				"units_measured": null,
				"debitor": "JohnDoe",
				"creditor": "JanesCafe",
				"debitor_profile_id": "5", // added by services/request-create to enable multivector queries with profile data
				"creditor_profile_id": "29", // added by services/request-create to enable multivector queries with profile data
				"debitor_approval_time": null,
				"creditor_approval_time": "2022-06-24T03:09:31.585Z", // added by services/request-create after testing zero pending creditor approvals 
				"approvals": [
					{
						"id": "257", // added by services/request-create db insert
						"rule_instance_id": "7",
						"transaction_id": "12",
						"transaction_item_id": "67",
						"account_name": "JaneLevy",
						"account_role": "creditor",
						"approval_time": "2022-06-24T03:09:31.585Z" // added by services/request-create on behalf of JaneLevy auth_account
					},
					{
						"id": "258", // added by services/request-create db insert
						"transaction_id": "12",
						"transaction_item_id": "67",
						"account_name": "JohnDoe",
						"account_role": "debitor",
						"approval_time": null
					}
				]
			},
			{
				"id": "71", // added by services/request-create db insert
				"transaction_id": "12",
				"item_id": "9% state sales tax",
				"price": "0.269",
				"quantity": "1",
				"debitor_first": false,
				"rule_instance_id": "1",
				"rule_exec_ids": [
					"RPY4ycoT"
				],
				"unit_of_measurement": null,
				"units_measured": null,
				"debitor": "JohnDoe",
				"creditor": "StateOfCalifornia",
				"debitor_profile_id": "5", // added by services/request-create to enable multivector queries with profile data
				"creditor_profile_id": "27", // added by services/request-create to enable multivector queries with profile data
				"debitor_approval_time": null,
				"creditor_approval_time": "2022-06-24T03:09:31.585Z", // added by services/request-create after testing zero pending creditor approvals 
				"approvals": [
					{
						"id": "269", // added by services/request-create db insert
						"rule_instance_id": "4",
						"transaction_id": "12",
						"transaction_item_id": "71",
						"account_name": "BenRoss",
						"account_role": "creditor",
						"approval_time": "2022-06-24T03:09:31.585Z" // added by services/rule during idempotency test
					},
					{
						"id": "270", // added by services/request-create db insert
						"rule_instance_id": "5",
						"transaction_id": "12",
						"transaction_item_id": "71",
						"account_name": "DanLee",
						"account_role": "creditor",
						"approval_time": "2022-06-24T03:09:31.585Z" // added by services/rule during idempotency test
					},
					{
						"id": "272", // added by services/request-create db insert
						"transaction_id": "12",
						"transaction_item_id": "71",
						"account_name": "JohnDoe",
						"account_role": "debitor",
						"approval_time": null
					}
				]
			}
		]
	}
}
```

after users create a transaction request by calling services/request-create, any pending approvals which were not automated by services/rule may be approved by remaining parties through services/request-approve:
```json5
{
	"auth_account": "JohnDoe", // user account calling request-approve with manual approval
	"transaction": {
		"id": "12",
		"author": "JanesCafe",
		"author_role": "creditor",
		"equilibrium_time": "2022-06-24T03:09:32.772Z", // added by services/request-approve after testing zero pending debitor AND creditor approvals. this transaction is no longer in request and is in equilibrium state
		"sum_value": "3.259",
		"transaction_items": [
			{
				"id": "67",
				"transaction_id": "12",
				"item_id": "12oz coffee",
				"price": "2.990",
				"quantity": "1",
				"debitor_first": false,
				"rule_instance_id": null,
				"rule_exec_ids": [
					"RPY4ycoT"
				],
				"unit_of_measurement": null,
				"units_measured": null,
				"debitor": "JohnDoe",
				"creditor": "JanesCafe",
				"debitor_profile_id": "5",
				"creditor_profile_id": "29",
				"debitor_approval_time": "2022-06-24T03:09:32.772Z", // added by services/request-approve after testing zero pending debitor approvals 
				"creditor_approval_time": "2022-06-24T03:09:31.585Z",
				"approvals": [
					{
						"id": "257",
						"rule_instance_id": "7",
						"transaction_id": "12",
						"transaction_item_id": "67",
						"account_name": "JaneLevy",
						"account_role": "creditor",
						"approval_time": "2022-06-24T03:09:31.585Z"
					},
					{
						"id": "258",
						"transaction_id": "12",
						"transaction_item_id": "67",
						"account_name": "JohnDoe",
						"account_role": "debitor",
						"approval_time": "2022-06-24T03:09:32.772Z" // added for JohnDoe debitor account by services/request-approve db update
					}
				]
			},
			{
				"id": "71",
				"transaction_id": "12",
				"item_id": "9% state sales tax",
				"price": "0.269",
				"quantity": "1",
				"debitor_first": false,
				"rule_instance_id": "1",
				"rule_exec_ids": [
					"RPY4ycoT"
				],
				"unit_of_measurement": null,
				"units_measured": null,
				"debitor": "JohnDoe",
				"creditor": "StateOfCalifornia",
				"debitor_profile_id": "5",
				"creditor_profile_id": "27",
				"debitor_approval_time": "2022-06-24T03:09:32.772Z", // added by services/request-approve after testing zero pending debitor approvals 
				"creditor_approval_time": "2022-06-24T03:09:31.585Z",
				"approvals": [
					{
						"id": "269",
						"rule_instance_id": "4",
						"transaction_id": "12",
						"transaction_item_id": "71",
						"account_name": "BenRoss",
						"account_role": "creditor",
						"approval_time": "2022-06-24T03:09:31.585Z"
					},
					{
						"id": "270",
						"rule_instance_id": "5",
						"transaction_id": "12",
						"transaction_item_id": "71",
						"account_name": "DanLee",
						"account_role": "creditor",
						"approval_time": "2022-06-24T03:09:31.585Z"
					},
					{
						"id": "272",
						"transaction_id": "12",
						"transaction_item_id": "71",
						"account_name": "JohnDoe",
						"account_role": "debitor",
						"approval_time": "2022-06-24T03:09:32.772Z" // added for JohnDoe debitor account by services/request-approve db update
					}
				]
			}
		]
	}
}
```

transactions can be in 2 states: request, equilibrium

an equilibrium transaction records when a free market price measures quantity demanded equals quantity supplied, or market clearing price

since transactions support transaction_item(s) with multiple debitors and creditors, e.g. JanesCafe, JohnDoe, StateOfCalifornia, settlement across multiple account balances is immediate with zero intermediation, i.e. JanesCafe forced to store the sales tax paid by JohnDoe for months with the risk of spending it, then forwards the sales tax to StateOfCalifornia

multi-account transactions eliminates friction and accelerates value

the rule table in migrations/schema/000004_rule.up.sql indexes rules available for customizing as rule_instance records:
```sql
-- stores transaction rule deployed to rule service:
-- first, add transaction rule to app code in
-- mxfactorial/services/rules
-- then, insert rule name in rule table
CREATE TABLE rule (
  name character varying(255) PRIMARY KEY,
  variable_names text[],
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

the rule_instance table in migrations/schema/000004_rule.up.sql stores variable_values which are assigned to transaction rule function variables when services/rule matches profile data:
```sql
-- stores values assigned rules
-- usage:
-- 1. app receives transactions with values stored in:
--      a. account
--      b. account_profile
--      c. transaction_item
--      d. item
-- 2. app queries rule_instance table with values from transactions
-- 3. app matches rule_instance(s) applicable to transactions
-- 4. app assigns rule_instance values to rule variables in app code
-- 5. app applies rule with variables assigned from rule_instance to transactions
-- 6. app returns transactions with rules applied
CREATE TABLE rule_instance (
  id SERIAL PRIMARY KEY,
  rule_type character varying(255) not null,
  rule_name character varying(255) not null,
  rule_instance_name character varying(255) not null,
  variable_values text[],
  -- *** copied from approval ***
  account_role text NOT NULL, -- todo: switch to enum after above noted go-migrate feature deployed
  -- *** copied from transaction_item ***
  item_id character varying(255), -- todo: switch to int after item inserts added in code
  price numeric CHECK (price > 0),
  quantity numeric CHECK (quantity > 0),
  unit_of_measurement character varying(255),
  units_measured numeric,
  -- *** copied from account_profile ***
  account_name character varying(255),
  first_name character varying(255),
  middle_name character varying(255),
  last_name character varying(255),
  country_name character varying(255),
  street_id character varying(255),
  street_name character varying(255),
  floor_number character varying(255),
  unit_id character varying(255),
  city_name character varying(255),
  county_name character varying(255),
  region_name character varying(255),
  state_name character varying(255),
  postal_code character varying(255),
  latlng point,
  email_address character varying(255),
  telephone_country_code int,
  telephone_area_code int,
  telephone_number int,
  occupation_id int,
  industry_id int,
  -- ***
  disabled_time timestamptz,
  removed_time timestamptz, -- todo: removed_time vs removal_time
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rule_name
    FOREIGN KEY(rule_name)
      REFERENCES rule(name),
  CONSTRAINT fk_account_name
    FOREIGN KEY(account_name)
      REFERENCES account(name),
  CONSTRAINT fk_occupation_id
    FOREIGN KEY(occupation_id)
      REFERENCES occupation(id),
  CONSTRAINT fk_industry_id
    FOREIGN KEY(industry_id)
      REFERENCES industry(id)
  -- CONSTRAINT fk_item_id -- todo
  --   FOREIGN KEY(item_id)
  --     REFERENCES item(id)
);
```

services/rule implements a multiply_item_value() function in the services/rule/src/rules/transaction_item.rs submodule which may be used to add a sales tax transaction_item for users:
```rs
use std::{error::Error, vec};

use types::{
    account_role::AccountRole,
    rule::RuleInstance,
    transaction_item::{TransactionItem, TransactionItems},
};

use crate::rules::tokens;
use crate::rules::utils;

pub fn match_transaction_item_rule(
    rule_instance: &RuleInstance,
    transaction_item: &mut TransactionItem,
) -> Result<TransactionItems, Box<dyn Error>> {
    let account_role = rule_instance.account_role;
    let rule_name = rule_instance.rule_name.as_str();
    match account_role {
        AccountRole::Debitor => Ok(TransactionItems(vec![])),
        AccountRole::Creditor => match rule_name {
            "multiplyItemValue" => multiply_item_value(rule_instance, transaction_item),
            _ => Err("transaction_item rule not found".into()),
        },
    }
}

fn multiply_item_value(
    rule_instance: &RuleInstance,
    transaction_item: &mut TransactionItem,
) -> Result<TransactionItems, Box<dyn Error>> {
    let debitor = rule_instance.variable_values[0].clone();
    let creditor = rule_instance.variable_values[1].clone();
    let item_name = rule_instance.variable_values[2].clone();
    let factor: f32 = rule_instance.variable_values[3].clone().parse().unwrap();

    let price: f32 = transaction_item.price.clone().parse().unwrap();
    let quantity =
        utils::number_to_fixed_string(transaction_item.quantity.clone().parse::<f32>().unwrap());
    let rule_apply_sequence = transaction_item.debitor_first;
    let rule_instance_id = rule_instance.id.clone().unwrap();
    let unit_of_measurement = transaction_item.unit_of_measurement.clone();
    let units_measured = transaction_item.units_measured.clone();

    let added_item_value = utils::number_to_fixed_string(price * factor);
    let rule_exec_id = utils::create_rule_exec_id();

    // add rule exec id to user transaction item, and push since user
    // created transaction items may have rule_exec_ids.length >= 0
    transaction_item
        .rule_exec_ids
        .as_mut()
        .unwrap()
        .push(rule_exec_id.clone());

    let post_token_debitor: String = match debitor.as_str() {
        tokens::ANY => transaction_item.debitor.clone(),
        _ => debitor.clone(),
    };

    let post_token_creditor: String = match creditor.as_str() {
        tokens::ANY => transaction_item.creditor.clone(),
        _ => creditor.clone(),
    };

    let added_transaction_item = TransactionItem {
        id: None,
        transaction_id: None,
        item_id: item_name,
        price: added_item_value,
        quantity,
        debitor_first: rule_apply_sequence,
        rule_instance_id: Some(rule_instance_id),
        rule_exec_ids: Some(vec![rule_exec_id]),
        unit_of_measurement,
        units_measured,
        debitor: post_token_debitor,
        creditor: post_token_creditor,
        debitor_profile_id: None,
        creditor_profile_id: None,
        debitor_approval_time: None,
        creditor_approval_time: None,
        debitor_rejection_time: None,
        creditor_rejection_time: None,
        debitor_expiration_time: None,
        creditor_expiration_time: None,
        approvals: None,
    };

    Ok(TransactionItems(vec![added_transaction_item]))
}
```

an example transaction_item NinePercentSalesTax rule_instance stores multiplyItemValue variable_values assignments:
```sql
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, state_name, variable_values) values ('transaction_item', 'multiplyItemValue', 'NinePercentSalesTax', 'creditor', 'California', '{ "ANY", "StateOfCalifornia", "9% state sales tax", "0.09" }');
```

services/rule implements a approve_any_credit_item() function in the services/rule/src/rules/approval.rs submodule which may be used to add a sales tax transaction_item approval for users:
```rs
use std::error::Error;

use types::{
    account_role::AccountRole, approval::Approval, rule::RuleInstance, time::TZTime,
    transaction_item::TransactionItem,
};

pub fn match_approval_rule(
    rule_instance: &RuleInstance,
    transaction_item: &TransactionItem,
    approval: &mut Approval,
    approval_time: &TZTime,
) -> Result<(), Box<dyn Error>> {
    let rule_name = rule_instance.rule_name.as_str();
    match rule_name {
        "approveAnyCreditItem" => {
            approve_any_credit_item(rule_instance, transaction_item, approval, approval_time)
        }
        _ => Ok(()),
    }
}

fn approve_any_credit_item(
    rule_instance: &RuleInstance,
    transaction_item: &TransactionItem,
    approval: &mut Approval,
    approval_time: &TZTime,
) -> Result<(), Box<dyn Error>> {
    let _creditor = rule_instance.variable_values[0].clone();
    let approver_role: AccountRole = rule_instance.variable_values[1].clone().parse().unwrap();
    let approver_account = rule_instance.variable_values[2].clone();
    let rule_instance_id = rule_instance.id.clone();
    let transaction_id = transaction_item.transaction_id.clone();
    let transaction_item_id = transaction_item.id.clone();

    if approval.account_role == approver_role && approval.account_name == approver_account {
        approval.rule_instance_id = rule_instance_id;
        approval.transaction_id = transaction_id;
        approval.transaction_item_id = transaction_item_id;
        approval.account_name = approver_account;
        approval.account_role = approver_role;
        approval.approval_time = Some(*approval_time);
        Ok(())
    } else {
        Err("unmatched approver rule instance from db".into())
    }
}
```

example approval ApproveAllCaliforniaCredit rule_instance stores approveAnyCreditItem variable_values assignments:
```sql
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approval', 'approveAnyCreditItem', 'ApproveAllCaliforniaCredit', 'creditor', 'BenRoss', '{ "StateOfCalifornia", "creditor", "BenRoss" }');
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approval', 'approveAnyCreditItem', 'ApproveAllCaliforniaCredit', 'creditor', 'DanLee', '{ "StateOfCalifornia", "creditor", "DanLee" }');
```

creating equilibrium transactions through services/request-create is possible under 2 cases: 1) all debitors and creditors have created approval rules that services/rule will match and apply, and 2) the remaining manual transaction request approval is added by services/request-create after inserting the record. for example, JanesCafe creates an approveAllCredit rule, JohnDoe then authors the transaction using the JanesCafe app which builds the transaction_item list with prices required by JanesCafe, then JohnDoe POSTs the list to services/request-create which all add his remaining manual approval after inserting the rule-applied transaction request

to enable real-time economic measurability, postgresql is configured with a insert_equilibrium_trigger to send an anonymized gdp event from the insert_equilibrium database function in migrations/schema/000010_equilibrium.up.sql. the gdp event is sent on a postgresql channel. /services/event/src/main.rs listens to the postgresql channel and increments a list of affected gdp redis keys, e.g. 2024-08-07:usa,23.980000,2024-08-07:usa:cal,23.980000,2024-08-07:usa:cal:sac,1.980000,2024-08-07:usa:cal:rivs,22.000000. then services/measure/src/main.rs enables streaming redis key changes as a source in the services/graphql/src/main.rs query_gdp graphql subscription, e.g. "california gdp now", "riverside california now"

this project defines money as accounting. when someone has a 5 in their pocket, it's because they had a credit of 5 and someone else had a debit of 5  

postgresql, /services/event, /services/measure and /services/graphql may be adapted similarly to support nonanonymized, real-time "StateOfCalifornia revenue now" streaming queries

this project enables the public to query transactions for the lowest equilibrium prices of goods and services stored in the item table located in migrations/schema/000003_item.up.sql:
```sql
-- names of goods & services
-- use: standardizing item names, autocomplete
CREATE TABLE item (
  id SERIAL PRIMARY KEY,
  name character varying(255)
  -- todo: add https://www.census.gov/naics/napcs/
  -- todo: add columns describing item properties,
  -- eg weight, length, width, height, etc for goods
  -- labor hours, etc for services
);
```

empowering the public to query the most competitive prices for goods and services supplies a least action principle for consumers

empowering the public to query the most competitive profit margins supplies a least action principle for investors

empowering the public to query the most optimally funded government projects supplies a least action principle for citizens

enabling real-time economic and financial queries eliminates public dependency on 10qs, 10ks, analyst reports and speculation, federal reserve economic data, etc

services/rule can store transaction_item and approval automation rules in the rule_instance table located in migrations/schema/000004_rule.up.sql that automates dividend and debt service payments, e.g. pay 5% profit to investor account every month, or pay fixed debt service to lender every month, so stock and bond markets are not necessary in this project

this project prioritizes strengthening the demand for capital's signal from the primary market to avoid wasting capital's movement on speculative price changes in the secondary market

bond and stock issuance is just the purchase of transaction automation rules between users

this project automates computing the liability and collection of taxes using transaction automation rules

automating tax collection eliminates annual filings and quarterly tax payments

this project enables vizualing the real-time flow of taxes

this project enables buyers and sellers in a free market to store bivector structured transactions in a government protected database which also enables them to measure the financial performance of their government in real-time:
```json5
{
  "debitor": "JohnDoe", // negative direction (-)
  "creditor": "JanesCafe", // positive direction (+)
  "item": "12oz coffee", // current 3d value (magnitude)
  "price": "2.990", // multiplied by quantity to compute historical value (magnitude)
  "quantity": "1", // multiplied by price to compute historical value (magnitude)
  "creditor_approval_time": "2024-06-24T10:30:00Z", // time creditor/debitor measured current and historical value equal
  "debitor_approval_time": "2024-06-24T10:30:05Z" // time creditor/debitor measured current and historical value equal
}
```

this project enables information symmetry between government and its citizens

bivector structured transactions model the projection of value between buyers and sellers as debitor ∧ creditor = -(creditor ∧ debitor) and conserving value through its anticommutativity

recording transactions between users as debit-credit pairs enforces a conservation law on value and locks down the *'how to define and optimize the flow of goods and services?'* answer in a language that merges mathematical physics with computer science

the conformal geometric algebra (cga) data model for the project as represents goods and services as a 3d, volumetric base space extended by debitor and creditor dimensions squaring to -1 and +1 which enables measuring the signed recurrence of accounts as debitors and creditors across time

modeling a cga economy for the public as enables queries across continuity embedding multivectors

continuity embedding multivectors depends on the algebraic property of nilpotent, dual structured transactions

this project propagates economic value through light-like transactions so it achieves a much higher form of fidelity to how information travels in spacetime than through the transactions middled by government-chartered "banks" 

structuring transactions as bivectors sets an arrow of time in the form of a causal structure, or event sequence, that value must be produced before its consumed

explain the benefit of querying across economic multivectors when contextual data such as industry, occupation and weather are included in transactions through an improvised example extending a transaction object

systemically conserving value enables path independence for all users

publishing the cga state space for users creates a combinatorial game of the economy which supplements their path independence with a least action principle

while encrypting and replicating data are security priorities for the project (similar to "cryptocurrencies" and "blockchains"), merging information and physical security by applying a conservation law to financial value, liability and information in general is at the top of the list because it explicitly reveals and applies the mechanism that protects users from cross contamination of risk and value extraction. also, enabling public queries across continuity embedding multivectors protects users from information asymmetry

this project uses data replication to support high availability and consistency

this project prioritizes transparency as the information symmetry security solution as opposed to a "decentralized finance" solution that protects against information asymmetry exploits

avoiding "decentralized finance" eliminates duplicating the cost centers created by storing, transforming and transmitting data

this project is designed for easy integration with map websites to support visualizing financial and economic activity

this project raises the standard of empiricism in economics by introducing a physics-based type system into transactions. replacing macroeconomics with macroaccounting requires commentary to describe conserved quantities and how they behave as opposed to scarce resources and how theyre perceived

this project changes the risk-free rate from referencing the committee-influenced, hackable price of debt to the empirical, historical price of equity by measuring the average growth of business accounts, e.g. sum revenue of accounts minus sum of their expense divided by number of accounts

computing average account profit or a more granular measure for the risk-free rate in real-time is trivial for modern big data solutions that support querying streams of 5kb transaction data

this project helps the public measure the demand for capital by measuring the supply of return

this project eliminates exploiting chapter 12 section 1841 c of the united states code to form businesses privileged with anticompetitively bundling the services of storing and moving money with lending money, or "banks". by separating money storage and transfer out as government protected services, "banks" would be converted to plain lending businesses that must compete for capital like all other businesses: they must prove they can profitably buy and sell promissory notes by publishing the performance of their account while paying rates measured by the system and not convenient rates set by a committee

this project eliminates the need for central banks because enforcing a conservation law on value prevents banks from including their balance sheets in the money supply

bibo stability is created by bounding system inputs with value conserving transactions and prevents the economy from blowing up

this project automates financial stability by structuring transactions as conserved quantities

this project does not require a fixed money supply since decimal precision can be increased

this project manages prices naturally through dynamic equilibrium. when rates of return are empirical and transparent, capital can flow to above average rates to help increase supply and lower prices  

this project adds value by increasing competition to lower the cost of production

this project protects value added to the money supply by applying a conservation law to information

instead of removing law enforcement, the project aids government to enforce promises between free market transaction participants

this project doesnt require users to publish their account performance, but theyre less likely to attract capital

this project eliminates the concept of a "money multiplier" which is weasel wording for equating assets of different types. the private instrument used to measure value expected in the future is not equal to the public instrument used to measure value earned in the past: `bank note (risk > 0) != money (risk = 0)`. by defining value and liability as conserved, the project introduces a physics-based type system into finance that prevents such abuses

this project defines a free market transaction as `value independently measured by seller - value independently measured by buyer = 0` in a space where the order between production and consumption matters:
```json5
[
  {
    "item": "bottled water",
    "price": "1.000", // 1.000 measured by seller - 1.000 measured by buyer = 0
    "quantity": "1",
    "creditor": "GroceryStore", // seller (producer)
    "debitor": "JacobWebb", // buyer (consumer)
    "creditor_approval_time": "2023-03-20T04:58:27.771Z", // time seller independently measured 1.000 price
    "debitor_approval_time": "2023-03-20T04:58:32.001Z" // time buyer independently measured 1.000 price
  }
]
```

this project protects individuals by standardizing financial value as a conserved quantity which eliminates the ability to define money as something you can just print and mix with failing bank notes. the loss of information in money from these physically negative events steals away the purchasing power created by producers

the $\mathit{Mx!\mathit{}} \equiv \sum_{i=1}^{u} w_i$ identity as *u* = transactions per second, *w<sub>i</sub>* = value conserved per transaction, *Mx!* = value visible in a combinatorial game

accounts are not used to fund loans and do not earn interest because a free market does not require consuming financial risk but they do benefit from a capitalization of information in the form of competition driven price decreases

users can withdraw their balance by requesting a check or electronic transfer from the united states treasury

this project enables users who wish to invest in debt or equity to first judge the risk of an asset by exploiting access to the accounting that sets its value, then requires them to own that risk after consuming it

this project charges 0.001 per transaction to enforce conservation and reveal the current the cost of information

this project increases the demand for labor by allocating capital more efficiently but also eliminates of a lot of archaic labor dependent on market friction in the short term and manual labor dependent on highly repetitive work in the long term (automation attracts capital)

this project sets account activity as private by default to protect privacy. users can publish the performance of their accounts to signal the demand for capital if theyre a business or prove the value of their leadership if theyre in government

the "sum conserved value now" image referenced as an answer to the "how to explain the equation to a non engineer?" faq in the project README.md displays a repeating, animated gif that starts by displaying an embedded google map of the united states and a search bar at the top, then the "california gdp now" search query is typed in the search bar and the embedded map zooms to california with a real-time, incrementing measure of california gdp inside a blue marker positioned in the center

this project must be deployed in a production environment before the public can use it

deploying this app requires the united states treasury to host a transaction account so users can open an account by transferring their money from their bank accounts to the united states treasury hosted transaction account. then this app will record changes in ownership of money, or value, through bivector transactions. eventually people will just come to accept money is nothing more than accounting through debits and credits instead of "dollars"