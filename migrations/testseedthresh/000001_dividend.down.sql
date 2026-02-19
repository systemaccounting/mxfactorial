delete from approval where transaction_item_id in (select ti.id from transaction_item ti where ti.rule_instance_id in (select id from transaction_item_rule_instance where rule_instance_name = 'GroceryCoProfitDividend'));
delete from transaction_item where rule_instance_id in (select id from transaction_item_rule_instance where rule_instance_name = 'GroceryCoProfitDividend');
delete from transaction where id not in (select distinct transaction_id from transaction_item);
delete from approval_rule_instance where rule_instance_name in ('ApproveDividendGroceryCo', 'ApproveDividendTimeCo');
delete from transaction_item_rule_instance where rule_instance_name = 'GroceryCoProfitDividend';
delete from transaction_rule_instance where rule_instance_name = 'GroceryCoProfitDividend';
