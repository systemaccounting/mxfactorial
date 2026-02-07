delete from approval_rule_instance where rule_instance_name in ('ApproveDividendGroceryCo', 'ApproveDividendTimeCo');
delete from transaction_item_rule_instance where rule_instance_name = 'GroceryCoProfitDividend';
delete from transaction_rule_instance where rule_instance_name = 'GroceryCoProfitDividend';
