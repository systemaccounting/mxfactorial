SELECT cron.unschedule('EnergyCoDividend');

DELETE FROM approval WHERE transaction_item_id IN (
  SELECT id FROM transaction_item WHERE rule_instance_id IN (
    SELECT id FROM transaction_item_rule_instance WHERE transaction_rule_instance_id = (
      SELECT id FROM transaction_rule_instance WHERE rule_instance_name = 'EnergyCoDividend'
    )
  )
);

DELETE FROM transaction_item WHERE rule_instance_id IN (
  SELECT id FROM transaction_item_rule_instance WHERE transaction_rule_instance_id = (
    SELECT id FROM transaction_rule_instance WHERE rule_instance_name = 'EnergyCoDividend'
  )
);

DELETE FROM transaction WHERE id NOT IN (SELECT DISTINCT transaction_id FROM transaction_item);

DELETE FROM approval WHERE rule_instance_id IN (
  SELECT id FROM approval_rule_instance
  WHERE rule_instance_name IN ('ApproveEnergyDividendEnergyCo', 'ApproveEnergyDividendJoeCarter')
);

DELETE FROM approval_rule_instance WHERE rule_instance_name IN ('ApproveEnergyDividendEnergyCo', 'ApproveEnergyDividendJoeCarter');

DELETE FROM transaction_item_rule_instance
WHERE transaction_rule_instance_id = (
  SELECT id FROM transaction_rule_instance WHERE rule_instance_name = 'EnergyCoDividend'
);

DELETE FROM transaction_rule_instance WHERE rule_instance_name = 'EnergyCoDividend';
