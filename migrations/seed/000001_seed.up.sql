-- todo: import data from https://www.census.gov/naics/
-- data structure: https://drive.google.com/file/d/1d9ziVKtHWmMFbTJ86xwJkc5aiP4ZzGjx/view?usp=sharing
-- index data: https://drive.google.com/file/d/1WUqyC176gSAJAY_xnDjJ8lSZcTtwkRyi/view?usp=sharing
-- data source: https://www.census.gov/naics/?48967
insert into industry (sector, index, index_item_description) values (54, 541219, 'Accounting services (except CPAs)');
insert into industry (sector, index, index_item_description) values (11, 111120, 'Sunflower farming, field and seed production');
insert into industry (sector, index, index_item_description) values (21, 212221, 'Gold ore mining and/or beneficiating plants');
insert into industry (sector, index, index_item_description) values (22, 221118, 'Power generation, tidal electric');
insert into industry (sector, index, index_item_description) values (23, 236115, 'Residential construction, single-family, general contractors');
insert into industry (sector, index, index_item_description) values (31, 311230, 'Oats, breakfast cereal, manufacturing');
insert into industry (sector, index, index_item_description) values (42, 423940, 'Clocks merchant wholesalers');
insert into industry (sector, index, index_item_description) values (44, 445110, 'Grocery stores');
insert into industry (sector, index, index_item_description) values (48, 481111, 'Passenger carriers, air, scheduled');
insert into industry (sector, index, index_item_description) values (51, 518210, 'Application hosting');
insert into industry (sector, index, index_item_description) values (92, 921110, 'Executive offices, federal, state, and local (e.g., governor, mayor, president)');
insert into industry (sector, index, index_item_description) values (44, 444130, 'Hardware stores');
insert into industry (sector, index, index_item_description) values (45, 453210, 'Office supply stores');
insert into industry (sector, index, index_item_description) values (54, 541940, 'Veterinary services');
insert into industry (sector, index, index_item_description) values (56, 561431, 'Mailbox rental centers, private');
insert into industry (sector, index, index_item_description) values (61, 611310, 'Colleges, universities, and professional schools');
insert into industry (sector, index, index_item_description) values (62, 622110, 'General medical and surgical hospitals');
insert into industry (sector, index, index_item_description) values (62, 622110, 'Dentists'' offices (e.g., centers, clinics)');
insert into industry (sector, index, index_item_description) values (71, 713990, 'Golf driving ranges');
insert into industry (sector, index, index_item_description) values (72, 722511, 'Diners, full service');
insert into industry (sector, index, index_item_description) values (81, 811111, 'Automotive repair and replacement shops, general');

