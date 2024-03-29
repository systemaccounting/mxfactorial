-- scenario: GroceryCo waiting on approval from JacobWebb on extemporaneous and rule generated items
with insert_transaction as (
	insert into transaction (author, author_role, sum_value) values ('GroceryCo', 'creditor', 9.81) returning id
),
item_tax_rule_instance as (
	SELECT id FROM rule_instance WHERE rule_instance_name='NinePercentSalesTax' AND state_name = 'California'
),
milk as (
	insert into transaction_item (transaction_id, rule_instance_id, item_id, price, quantity, debitor, creditor, debitor_profile_id, creditor_profile_id, debitor_approval_time, creditor_approval_time, rule_exec_ids) values ((select id from insert_transaction), null, 'milk', 2.000, 1, 'JacobWebb', 'GroceryCo', (select id from account_profile where account_name = 'JacobWebb'), (select id from account_profile where account_name = 'GroceryCo'), null, NOW(), '{"4pF89U71"}') returning id
),
tax_milk as (
	insert into transaction_item (transaction_id, rule_instance_id, item_id, price, quantity, debitor, creditor, debitor_profile_id, creditor_profile_id, debitor_approval_time, creditor_approval_time, rule_exec_ids) values ((select id from insert_transaction), (select id from item_tax_rule_instance), '9% state sales tax', 0.180, 1, 'JacobWebb', 'StateOfCalifornia', (select id from account_profile where account_name = 'JacobWebb'), (select id from account_profile where account_name = 'StateOfCalifornia'), null, NOW(), '{"4pF89U71"}') returning id
),
bread as (
	insert into transaction_item (transaction_id, rule_instance_id, item_id, price, quantity, debitor, creditor, debitor_profile_id, creditor_profile_id, debitor_approval_time, creditor_approval_time, rule_exec_ids) values ((select id from insert_transaction), null, 'bread', 2.000, 2, 'JacobWebb', 'GroceryCo', (select id from account_profile where account_name = 'JacobWebb'), (select id from account_profile where account_name = 'GroceryCo'), null, NOW(), '{"4pF89U72"}') returning id
),
tax_bread as (
	insert into transaction_item (transaction_id, rule_instance_id, item_id, price, quantity, debitor, creditor, debitor_profile_id, creditor_profile_id, debitor_approval_time, creditor_approval_time, rule_exec_ids) values ((select id from insert_transaction), (select id from item_tax_rule_instance), '9% state sales tax', 0.180, 2, 'JacobWebb', 'StateOfCalifornia', (select id from account_profile where account_name = 'JacobWebb'), (select id from account_profile where account_name = 'StateOfCalifornia'), null, NOW(), '{"4pF89U72"}') returning id
),
eggs as (
	insert into transaction_item (transaction_id, rule_instance_id, item_id, price, quantity, debitor, creditor, debitor_profile_id, creditor_profile_id, debitor_approval_time, creditor_approval_time, rule_exec_ids) values ((select id from insert_transaction), null, 'eggs', 3.000, 1, 'JacobWebb', 'GroceryCo', (select id from account_profile where account_name = 'JacobWebb'), (select id from account_profile where account_name = 'GroceryCo'), null, NOW(), '{"4pF89U73"}') returning id
),
tax_eggs as (
	insert into transaction_item (transaction_id, rule_instance_id, item_id, price, quantity, debitor, creditor, debitor_profile_id, creditor_profile_id, debitor_approval_time, creditor_approval_time, rule_exec_ids) values ((select id from insert_transaction), (select id from item_tax_rule_instance), '9% state sales tax', 0.270, 1, 'JacobWebb', 'StateOfCalifornia', (select id from account_profile where account_name = 'JacobWebb'), (select id from account_profile where account_name = 'StateOfCalifornia'), null, NOW(), '{"4pF89U73"}') returning id
),
appr_igor_debitor_rule_instance as (
	SELECT * FROM rule_instance WHERE rule_instance_name='ApproveDebitStateOfCalifornia' AND account_name = 'IgorPetrov'
),
appr_miriam_debitor_rule_instance as (
	SELECT * FROM rule_instance WHERE rule_instance_name='ApproveDebitStateOfCalifornia' AND account_name = 'MiriamLevy'
),
appr_ben_creditor_rule_instance as (
	SELECT * FROM rule_instance WHERE rule_instance_name='ApproveAllCaliforniaCredit' AND account_name = 'BenRoss'
),
appr_jacob_creditor_rule_instance as (
	SELECT * FROM rule_instance WHERE rule_instance_name='ApproveAllCaliforniaCredit' AND account_name = 'DanLee'
),
appr_miriam_creditor_rule_instance as (
	SELECT * FROM rule_instance WHERE rule_instance_name='ApproveAllCaliforniaCredit' AND account_name = 'MiriamLevy'
)
insert into approval (rule_instance_id, transaction_id, transaction_item_id, account_name, account_role, approval_time) values (
	(select id from appr_igor_debitor_rule_instance), (select id from insert_transaction), (select id from milk), (select account_name from appr_igor_debitor_rule_instance), (select account_role from appr_igor_debitor_rule_instance), NOW()
	),(
	(select id from appr_miriam_debitor_rule_instance), (select id from insert_transaction), (select id from milk), (select account_name from appr_miriam_debitor_rule_instance), (select account_role from appr_miriam_debitor_rule_instance), NOW()
	),(
	(select id from appr_ben_creditor_rule_instance), (select id from insert_transaction), (select id from milk), (select account_name from appr_ben_creditor_rule_instance), (select account_role from appr_ben_creditor_rule_instance), NOW()
	),(
	(select id from appr_jacob_creditor_rule_instance), (select id from insert_transaction), (select id from milk), (select account_name from appr_jacob_creditor_rule_instance), (select account_role from appr_jacob_creditor_rule_instance), NOW()
	),(
	(select id from appr_miriam_creditor_rule_instance), (select id from insert_transaction), (select id from milk), (select account_name from appr_miriam_creditor_rule_instance), (select account_role from appr_miriam_creditor_rule_instance), NOW()
	),(
	(select id from appr_igor_debitor_rule_instance), (select id from insert_transaction), (select id from tax_milk), (select account_name from appr_igor_debitor_rule_instance), (select account_role from appr_igor_debitor_rule_instance), NOW()
	),(
	(select id from appr_miriam_debitor_rule_instance), (select id from insert_transaction), (select id from tax_milk), (select account_name from appr_miriam_debitor_rule_instance), (select account_role from appr_miriam_debitor_rule_instance), NOW()
	),(
	(select id from appr_ben_creditor_rule_instance), (select id from insert_transaction), (select id from tax_milk), (select account_name from appr_ben_creditor_rule_instance), (select account_role from appr_ben_creditor_rule_instance), NOW()
	),(
	(select id from appr_jacob_creditor_rule_instance), (select id from insert_transaction), (select id from tax_milk), (select account_name from appr_jacob_creditor_rule_instance), (select account_role from appr_jacob_creditor_rule_instance), NOW()
	),(
	(select id from appr_miriam_creditor_rule_instance), (select id from insert_transaction), (select id from tax_milk), (select account_name from appr_miriam_creditor_rule_instance), (select account_role from appr_miriam_creditor_rule_instance), NOW()
	),(
	(select id from appr_igor_debitor_rule_instance), (select id from insert_transaction), (select id from bread), (select account_name from appr_igor_debitor_rule_instance), (select account_role from appr_igor_debitor_rule_instance), NOW()
	),(
	(select id from appr_miriam_debitor_rule_instance), (select id from insert_transaction), (select id from bread), (select account_name from appr_miriam_debitor_rule_instance), (select account_role from appr_miriam_debitor_rule_instance), NOW()
	),(
	(select id from appr_ben_creditor_rule_instance), (select id from insert_transaction), (select id from bread), (select account_name from appr_ben_creditor_rule_instance), (select account_role from appr_ben_creditor_rule_instance), NOW()
	),(
	(select id from appr_jacob_creditor_rule_instance), (select id from insert_transaction), (select id from bread), (select account_name from appr_jacob_creditor_rule_instance), (select account_role from appr_jacob_creditor_rule_instance), NOW()
	),(
	(select id from appr_miriam_creditor_rule_instance), (select id from insert_transaction), (select id from bread), (select account_name from appr_miriam_creditor_rule_instance), (select account_role from appr_miriam_creditor_rule_instance), NOW()
	),(
	(select id from appr_igor_debitor_rule_instance), (select id from insert_transaction), (select id from tax_bread), (select account_name from appr_igor_debitor_rule_instance), (select account_role from appr_igor_debitor_rule_instance), NOW()
	),(
	(select id from appr_miriam_debitor_rule_instance), (select id from insert_transaction), (select id from tax_bread), (select account_name from appr_miriam_debitor_rule_instance), (select account_role from appr_miriam_debitor_rule_instance), NOW()
	),(
	(select id from appr_ben_creditor_rule_instance), (select id from insert_transaction), (select id from tax_bread), (select account_name from appr_ben_creditor_rule_instance), (select account_role from appr_ben_creditor_rule_instance), NOW()
	),(
	(select id from appr_jacob_creditor_rule_instance), (select id from insert_transaction), (select id from tax_bread), (select account_name from appr_jacob_creditor_rule_instance), (select account_role from appr_jacob_creditor_rule_instance), NOW()
	),(
	(select id from appr_miriam_creditor_rule_instance), (select id from insert_transaction), (select id from tax_bread), (select account_name from appr_miriam_creditor_rule_instance), (select account_role from appr_miriam_creditor_rule_instance), NOW()
	),(
	(select id from appr_igor_debitor_rule_instance), (select id from insert_transaction), (select id from eggs), (select account_name from appr_igor_debitor_rule_instance), (select account_role from appr_igor_debitor_rule_instance), NOW()
	),(
	(select id from appr_miriam_debitor_rule_instance), (select id from insert_transaction), (select id from eggs), (select account_name from appr_miriam_debitor_rule_instance), (select account_role from appr_miriam_debitor_rule_instance), NOW()
	),(
	(select id from appr_ben_creditor_rule_instance), (select id from insert_transaction), (select id from eggs), (select account_name from appr_ben_creditor_rule_instance), (select account_role from appr_ben_creditor_rule_instance), NOW()
	),(
	(select id from appr_jacob_creditor_rule_instance), (select id from insert_transaction), (select id from eggs), (select account_name from appr_jacob_creditor_rule_instance), (select account_role from appr_jacob_creditor_rule_instance), NOW()
	),(
	(select id from appr_miriam_creditor_rule_instance), (select id from insert_transaction), (select id from eggs), (select account_name from appr_miriam_creditor_rule_instance), (select account_role from appr_miriam_creditor_rule_instance), NOW()
	),(
	(select id from appr_igor_debitor_rule_instance), (select id from insert_transaction), (select id from tax_eggs), (select account_name from appr_igor_debitor_rule_instance), (select account_role from appr_igor_debitor_rule_instance), NOW()
	),(
	(select id from appr_miriam_debitor_rule_instance), (select id from insert_transaction), (select id from tax_eggs), (select account_name from appr_miriam_debitor_rule_instance), (select account_role from appr_miriam_debitor_rule_instance), NOW()
	),(
	(select id from appr_ben_creditor_rule_instance), (select id from insert_transaction), (select id from tax_eggs), (select account_name from appr_ben_creditor_rule_instance), (select account_role from appr_ben_creditor_rule_instance), NOW()
	),(
	(select id from appr_jacob_creditor_rule_instance), (select id from insert_transaction), (select id from tax_eggs), (select account_name from appr_jacob_creditor_rule_instance), (select account_role from appr_jacob_creditor_rule_instance), NOW()
	),(
	(select id from appr_miriam_creditor_rule_instance), (select id from insert_transaction), (select id from tax_eggs), (select account_name from appr_miriam_creditor_rule_instance), (select account_role from appr_miriam_creditor_rule_instance), NOW()
	),(
	null, (select id from insert_transaction), (select id from milk), 'JacobWebb', 'debitor', null
	),(
	null, (select id from insert_transaction), (select id from bread), 'JacobWebb', 'debitor', null
	),(
	null, (select id from insert_transaction), (select id from eggs), 'JacobWebb', 'debitor', null);