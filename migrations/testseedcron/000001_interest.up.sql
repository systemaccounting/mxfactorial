-- cron debt: EnergyCo pays interest to JoeCarter every 10 seconds
--
-- same debitor, creditor and amount as cron equity (000002_dividend)
-- modigliani-miller: "debt" and "equity" are just rule instance names
-- when the underlying value transfer is identical

insert into transaction_rule_instance
  (rule_name, rule_instance_name, author, author_role, cron)
values
  ('createTransaction', 'EnergyCoInterest', 'EnergyCo', 'debitor', '10 seconds');

-- transaction_item_rule_instance: linked line item
insert into transaction_item_rule_instance
  (rule_name, rule_instance_name, account_role, account_name,
   item_id, price, quantity, variable_values, transaction_rule_instance_id)
values
  ('addTransactionItem', 'EnergyCoInterest', 'debitor', 'EnergyCo',
   '1,000 x 1% monthly interest', 10.000, 1, '{ "EnergyCo", "JoeCarter" }',
   (select id from transaction_rule_instance where rule_instance_name = 'EnergyCoInterest'));

-- approval_rule_instance: AaronHill approves EnergyCo debits (EnergyCo owner)
insert into approval_rule_instance
  (rule_name, rule_instance_name, account_role, account_name, variable_values)
values
  ('approveItemBetweenAccounts', 'ApproveInterestEnergyCo', 'debitor', 'AaronHill',
   '{ "EnergyCo", "JoeCarter", "1,000 x 1% monthly interest", "debitor", "AaronHill" }');

-- approval_rule_instance: JoeCarter approves credits (self-owner)
insert into approval_rule_instance
  (rule_name, rule_instance_name, account_role, account_name, variable_values)
values
  ('approveItemBetweenAccounts', 'ApproveInterestJoeCarter', 'creditor', 'JoeCarter',
   '{ "EnergyCo", "JoeCarter", "1,000 x 1% monthly interest", "creditor", "JoeCarter" }');

-- schedule pg_cron job and store jobid
UPDATE transaction_rule_instance
SET cron_job_id = cron.schedule(
  'EnergyCoInterest',
  '10 seconds',
  $$SELECT notify_cron(
    (SELECT id FROM transaction_rule_instance WHERE rule_instance_name = 'EnergyCoInterest')
  )$$
)
WHERE rule_instance_name = 'EnergyCoInterest';
