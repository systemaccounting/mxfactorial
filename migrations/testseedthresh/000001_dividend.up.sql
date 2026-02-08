-- transaction_rule_instance: GroceryCo pays dividend to TimeCo when profit threshold reached
insert into transaction_rule_instance
  (rule_name, rule_instance_name, author, author_role, threshold)
values
  ('createTransaction', 'GroceryCoProfitDividend', 'GroceryCo', 'debitor', 1000.000);

-- transaction_item_rule_instance: linked dividend line item
-- multiplyItemValue computes: accumulated_profit * 0.01 = dividend amount
insert into transaction_item_rule_instance
  (rule_name, rule_instance_name, account_role, account_name,
   item_id, price, quantity, variable_values, transaction_rule_instance_id)
values
  ('multiplyItemValue', 'GroceryCoProfitDividend', 'debitor', 'GroceryCo',
   '1% dividend', 1.000, 1, '{ "GroceryCo", "TimeCo", "1% dividend", "0.01" }',
   (select id from transaction_rule_instance where rule_instance_name = 'GroceryCoProfitDividend'));

-- approval_rule_instance: auto-approve dividend for GroceryCo (debitor)
insert into approval_rule_instance
  (rule_name, rule_instance_name, account_role, account_name, variable_values)
values
  ('approveAnyCreditItem', 'ApproveDividendGroceryCo', 'debitor', 'GroceryCo',
   '{ "TimeCo", "debitor", "GroceryCo" }');

-- approval_rule_instance: auto-approve dividend for TimeCo (creditor)
insert into approval_rule_instance
  (rule_name, rule_instance_name, account_role, account_name, variable_values)
values
  ('approveAnyCreditItem', 'ApproveDividendTimeCo', 'creditor', 'TimeCo',
   '{ "TimeCo", "creditor", "TimeCo" }');
