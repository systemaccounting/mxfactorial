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
  first_name character varying(255),
  middle_name character varying(255),
  last_name character varying(255),
  country_name character varying(255),
  street_number character varying(255), -- in case of '72f' street number
  street_name character varying(255),
  floor_number character varying(255), -- in case of 'b' floor
  unit_number character varying(255), -- in case of '14d' unit number
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