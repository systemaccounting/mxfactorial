-- accounts
insert into account (name, password) values ('JohnSmith', 'password');
insert into account (name, password) values ('IrisLynn', 'password');
insert into account (name, password) values ('DanLee', 'password');
insert into account (name, password) values ('AaronHill', 'password');
insert into account (name, password) values ('SarahBell', 'password');
insert into account (name, password) values ('BenRoss', 'password');
insert into account (name, password) values ('JacobWebb', 'password');
insert into account (name, password) values ('MiriamLevy', 'password');
insert into account (name, password) values ('AzizKhan', 'password');
insert into account (name, password) values ('IgorPetrov', 'password');

-- account profiles
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('JohnSmith', 'inventor', 'John', 'Wilson', 'Smith', 'United States of America', '1050', 'W Olive Ave', null, null, 'Merced', 'Merced County', null, 'California', '95348', '(37.318830, -120.486230)', 'joe@address.xz', 1, 209, 5555555, 1, 1);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('IrisLynn', 'Hospital volunteer', 'Iris', 'Hannah', 'Lynn', 'United States of America', '2356', 'S Seneca St', null, null, 'Wichita', 'Sedgwick County', null, 'Kansas', '67213', '(37.651930, -97.352190)', 'iris@address.xz', 1, 316, 5555555, 2, 2);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('DanLee', 'Guitar player', 'Dan', 'Howard', 'Lee', 'United States of America', '1101', '2nd Ave NE', null, null, 'Staples', 'Todd County', null, 'Minnesota', '56479', '(46.355720, -94.784420)', 'dan@address.xz', 1, 218, 5555555, 3, 3);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('AaronHill', 'Shortwave radio operator', 'Aaron', 'Baker', 'Hill', 'United States of America', '2344', 'Central Ave', null, null, 'Billings', 'Yellowstone County', null, 'Montana', '59102', '(45.769540, -108.575760)', 'aaron@address.xz', 1, 406, 5555555, 4, 4);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('SarahBell', 'Expert diver', 'Sarah', 'Dixon', 'Bell', 'United States of America', '21855', 'State Hwy 75', null, null, 'Clayton', 'Custer County', null, 'Idaho', '83227', '(44.261730, -114.419700)', 'sarah@address.xz', 1, 208, 5555555, 5, 5);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('BenRoss', 'Coin collector', 'Ben', 'Oliver', 'Ross', 'United States of America', '3650', 'Glendwood Dr', null, null, 'Eugene', 'Lane County', null, 'Oregon', '97403', '(44.0341831,-123.0420753)', 'ben@address.xz', 1, 541, 5555555, 6, 6);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('JacobWebb', 'Soccer coach', 'Jacob', 'Curtis', 'Webb', 'United States of America', '205', 'N Mccarran Blvd', null, null, 'Sparks', 'Washoe County', null, 'Nevada', '89431', '(39.534552,-119.737825)', 'jacob@address.xz', 1, 775, 5555555, 7, 7);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('MiriamLevy', 'Amateur astronomer', 'Miriam', 'Colt', 'Levy', 'United States of America', '6903', 'Brodie Ln', null, null, 'Austin', 'Travis County', null, 'Texas', '78745', '(30.2140419,-97.8297857)', 'miriam@address.xz', 1, 512, 5555555, 8, 8);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('AzizKhan', 'Chess player', 'Aziz', 'Abdul', 'Khan', 'United States of America', '180', 'River St', null, null, 'Danville', 'Travis County', null, 'Virginia', '24540', '(36.5898155,-79.3844719)', 'aziz@address.xz', 1, 434, 5555555, 9, 9);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('IgorPetrov', 'Classical pianist', 'Igor', 'Sergei', 'Petrov', 'United States of America', '1220', 'Fulton Ave', null, null, 'Uniondale', 'Nassau County', null, 'New York', '11553', '(40.713235,-73.606191)', 'igor@address.xz', 1, 516, 5555555, 10, 10);

-- subaccounts
insert into account (name, created_by) values ('CPA', 'JohnSmith');
insert into account (name, created_by) values ('SunflowerFarms', 'IrisLynn');
insert into account (name, created_by) values ('GoldMiners', 'DanLee');
insert into account (name, created_by) values ('EnergyCo', 'AaronHill');
insert into account (name, created_by) values ('USTreasury', 'SarahBell');
insert into account (name, created_by) values ('StateOfCalifornia', 'BenRoss');
insert into account (name, created_by) values ('TimeCo', 'JacobWebb');
insert into account (name, created_by) values ('GroceryCo', 'MiriamLevy');
insert into account (name, created_by) values ('Skyways', 'AzizKhan');
insert into account (name, created_by) values ('CloudBiz', 'IgorPetrov');

