-- transaction_rule_instance: GroceryCo pays dividend to JoeCarter when profit threshold reached
insert into transaction_rule_instance
  (rule_name, rule_instance_name, author, author_role, threshold)
values
  ('createTransaction', 'GroceryCoProfitDividend', 'GroceryCo', 'debitor', 1000.000);

-- transaction_item_rule_instance: linked dividend line item
insert into transaction_item_rule_instance
  (rule_name, rule_instance_name, account_role, account_name,
   item_id, price, quantity, variable_values, transaction_rule_instance_id)
values
  ('addTransactionItem', 'GroceryCoProfitDividend', 'debitor', 'GroceryCo',
   '1% dividend', 10.000, 1, '{ "GroceryCo", "JoeCarter" }',
   (select id from transaction_rule_instance where rule_instance_name = 'GroceryCoProfitDividend'));

-- approval_rule_instance: IgorPetrov approves GroceryCo → JoeCarter debits
insert into approval_rule_instance
  (rule_name, rule_instance_name, account_role, account_name, variable_values)
values
  ('approveItemBetweenAccounts', 'ApproveDividendGroceryCo', 'debitor', 'IgorPetrov',
   '{ "GroceryCo", "JoeCarter", "1% dividend", "debitor", "IgorPetrov" }');

-- approval_rule_instance: MiriamLevy approves GroceryCo → JoeCarter debits
insert into approval_rule_instance
  (rule_name, rule_instance_name, account_role, account_name, variable_values)
values
  ('approveItemBetweenAccounts', 'ApproveDividendGroceryCo', 'debitor', 'MiriamLevy',
   '{ "GroceryCo", "JoeCarter", "1% dividend", "debitor", "MiriamLevy" }');

-- approval_rule_instance: JoeCarter approves GroceryCo → JoeCarter credits
insert into approval_rule_instance
  (rule_name, rule_instance_name, account_role, account_name, variable_values)
values
  ('approveItemBetweenAccounts', 'ApproveDividendJoeCarter', 'creditor', 'JoeCarter',
   '{ "GroceryCo", "JoeCarter", "1% dividend", "creditor", "JoeCarter" }');
