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

CREATE INDEX geocode_municipality_idx ON geocode(municipality);
CREATE INDEX geocode_region_idx ON geocode(region);
CREATE INDEX geocode_country_idx ON geocode(country);

CREATE TABLE redis_name (
  id serial PRIMARY KEY,
  key character varying(255) NOT NULL,
  value character varying(255) NOT NULL
);

CREATE INDEX redis_name_key_idx ON redis_name(key);

CREATE OR REPLACE FUNCTION notify_equilibrium() RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('equilibrium', NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_equilibrium_trigger
AFTER INSERT OR UPDATE OF equilibrium_time
ON transaction
FOR EACH ROW
WHEN (NEW.equilibrium_time IS NOT NULL)
EXECUTE PROCEDURE notify_equilibrium();