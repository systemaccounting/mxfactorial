-- transaction_item NinePercentSalesTax rule_instance
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('transaction_item', 'multiplyItemValue', 'NinePercentSalesTax', 'creditor', 'GroceryCo', '{ "GroceryCo", "StateOfCalifornia", "9% state sales tax", "0.09" }');

-- GroceryCo ApproveDebitStateOfCalifornia rule_instance
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approver', 'approveItemOnAccount', 'ApproveDebitStateOfCalifornia', 'debitor', 'IgorPetrov', '{ "GroceryCo", "StateOfCalifornia", "debitor", "IgorPetrov" }');
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approver', 'approveItemOnAccount', 'ApproveDebitStateOfCalifornia', 'debitor', 'MiriamLevy', '{ "GroceryCo", "StateOfCalifornia", "debitor", "MiriamLevy" }');

-- StateOfCalifornia ApproveAllCaliforniaCredit rule_instance
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approver', 'approveAnyCreditItem', 'ApproveAllCaliforniaCredit', 'creditor', 'BenRoss', '{ "StateOfCalifornia", "creditor", "BenRoss" }');
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approver', 'approveAnyCreditItem', 'ApproveAllCaliforniaCredit', 'creditor', 'JacobWebb', '{ "StateOfCalifornia", "creditor", "JacobWebb" }');
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approver', 'approveAnyCreditItem', 'ApproveAllCaliforniaCredit', 'creditor', 'MiriamLevy', '{ "StateOfCalifornia", "creditor", "MiriamLevy" }');

-- GroceryCo ApproveAllGroceryCoCredit rule_instance
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approver', 'approveAnyCreditItem', 'ApproveAllGroceryCoCredit', 'creditor', 'MiriamLevy', '{ "GroceryCo", "creditor", "MiriamLevy" }');
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approver', 'approveAnyCreditItem', 'ApproveAllGroceryCoCredit', 'creditor', 'IgorPetrov', '{ "GroceryCo", "creditor", "IgorPetrov" }');