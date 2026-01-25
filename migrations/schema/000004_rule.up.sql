-- stores rule name + variable_names declarations
-- rule.variable_names defines the schema for *_rule_instance.variable_values
-- example: rule.variable_names = ["DEBITOR", "CREDITOR", "AMOUNT"]
--          rule_instance.variable_values = ["JacobWebb", "GroceryStore", "100.00"]
-- the app maps variable_names[i] -> variable_values[i] when executing rules
CREATE TABLE rule (
  name character varying(255) PRIMARY KEY,
  variable_names text[],
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- type-specific rule_instance tables
--
-- design:
--   rule table: rule name + variable_names declarations
--   *_rule_instance tables: dimensions for matching + variable_values assignments
--   services/rule/src/rules/*.rs: logic + conditions using variable_values
--
-- columns are dimensions for querying, not conditions for logic
-- conditions belong in rule code, parameterized by variable_values

-- transaction_rule_instance: produces transactions
-- dimensions match transaction table properties (author, author_device_latlng, author_role)
-- cron: if set, pg_cron scheduled; if null, triggered by incoming transaction
CREATE TABLE transaction_rule_instance (
  id SERIAL PRIMARY KEY,
  rule_name varchar(255) NOT NULL REFERENCES rule(name),
  rule_instance_name varchar(255) NOT NULL,
  variable_values text[],
  -- *** from transaction table ***
  author varchar(255) REFERENCES account(name),
  author_device_id varchar(255),
  author_device_latlng point,
  author_role text,
  -- ***
  cron varchar(255),
  disabled_time timestamptz,
  removed_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- transaction_item_rule_instance: produces transaction items (taxes, fees)
-- dimensions match transaction_item (item_id, price, quantity) and account_profile properties
-- example: NinePercentSalesTax matches state_name='California', account_role='creditor'
CREATE TABLE transaction_item_rule_instance (
  id SERIAL PRIMARY KEY,
  rule_name varchar(255) NOT NULL REFERENCES rule(name),
  rule_instance_name varchar(255) NOT NULL,
  variable_values text[],
  -- *** from approval ***
  account_role text NOT NULL,
  account_name varchar(255) REFERENCES account(name),
  -- *** from transaction_item ***
  item_id varchar(255),
  price numeric,
  quantity numeric,
  -- *** from account_profile ***
  country_name varchar(255),
  city_name varchar(255),
  county_name varchar(255),
  state_name varchar(255),
  latlng point,
  occupation_id int,
  industry_id int,
  -- ***
  disabled_time timestamptz,
  removed_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- approval_rule_instance: produces approvals
-- dimensions: account_role, account_name query which rules apply
CREATE TABLE approval_rule_instance (
  id SERIAL PRIMARY KEY,
  rule_name varchar(255) NOT NULL REFERENCES rule(name),
  rule_instance_name varchar(255) NOT NULL,
  variable_values text[],
  -- *** from account ***
  account_role text NOT NULL,
  account_name varchar(255) NOT NULL REFERENCES account(name),
  -- ***
  disabled_time timestamptz,
  removed_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
