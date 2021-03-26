-- app inserts when user cannot find match
CREATE TABLE industry (
  id SERIAL PRIMARY KEY,
  sector int,
  index int,
  index_item_description character varying(255) not null unique
);

-- app inserts when user cannot find match
CREATE TABLE occupation (
  id SERIAL PRIMARY KEY,
  major_group character varying(255),
  minor_group character varying(255),
  broad_group character varying(255),
  detailed_occupation character varying(255) not null unique,
  occupation_text character varying(255) not null unique
);

-- account_profile records are versioned rather than
-- deleted to support historical transaction records
CREATE TABLE account_profile (
  id SERIAL PRIMARY KEY,
  account_name character varying(255) not null,
  description TEXT,
  first_name character varying(255) CHECK (first_name = lower(first_name)),
  middle_name character varying(255) CHECK (middle_name = lower(middle_name)),
  last_name character varying(255) CHECK (last_name = lower(last_name)),
  country_name character varying(255) CHECK (country_name = lower(country_name)),
  street_number character varying(255) CHECK (street_number = lower(street_number)), -- in case of '72f' street number
  street_name character varying(255) CHECK (street_name = lower(street_name)),
  floor_number character varying(255) CHECK (floor_number = lower(floor_number)), -- in case of 'b' floor
  unit_number character varying(255) CHECK (unit_number = lower(unit_number)), -- in case of '14d' unit number
  city_name character varying(255) CHECK (city_name = lower(city_name)),
  county_name character varying(255) CHECK (county_name = lower(county_name)),
  region_name character varying(255) CHECK (region_name = lower(region_name)),
  state_name character varying(255) CHECK (state_name = lower(state_name)),
  postal_code character varying(255) CHECK (postal_code = lower(postal_code)),
  latlng point,
  email_address character varying(255),
  telephone_country_code int,
  telephone_area_code int,
  telephone_number int,
  occupation_id int,
  industry_id int,
  removal_time timestamptz, -- most recent == null
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_account_name
    FOREIGN KEY(account_name)
      REFERENCES account(name),
  CONSTRAINT fk_occupation_id
    FOREIGN KEY(occupation_id)
      REFERENCES occupation(id),
  CONSTRAINT fk_industry_id
    FOREIGN KEY(industry_id)
      REFERENCES industry(id)
);

CREATE INDEX idx_current_account_profile ON account_profile(account_name) WHERE removal_time IS NULL;