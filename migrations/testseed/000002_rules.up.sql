-- transaction_item_rule_instance: NinePercentSalesTax
insert into transaction_item_rule_instance
  (rule_name, rule_instance_name, account_role, state_name, variable_values)
values
  ('multiplyItemValue', 'NinePercentSalesTax', 'creditor', 'California', '{ "ANY", "StateOfCalifornia", "9% state sales tax", "0.09" }');

-- approval_rule_instance: GroceryCo ApproveDebitStateOfCalifornia
insert into approval_rule_instance
  (rule_name, rule_instance_name, account_role, account_name, variable_values)
values
  ('approveItemOnAccount', 'ApproveDebitStateOfCalifornia', 'debitor', 'IgorPetrov', '{ "GroceryCo", "StateOfCalifornia", "debitor", "IgorPetrov" }'),
  ('approveItemOnAccount', 'ApproveDebitStateOfCalifornia', 'debitor', 'MiriamLevy', '{ "GroceryCo", "StateOfCalifornia", "debitor", "MiriamLevy" }');

-- approval_rule_instance: StateOfCalifornia ApproveAllCaliforniaCredit
insert into approval_rule_instance
  (rule_name, rule_instance_name, account_role, account_name, variable_values)
values
  ('approveAnyCreditItem', 'ApproveAllCaliforniaCredit', 'creditor', 'BenRoss', '{ "StateOfCalifornia", "creditor", "BenRoss" }'),
  ('approveAnyCreditItem', 'ApproveAllCaliforniaCredit', 'creditor', 'DanLee', '{ "StateOfCalifornia", "creditor", "DanLee" }'),
  ('approveAnyCreditItem', 'ApproveAllCaliforniaCredit', 'creditor', 'MiriamLevy', '{ "StateOfCalifornia", "creditor", "MiriamLevy" }');

-- approval_rule_instance: GroceryCo ApproveAllGroceryCoCredit
insert into approval_rule_instance
  (rule_name, rule_instance_name, account_role, account_name, variable_values)
values
  ('approveAnyCreditItem', 'ApproveAllGroceryCoCredit', 'creditor', 'MiriamLevy', '{ "GroceryCo", "creditor", "MiriamLevy" }'),
  ('approveAnyCreditItem', 'ApproveAllGroceryCoCredit', 'creditor', 'IgorPetrov', '{ "GroceryCo", "creditor", "IgorPetrov" }');
