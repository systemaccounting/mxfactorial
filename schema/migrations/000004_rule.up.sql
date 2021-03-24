-- stores transaction rule deployed to rule service:
-- first, add transaction rule to app code in
-- mxfactorial/services/rules-faas
-- then, insert rule name in rule table
CREATE TABLE rule (
  name character varying(255) PRIMARY KEY,
  variable_names text[] not null,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
  rule_name character varying(255) not null,
  variable_values text[] not null,
  -- *** copied from transaction_item ***
  item_id character varying(255) NOT NULL, -- todo: switch to int after item inserts added in code
  price numeric NOT NULL CHECK (price > 0),
  quantity numeric NOT NULL CHECK (quantity > 0),
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
  latlng character varying(255),
  email_address character varying(255),
  telephone_country_code character varying(255),
  telephone_area_code character varying(255),
  telephone_number character varying(255),
  occupation character varying(255),
  industry character varying(255),
  -- ***
  disabled_time timestamptz,
  removed_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rule_name
    FOREIGN KEY(rule_name)
      REFERENCES rule(name),
  CONSTRAINT fk_account_name
    FOREIGN KEY(account_name)
      REFERENCES account(name)
  -- CONSTRAINT fk_item_id -- todo
  --   FOREIGN KEY(item_id)
  --     REFERENCES item(id)
);