-- subaccount profiles
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('CPA', 'Certified Public Accountant', null, null, null, 'United States of America', '1050', 'W Main St', null, null, 'Merced', 'Merced County', null, 'California', '95340', '(37.3058494,-120.4930238)', 'cpa@address.xz', 1, 209, 5555555, null, 1);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('SunflowerFarms', 'Sunflower seed producers', null, null, null, 'United States of America', '1545', 'South Meridian Avenue', null, null, 'Wichita', 'Sedgwick County', null, 'Kansas', '67213', '(37.666594,-97.3711619)', 'sunflowers@address.xz', 1, 316, 5555555, null, 2);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('GoldMiners', 'Gold miners', null, null, null, 'United States of America', '223', '6th street', null, null, 'Staples', 'Todd County', null, 'Minnesota', '56479', '(46.3527661,-94.7922353)', 'gold@address.xz', 1, 218, 5555555, null, 3);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('EnergyCo', 'Electricity company', null, null, null, 'United States of America', '2648', 'Poly Drive', null, null, 'Billings', 'Yellowstone County', null, 'Montana', '59102', '(45.7951193,-108.5823638)', 'energyco@address.xz', 1, 406, 5555555, null, 4);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('USTreasury', 'United States Treasury', null, null, null, 'United States of America', '1500', 'Pennsylvania Avenue, NW', null, null, 'District of Columbia', null, null, 'Washington, D.C.', '20220', '(38.89879608154297,-77.03437042236328)', 'ustreasury@address.xz', 1, 202, 5555555, null, 11);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('StateOfCalifornia', 'State of California', null, null, null, 'United States of America', '450', 'N St', null, null, 'Sacramento', 'Sacramento County', null, 'California', '95814', '(38.5777292,-121.5027026)', 'stateofcalifornia@address.xz', 1, 916, 5555555, null, 11);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('TimeCo', 'Clock manufacturer', null, null, null, 'United States of America', '2858', 'Vista Blvd', null, null, 'Sparks', 'Washoe County', null, 'Nevada', '89434', '(39.5284539,-119.7010352)', 'clockers@address.xz', 1, 775, 5555555, null, 7);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('GroceryCo', 'Grocery store', null, null, null, 'United States of America', '2401', 'San Gabriel St', null, null, 'Austin', 'Travis County', null, 'Texas', '78705', '(30.28769874572754,-97.74787139892578)', 'groceryco@address.xz', 1, 512, 5555555, null, 8);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('Skyways', 'Regional passenger airline', null, null, null, 'United States of America', '215', 'Piedmont Pl', null, null, 'Danville', 'Travis county', null, 'Virginia', '24541', '(36.5854295,-79.4325614)', 'skyways@address.xz', 1, 434, 5555555, null, 9);
insert into account_profile (account_name, description, first_name, middle_name, last_name, country_name, street_number, street_name, floor_number, unit_number, city_name, county_name, region_name, state_name, postal_code, latlng, email_address, telephone_country_code, telephone_area_code, telephone_number, occupation_id, industry_id) values ('CloudBiz', 'Cloud hosting', null, null, null, 'United States of America', '1142', 'Front st', null, null, 'Uniondale', 'Nassau County', null, 'New York', '11553', '(40.710037,-73.588058)', 'CloudBiz@address.xz', 1, 516, 5555555, null, 10);

-- subaccount owners
insert into account_owner (owner_account, owned_subaccount) values ('JohnSmith', 'CPA');
insert into account_owner (owner_account, owned_subaccount) values ('IrisLynn', 'SunflowerFarms');
insert into account_owner (owner_account, owned_subaccount) values ('DanLee', 'GoldMiners');
insert into account_owner (owner_account, owned_subaccount) values ('AaronHill', 'EnergyCo');
insert into account_owner (owner_account, owned_subaccount) values ('SarahBell', 'USTreasury');
insert into account_owner (owner_account, owned_subaccount) values ('BenRoss', 'StateOfCalifornia');
insert into account_owner (owner_account, owned_subaccount) values ('JacobWebb', 'StateOfCalifornia');
insert into account_owner (owner_account, owned_subaccount) values ('MiriamLevy', 'StateOfCalifornia');
insert into account_owner (owner_account, owned_subaccount) values ('JacobWebb', 'TimeCo');
insert into account_owner (owner_account, owned_subaccount) values ('AzizKhan', 'TimeCo');
insert into account_owner (owner_account, owned_subaccount) values ('MiriamLevy', 'GroceryCo');
insert into account_owner (owner_account, owned_subaccount) values ('AzizKhan', 'Skyways');
insert into account_owner (owner_account, owned_subaccount) values ('IgorPetrov', 'GroceryCo');
insert into account_owner (owner_account, owned_subaccount) values ('IgorPetrov', 'CloudBiz');

-- account balances
insert into account_balance (account_name, current_balance) values ('JohnSmith', 1000);
insert into account_balance (account_name, current_balance) values ('IrisLynn', 1000);
insert into account_balance (account_name, current_balance) values ('DanLee', 1000);
insert into account_balance (account_name, current_balance) values ('AaronHill', 1000);
insert into account_balance (account_name, current_balance) values ('SarahBell', 1000);
insert into account_balance (account_name, current_balance) values ('BenRoss', 1000);
insert into account_balance (account_name, current_balance) values ('JacobWebb', 1000);
insert into account_balance (account_name, current_balance) values ('MiriamLevy', 1000);
insert into account_balance (account_name, current_balance) values ('AzizKhan', 1000);
insert into account_balance (account_name, current_balance) values ('IgorPetrov', 1000);
insert into account_balance (account_name, current_balance) values ('CPA', 1000);
insert into account_balance (account_name, current_balance) values ('SunflowerFarms', 1000);
insert into account_balance (account_name, current_balance) values ('GoldMiners', 1000);
insert into account_balance (account_name, current_balance) values ('EnergyCo', 1000);
insert into account_balance (account_name, current_balance) values ('USTreasury', 1000);
insert into account_balance (account_name, current_balance) values ('StateOfCalifornia', 1000);
insert into account_balance (account_name, current_balance) values ('TimeCo', 1000);
insert into account_balance (account_name, current_balance) values ('GroceryCo', 1000);
insert into account_balance (account_name, current_balance) values ('Skyways', 1000);
insert into account_balance (account_name, current_balance) values ('CloudBiz', 1000);