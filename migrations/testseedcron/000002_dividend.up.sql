-- cron equity: EnergyCo pays dividend to JoeCarter every 10 seconds
--
-- same debitor, creditor and amount as cron debt (000001_interest)
-- modigliani-miller: "debt" and "equity" are just rule instance names
-- when the underlying value transfer is identical

insert into transaction_rule_instance
  (rule_name, rule_instance_name, author, author_role, cron)
values
  ('createTransaction', 'EnergyCoDividend', 'EnergyCo', 'debitor', '10 seconds');

-- transaction_item_rule_instance: linked line item
insert into transaction_item_rule_instance
  (rule_name, rule_instance_name, account_role, account_name,
   item_id, price, quantity, variable_values, transaction_rule_instance_id)
values
  ('addTransactionItem', 'EnergyCoDividend', 'debitor', 'EnergyCo',
   'monthly 10.000 dividend', 10.000, 1, '{ "EnergyCo", "JoeCarter" }',
   (select id from transaction_rule_instance where rule_instance_name = 'EnergyCoDividend'));

-- approval_rule_instance: AaronHill approves EnergyCo debits (EnergyCo owner)
insert into approval_rule_instance
  (rule_name, rule_instance_name, account_role, account_name, variable_values)
values
  ('approveItemBetweenAccounts', 'ApproveEnergyDividendEnergyCo', 'debitor', 'AaronHill',
   '{ "EnergyCo", "JoeCarter", "monthly 10.000 dividend", "debitor", "AaronHill" }');

-- approval_rule_instance: JoeCarter approves credits (self-owner)
insert into approval_rule_instance
  (rule_name, rule_instance_name, account_role, account_name, variable_values)
values
  ('approveItemBetweenAccounts', 'ApproveEnergyDividendJoeCarter', 'creditor', 'JoeCarter',
   '{ "EnergyCo", "JoeCarter", "monthly 10.000 dividend", "creditor", "JoeCarter" }');

-- schedule pg_cron job and store jobid
UPDATE transaction_rule_instance
SET cron_job_id = cron.schedule(
  'EnergyCoDividend',
  '10 seconds',
  $$SELECT notify_cron(
    (SELECT id FROM transaction_rule_instance WHERE rule_instance_name = 'EnergyCoDividend')
  )$$
)
WHERE rule_instance_name = 'EnergyCoDividend';
