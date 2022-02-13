-- scenario: transaction finished between JohnSmith and GroceryCo
with insert_transaction as (
	insert into transaction (author, author_role) values ('GroceryCo', 'creditor') returning id
),
item_tax_rule_instance as (
	SELECT id FROM rule_instance WHERE rule_instance_name='NinePercentSalesTax' AND state_name = 'California'
),
butter as (
	insert into transaction_item (transaction_id, rule_instance_id, item_id, price, quantity, debitor, creditor, debitor_approval_time, creditor_approval_time) values ((select id from insert_transaction), null, 'butter', 2.000, 1, 'JohnSmith', 'GroceryCo', NOW(), NOW()) returning id
),
tax_butter as (
	insert into transaction_item (transaction_id, rule_instance_id, item_id, price, quantity, debitor, creditor, debitor_approval_time, creditor_approval_time) values ((select id from insert_transaction), (select id from item_tax_rule_instance), '9% state sales tax', 0.180, 1, 'JohnSmith', 'StateOfCalifornia', NOW(), NOW()) returning id
),
grapes as (
	insert into transaction_item (transaction_id, rule_instance_id, item_id, price, quantity, debitor, creditor, debitor_approval_time, creditor_approval_time) values ((select id from insert_transaction), null, 'grapes', 2.000, 2, 'JohnSmith', 'GroceryCo', NOW(), NOW()) returning id
),
tax_grapes as (
	insert into transaction_item (transaction_id, rule_instance_id, item_id, price, quantity, debitor, creditor, debitor_approval_time, creditor_approval_time) values ((select id from insert_transaction), (select id from item_tax_rule_instance), '9% state sales tax', 0.180, 2, 'JohnSmith', 'StateOfCalifornia', NOW(), NOW()) returning id
),
tea as (
	insert into transaction_item (transaction_id, rule_instance_id, item_id, price, quantity, debitor, creditor, debitor_approval_time, creditor_approval_time) values ((select id from insert_transaction), null, 'tea', 3.000, 1, 'JohnSmith', 'GroceryCo', NOW(), NOW()) returning id
),
tax_tea as (
	insert into transaction_item (transaction_id, rule_instance_id, item_id, price, quantity, debitor, creditor, debitor_approval_time, creditor_approval_time) values ((select id from insert_transaction), (select id from item_tax_rule_instance), '9% state sales tax', 0.270, 1, 'JohnSmith', 'StateOfCalifornia', NOW(), NOW()) returning id
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
insert into approval (rule_instance_id, transaction_id, transaction_item_id, account_name, account_role, approval_time) values(
(select id from appr_igor_debitor_rule_instance), (select id from insert_transaction), (select id from butter), (select account_name from appr_igor_debitor_rule_instance), (select account_role from appr_igor_debitor_rule_instance), NOW()
),(
(select id from appr_miriam_debitor_rule_instance), (select id from insert_transaction), (select id from butter), (select account_name from appr_miriam_debitor_rule_instance), (select account_role from appr_miriam_debitor_rule_instance), NOW()
),(
(select id from appr_ben_creditor_rule_instance), (select id from insert_transaction), (select id from butter), (select account_name from appr_ben_creditor_rule_instance), (select account_role from appr_ben_creditor_rule_instance), NOW()
),(
(select id from appr_jacob_creditor_rule_instance), (select id from insert_transaction), (select id from butter), (select account_name from appr_jacob_creditor_rule_instance), (select account_role from appr_jacob_creditor_rule_instance), NOW()
),(
(select id from appr_miriam_creditor_rule_instance), (select id from insert_transaction), (select id from butter), (select account_name from appr_miriam_creditor_rule_instance), (select account_role from appr_miriam_creditor_rule_instance), NOW()
),(
(select id from appr_igor_debitor_rule_instance), (select id from insert_transaction), (select id from tax_butter), (select account_name from appr_igor_debitor_rule_instance), (select account_role from appr_igor_debitor_rule_instance), NOW()
),(
(select id from appr_miriam_debitor_rule_instance), (select id from insert_transaction), (select id from tax_butter), (select account_name from appr_miriam_debitor_rule_instance), (select account_role from appr_miriam_debitor_rule_instance), NOW()
),(
(select id from appr_ben_creditor_rule_instance), (select id from insert_transaction), (select id from tax_butter), (select account_name from appr_ben_creditor_rule_instance), (select account_role from appr_ben_creditor_rule_instance), NOW()
),(
(select id from appr_jacob_creditor_rule_instance), (select id from insert_transaction), (select id from tax_butter), (select account_name from appr_jacob_creditor_rule_instance), (select account_role from appr_jacob_creditor_rule_instance), NOW()
),(
(select id from appr_miriam_creditor_rule_instance), (select id from insert_transaction), (select id from tax_butter), (select account_name from appr_miriam_creditor_rule_instance), (select account_role from appr_miriam_creditor_rule_instance), NOW()
),(
(select id from appr_igor_debitor_rule_instance), (select id from insert_transaction), (select id from grapes), (select account_name from appr_igor_debitor_rule_instance), (select account_role from appr_igor_debitor_rule_instance), NOW()
),(
(select id from appr_miriam_debitor_rule_instance), (select id from insert_transaction), (select id from grapes), (select account_name from appr_miriam_debitor_rule_instance), (select account_role from appr_miriam_debitor_rule_instance), NOW()
),(
(select id from appr_ben_creditor_rule_instance), (select id from insert_transaction), (select id from grapes), (select account_name from appr_ben_creditor_rule_instance), (select account_role from appr_ben_creditor_rule_instance), NOW()
),(
(select id from appr_jacob_creditor_rule_instance), (select id from insert_transaction), (select id from grapes), (select account_name from appr_jacob_creditor_rule_instance), (select account_role from appr_jacob_creditor_rule_instance), NOW()
),(
(select id from appr_miriam_creditor_rule_instance), (select id from insert_transaction), (select id from grapes), (select account_name from appr_miriam_creditor_rule_instance), (select account_role from appr_miriam_creditor_rule_instance), NOW()
),(
(select id from appr_igor_debitor_rule_instance), (select id from insert_transaction), (select id from tax_grapes), (select account_name from appr_igor_debitor_rule_instance), (select account_role from appr_igor_debitor_rule_instance), NOW()
),(
(select id from appr_miriam_debitor_rule_instance), (select id from insert_transaction), (select id from tax_grapes), (select account_name from appr_miriam_debitor_rule_instance), (select account_role from appr_miriam_debitor_rule_instance), NOW()
),(
(select id from appr_ben_creditor_rule_instance), (select id from insert_transaction), (select id from tax_grapes), (select account_name from appr_ben_creditor_rule_instance), (select account_role from appr_ben_creditor_rule_instance), NOW()
),(
(select id from appr_jacob_creditor_rule_instance), (select id from insert_transaction), (select id from tax_grapes), (select account_name from appr_jacob_creditor_rule_instance), (select account_role from appr_jacob_creditor_rule_instance), NOW()
),(
(select id from appr_miriam_creditor_rule_instance), (select id from insert_transaction), (select id from tax_grapes), (select account_name from appr_miriam_creditor_rule_instance), (select account_role from appr_miriam_creditor_rule_instance), NOW()
),(
(select id from appr_igor_debitor_rule_instance), (select id from insert_transaction), (select id from tea), (select account_name from appr_igor_debitor_rule_instance), (select account_role from appr_igor_debitor_rule_instance), NOW()
),(
(select id from appr_miriam_debitor_rule_instance), (select id from insert_transaction), (select id from tea), (select account_name from appr_miriam_debitor_rule_instance), (select account_role from appr_miriam_debitor_rule_instance), NOW()
),(
(select id from appr_ben_creditor_rule_instance), (select id from insert_transaction), (select id from tea), (select account_name from appr_ben_creditor_rule_instance), (select account_role from appr_ben_creditor_rule_instance), NOW()
),(
(select id from appr_jacob_creditor_rule_instance), (select id from insert_transaction), (select id from tea), (select account_name from appr_jacob_creditor_rule_instance), (select account_role from appr_jacob_creditor_rule_instance), NOW()
),(
(select id from appr_miriam_creditor_rule_instance), (select id from insert_transaction), (select id from tea), (select account_name from appr_miriam_creditor_rule_instance), (select account_role from appr_miriam_creditor_rule_instance), NOW()
),(
(select id from appr_igor_debitor_rule_instance), (select id from insert_transaction), (select id from tax_tea), (select account_name from appr_igor_debitor_rule_instance), (select account_role from appr_igor_debitor_rule_instance), NOW()
),(
(select id from appr_miriam_debitor_rule_instance), (select id from insert_transaction), (select id from tax_tea), (select account_name from appr_miriam_debitor_rule_instance), (select account_role from appr_miriam_debitor_rule_instance), NOW()
),(
(select id from appr_ben_creditor_rule_instance), (select id from insert_transaction), (select id from tax_tea), (select account_name from appr_ben_creditor_rule_instance), (select account_role from appr_ben_creditor_rule_instance), NOW()
),(
(select id from appr_jacob_creditor_rule_instance), (select id from insert_transaction), (select id from tax_tea), (select account_name from appr_jacob_creditor_rule_instance), (select account_role from appr_jacob_creditor_rule_instance), NOW()
),(
(select id from appr_miriam_creditor_rule_instance), (select id from insert_transaction), (select id from tax_tea), (select account_name from appr_miriam_creditor_rule_instance), (select account_role from appr_miriam_creditor_rule_instance), NOW()
),(
null, (select id from insert_transaction), (select id from butter), 'JohnSmith', 'debitor', NOW()
),(
null, (select id from insert_transaction), (select id from grapes), 'JohnSmith', 'debitor', NOW()
),(
null, (select id from insert_transaction), (select id from tea), 'JohnSmith', 'debitor', NOW()
);