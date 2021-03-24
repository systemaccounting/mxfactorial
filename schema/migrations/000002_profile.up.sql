-- todo: import from https://www.census.gov/naics/
-- example data: https://www.census.gov/naics/?48967
-- app inserts when user cannot find match
CREATE TABLE industry (
  id SERIAL PRIMARY KEY,
  sector int,
  index int,
  index_item_description character varying(255) not null unique
);

-- todo: import from https://www.bls.gov/soc/
-- example data: https://www.bls.gov/soc/2018/soc_structure_2018.pdf
-- app inserts when user cannot find match
CREATE TABLE occupation (
  id SERIAL PRIMARY KEY,
  major_group character varying(255),
  minor_group character varying(255),
  broad_group character varying(255),
  detailed_occupation character varying(255) not null unique
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
  street_id character varying(255), -- in case of '72f' street number
  street_name character varying(255),
  floor_number character varying(255), -- in case of 'b' floor
  unit_id character varying(255), -- in case of '14d' unit number
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
  removal_time timestamptz, -- most recent == null
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_account_name
    FOREIGN KEY(account_name)
      REFERENCES account(name),
  CONSTRAINT fk_occupation
    FOREIGN KEY(occupation)
      REFERENCES occupation(detailed_occupation),
  CONSTRAINT fk_industry
    FOREIGN KEY(industry)
      REFERENCES industry(index_item_description)
);