-- todo: import from https://www.bls.gov/soc/
-- example data: https://www.bls.gov/soc/2018/soc_structure_2018.pdf
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('13-0000', '13-2000', '13-2010', '13-2011', 'Accountants and Auditors');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('17-0000', '17-2000', '17-2020', '17-2021', 'Agricultural Engineers');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('17-0000', '17-2000', '17-2150', '17-2151', 'Mining and Geological Engineers, Including Mining Safety Engineers');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('17-0000', '17-2000', '17-2070', '17-2071', 'Electrical Engineers');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('17-0000', '17-3000', '17-3010', '17-3011', 'Architectural and Civil Drafters');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('19-0000', '19-1000', '19-1010', '19-1012', 'Food Scientists and Technologists');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('41-0000', '41-4000', '41-4010', '41-4011', 'Sales Representatives, Wholesale and Manufacturing, Technical and Scientific Products');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('41-0000', '41-2000', '41-2030', '41-2031', 'Retail Salespersons');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('53-0000', '53-2000', '53-2010', '53-2011', 'Airline Pilots, Copilots, and Flight Engineers');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('15-0000', '15-1200', '15-1240', '15-1242', 'Database Administrators');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('11-0000', '11-1000', '11-1010', '11-1011', 'Chief Executives');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('11-0000', '11-1000', '11-1020', '11-1021', 'General and Operations Managers');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('29-0000', '29-1000', '29-1020', '29-1021', 'Dentists, General');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('29-0000', '29-1000', '29-1210', '29-1216', 'General Internal Medicine Physicians');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('35-0000', '35-2000', '35-2010', '35-2014', 'Cooks, Restaurant');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('39-0000', '39-5000', '39-5010', '39-5012', 'Hairdressers, Hairstylists, and Cosmetologists');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('47-0000', '47-2000', '47-2180', '47-2181', 'Roofers');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('51-0000', '51-4000', '51-4040', '51-4041', 'Machinists');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('51-0000', '51-7000', '51-7090', '51-7099', 'Woodworkers, All Other');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('53-0000', '53-2000', '53-2020', '53-2021', 'Air Traffic Controllers');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('53-0000', '53-7000', '53-7020', '53-7021', 'Crane and Tower Operators');
insert into occupation (major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('53-0000', '53-7000', '53-7050', '53-7051', 'Industrial Truck and Tractor Operators');

-- rule
insert into rule (name, variable_names) values ('approveCreditItems', '{ "CREDITOR" }');
insert into rule (name, variable_names) values ('multiplyItemValue', '{ "DEBITOR", "CREDITOR", "ITEM_NAME", "FACTOR" }');
insert into rule (name, variable_names) values ('approveItem', '{ "ACCOUNT" }');
insert into rule (name, variable_names) values ('approveItemOnAccount', '{ "DEBITOR", "CREDITOR", "APPROVER_ROLE", "APPROVER_NAME" }');
insert into rule (name, variable_names) values ('approveAnyCreditItem', '{ "CREDITOR", "APPROVER_ROLE", "APPROVER_NAME" }');

-- geocode data matching account_profile table addresses
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(37.318830, -120.486230)', NULL, NULL, 'Merced', 'California', 'Merced County', '95348', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(37.651930, -97.352190)', NULL, NULL, 'Wichita', 'Kansas', 'Sedgwick County', '67213', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(46.355720, -94.784420)', NULL, NULL, 'Staples', 'Minnesota', 'Todd County', '56479', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(45.769540, -108.575760)', NULL, NULL, 'Billings', 'Montana', 'Yellowstone County', '59102', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(44.261730, -114.419700)', NULL, NULL, 'Clayton', 'Idaho', 'Custer County', '83227', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(44.0341831,-123.0420753)', NULL, NULL, 'Eugene', 'Oregon', 'Lane County', '97403', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(39.534552,-119.737825)', NULL, NULL, 'Sparks', 'Nevada', 'Washoe County', '89431', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(30.2140419,-97.8297857)', NULL, NULL, 'Austin', 'Texas', 'Travis County', '78745', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(36.5898155,-79.3844719)', NULL, NULL, 'Danville', 'Virginia', 'Travis County', '24540', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(40.713235,-73.606191)', NULL, NULL, 'Uniondale', 'New York', 'Nassau County', '11553', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(33.958050,-118.418388)', NULL, NULL, 'Los Angeles', 'California', 'Los Angeles County', '90045', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(40.5665693,-105.0987584)', NULL, NULL, 'Fort Collins', 'Colorado', 'Larimer County', '80526', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(41.259037,-96.0333529)', NULL, NULL, 'Omaha', 'Nebraska', 'Douglas County', '68114', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(30.7534518,-99.2417345)', NULL, NULL, 'Mason', 'Texas', 'Mason County', '76856', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(40.5888447,-83.1153544)', NULL, NULL, 'Marion', 'Ohio', 'Marion County', '43302', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(42.996485,-83.7263857)', NULL, NULL, 'Flint', 'Michigan', 'Genesee County', '48503', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(37.3035838,-121.9117206)', NULL, NULL, 'San Jose', 'California', 'Santa Clara County', '95125', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(40.7489003,-115.5972645)', NULL, NULL, 'Spring Creek', 'Nevada', 'Elko County', '89815', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(38.9790075,-88.1620495)', NULL, NULL, 'Newton', 'Illinois', 'Jasper County', '62448', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(42.2542218,-73.7684987)', NULL, NULL, 'Hudson', 'New York', 'Columbia County', '12534', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(26.1803841,-81.8128825)', NULL, NULL, 'Naples', 'Florida', 'Collier County', '34103', 'United States of America');

-- geocode data matching sub account_profile table addresses
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(37.3058494,-120.4930238)', NULL, NULL, 'Merced', 'California', 'Merced County', '95340', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(37.666594,-97.3711619)', NULL, NULL, 'Wichita', 'Kansas', 'Sedgwick County', '67213', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(46.3527661,-94.7922353)', NULL, NULL, 'Staples', 'Minnesota', 'Todd County', '56479', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(45.7951193,-108.5823638)', NULL, NULL, 'Billings', 'Montana', 'Yellowstone County', '59102', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(38.89879608154297,-77.03437042236328)', NULL, NULL, 'District of Columbia', 'Washington, D.C.', 'Washington, D.C.', '20220', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(38.5777292,-121.5027026)', NULL, NULL, 'Sacramento', 'California', 'Sacramento County', '95814', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(39.5284539,-119.7010352)', NULL, NULL, 'Sparks', 'Nevada', 'Washoe County', '89434', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(33.9817585,-117.3774828)', NULL, NULL, 'Riverside', 'California', 'Riverside County', '92501', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(36.5854295,-79.4325614)', NULL, NULL, 'Danville', 'Virginia', 'Travis County', '24541', 'United States of America');
INSERT INTO geocode (latlng, label, street, municipality, region, sub_region, postal_code, country) VALUES ('(40.710037,-73.588058)', NULL, NULL, 'Uniondale', 'New York', 'Nassau County', '11553', 'United States of America');

-- add redis_name abbreviations for geocode data
INSERT INTO redis_name (key, value) VALUES ('United States of America', 'usa');
INSERT INTO redis_name (key, value) VALUES ('California', 'cal');
INSERT INTO redis_name (key, value) VALUES ('Riverside', 'rivs');
INSERT INTO redis_name (key, value) VALUES ('Sacramento', 'sac');
INSERT INTO redis_name (key, value) VALUES ('Los Angeles', 'losa');