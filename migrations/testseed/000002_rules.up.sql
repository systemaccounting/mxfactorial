-- transaction_item NinePercentSalesTax rule_instance
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, state_name, variable_values) values ('transaction_item', 'multiplyItemValue', 'NinePercentSalesTax', 'creditor', 'California', '{ "ANY", "StateOfCalifornia", "9% state sales tax", "0.09" }');

-- GroceryCo ApproveDebitStateOfCalifornia rule_instance
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approval', 'approveItemOnAccount', 'ApproveDebitStateOfCalifornia', 'debitor', 'IgorPetrov', '{ "GroceryCo", "StateOfCalifornia", "debitor", "IgorPetrov" }');
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approval', 'approveItemOnAccount', 'ApproveDebitStateOfCalifornia', 'debitor', 'MiriamLevy', '{ "GroceryCo", "StateOfCalifornia", "debitor", "MiriamLevy" }');

-- StateOfCalifornia ApproveAllCaliforniaCredit rule_instance
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approval', 'approveAnyCreditItem', 'ApproveAllCaliforniaCredit', 'creditor', 'BenRoss', '{ "StateOfCalifornia", "creditor", "BenRoss" }');
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approval', 'approveAnyCreditItem', 'ApproveAllCaliforniaCredit', 'creditor', 'JacobWebb', '{ "StateOfCalifornia", "creditor", "JacobWebb" }');
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approval', 'approveAnyCreditItem', 'ApproveAllCaliforniaCredit', 'creditor', 'MiriamLevy', '{ "StateOfCalifornia", "creditor", "MiriamLevy" }');

-- GroceryCo ApproveAllGroceryCoCredit rule_instance
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approval', 'approveAnyCreditItem', 'ApproveAllGroceryCoCredit', 'creditor', 'MiriamLevy', '{ "GroceryCo", "creditor", "MiriamLevy" }');
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approval', 'approveAnyCreditItem', 'ApproveAllGroceryCoCredit', 'creditor', 'IgorPetrov', '{ "GroceryCo", "creditor", "IgorPetrov" }');

-- GroceryStore ApproveAllGroceryCoCredit rule_instance
insert into rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) values ('approval', 'approveAnyCreditItem', 'ApproveAllGroceryStoreCredit', 'creditor', 'GroceryStore', '{ "GroceryStore", "creditor", "GroceryStore" }');