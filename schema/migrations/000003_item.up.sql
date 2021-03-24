-- names of goods & services
-- use: standardizing item names, autocomplete
CREATE TABLE item (
  id SERIAL PRIMARY KEY,
  name character varying(255)
  -- todo: add https://www.census.gov/naics/napcs/
);