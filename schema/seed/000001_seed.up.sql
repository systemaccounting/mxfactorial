-- todo: import data from https://www.census.gov/naics/
-- data structure: https://drive.google.com/file/d/1d9ziVKtHWmMFbTJ86xwJkc5aiP4ZzGjx/view?usp=sharing
-- index data: https://drive.google.com/file/d/1WUqyC176gSAJAY_xnDjJ8lSZcTtwkRyi/view?usp=sharing
-- data source: https://www.census.gov/naics/?48967
insert into industry(sector, index, index_item_description) values (54, 541219, 'Accounting services (except CPAs)');
insert into industry(sector, index, index_item_description) values (11, 111120, 'Sunflower farming, field and seed production');
insert into industry(sector, index, index_item_description) values (21, 212221, 'Gold ore mining and/or beneficiating plants');
insert into industry(sector, index, index_item_description) values (22, 221118, 'Power generation, tidal electric');
insert into industry(sector, index, index_item_description) values (23, 236115, 'Residential construction, single-family, general contractors');
insert into industry(sector, index, index_item_description) values (31, 311230, 'Oats, breakfast cereal, manufacturing');
insert into industry(sector, index, index_item_description) values (42, 423940, 'Clocks merchant wholesalers');
insert into industry(sector, index, index_item_description) values (44, 445110, 'Grocery stores');
insert into industry(sector, index, index_item_description) values (48, 481111, 'Passenger carriers, air, scheduled');
insert into industry(sector, index, index_item_description) values (51, 518210, 'Application hosting');

-- todo: import from https://www.bls.gov/soc/
-- example data: https://www.bls.gov/soc/2018/soc_structure_2018.pdf
insert into occupation(major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('13-0000', '13-2000', '13-2010', '13-2011', 'Accountants and Auditors');
insert into occupation(major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('17-0000', '17-2000', '17-2020', '17-2021', 'Agricultural Engineers');
insert into occupation(major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('17-0000', '17-2000', '17-2150', '17-2151', 'Mining and Geological Engineers, Including Mining Safety Engineers');
insert into occupation(major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('17-0000', '17-2000', '17-2070', '17-2071', 'Electrical Engineers');
insert into occupation(major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('17-0000', '17-3000', '17-3010', '17-3011', 'Architectural and Civil Drafters');
insert into occupation(major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('19-0000', '19-1000', '19-1010', '19-1012', 'Food Scientists and Technologists');
insert into occupation(major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('41-0000', '41-4000', '41-4010', '41-4011', 'Sales Representatives, Wholesale and Manufacturing, Technical and Scientific Products');
insert into occupation(major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('41-0000', '41-2000', '41-2030', '41-2031', 'Retail Salespersons');
insert into occupation(major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('53-0000', '53-2000', '53-2010', '53-2011', 'Airline Pilots, Copilots, and Flight Engineers');
insert into occupation(major_group, minor_group, broad_group, detailed_occupation, occupation_text) values ('15-0000', '15-1200', '15-1240', '15-1242', 'Database Administrators');