CREATE TABLE equilibrium (
  id serial PRIMARY KEY,
  item_id character varying(255) NOT NULL,
  debitor_latlng point,
  creditor_latlng point,
  price numeric NOT NULL,
  quantity numeric NOT NULL,
  equilibrium_time timestamptz NOT NULL
);

-- geocode schema used:
-- https://docs.aws.amazon.com/location/latest/APIReference/API_Place.html

-- others:
-- https://wiki.openstreetmap.org/wiki/Key:place
-- https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding#reverse-example
-- https://docs.oracle.com/en/database/oracle/oracle-database/19/spatl/geocoding-address-data-concepts.html#GUID-921F7D3A-BBCB-46B9-A728-C78D2A6D05AA

CREATE TABLE geocode (
  id serial PRIMARY KEY,
  latlng point NOT NULL,
  label character varying(255), -- e.g. '123 Main St, Springfield, IL 62701, USA'
  street character varying(255), -- street name
  municipality character varying(255), -- city name
  region character varying(255), -- state name
  sub_region character varying(255), -- county name
  postal_code character varying(255),
  country character varying(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- create indexes for municipality, region, country
CREATE INDEX geocode_municipality_idx ON geocode(municipality);
CREATE INDEX geocode_region_idx ON geocode(region);
CREATE INDEX geocode_country_idx ON geocode(country);

CREATE TABLE redis_name (
  id serial PRIMARY KEY,
  key character varying(255) NOT NULL,
  value character varying(255) NOT NULL
);

CREATE INDEX redis_name_key_idx ON redis_name(key);

CREATE OR REPLACE FUNCTION redis_gdp_keys(coordinates point) RETURNS text[] AS $$
DECLARE
  geocode_country character varying(255);
  geocode_region character varying(255);
  geocode_municipality character varying(255);
  redis_country character varying(255);
  redis_region character varying(255);
  redis_municipality character varying(255);
  country_gdp_key character varying(255);
  region_gdp_key character varying(255);
  municipality_gdp_key character varying(255);
BEGIN
  -- assign country, region, municipality from select country, region, municipality from geocode
  SELECT INTO geocode_country, geocode_region, geocode_municipality
  country, region, municipality
  FROM geocode
  WHERE latlng::text = coordinates::text;

  redis_country := (SELECT "value" FROM redis_name WHERE "key" = geocode_country);
  redis_region := (SELECT "value" FROM redis_name WHERE "key" = geocode_region);
  redis_municipality := (SELECT "value" FROM redis_name WHERE "key" = geocode_municipality);

  country_gdp_key := CURRENT_DATE::text || ':' || 'gdp' || ':' || redis_country;
  region_gdp_key := country_gdp_key || ':' || redis_region;
  municipality_gdp_key := region_gdp_key || ':' || redis_municipality;

  RETURN ARRAY[
    country_gdp_key, -- 2024-08-07:gdp:usa
    region_gdp_key, -- 2024-08-07:gdp:usa:cal
    municipality_gdp_key -- 2024-08-07:gdp:usa:cal:sac
  ];
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_equilibrium() RETURNS TRIGGER AS $$
DECLARE
  r RECORD;
  totals hstore := hstore(''); -- hstore stores creditor_latlng: price * quantity
  creditor_latlng point;
  -- debitor_latlng point; -- enable to measure spending per location
  redis_gdp_keys text[];
  redis_key_name text;
  event_value text;
BEGIN
  FOR r IN
    SELECT item_id, price, quantity, debitor_profile_id, creditor_profile_id
    FROM transaction_item
    WHERE transaction_id = NEW.id
  LOOP
    creditor_latlng := (SELECT latlng FROM account_profile WHERE id = r.creditor_profile_id);

    -- cadet todo: test for missing values and throw error

    INSERT INTO equilibrium (item_id, debitor_latlng, creditor_latlng, price, quantity, equilibrium_time)
    VALUES (
      r.item_id,
      (SELECT latlng FROM account_profile WHERE id = r.debitor_profile_id),
      creditor_latlng,
      r.price,
      r.quantity,
      NEW.equilibrium_time
    );

    -- get redis keys for country, region, municipality gdp
    redis_gdp_keys := redis_gdp_keys(creditor_latlng);

    FOREACH redis_key_name IN ARRAY redis_gdp_keys LOOP
      -- IF redis_key_name in totals, add price * quantity
      IF totals ? redis_key_name THEN
        totals := totals || hstore(redis_key_name, ((totals -> redis_key_name)::numeric + r.price * r.quantity)::text);
      -- ELSE redis_key_name NOT in totals, init price * quantity
      ELSE
        totals := totals || hstore(redis_key_name, (r.price * r.quantity)::text);
      END IF;
    END LOOP;
  END LOOP;

  -- notify the gdp channel with totals converted to an array of alternating keys and values, example:
  -- 2024-08-07:usa,23.980000,2024-08-07:usa:cal,23.980000,2024-08-07:usa:cal:sac,1.980000,2024-08-07:usa:cal:rivs,22.000000
  event_value := array_to_string(ARRAY(SELECT * FROM hstore_to_array(totals)), ',');
  PERFORM pg_notify('event', json_build_object('name', 'gdp', 'value', event_value)::text);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER insert_equilibrium_trigger
AFTER INSERT OR UPDATE OF equilibrium_time
ON transaction
FOR EACH ROW
WHEN (NEW.equilibrium_time IS NOT NULL)
EXECUTE PROCEDURE insert_equilibrium();