CREATE TYPE entire_transaction_item AS (
	transaction_item transaction_item,
	approvals approval[]
);

CREATE TYPE entire_transaction AS (
	transaction transaction,
	transaction_items entire_transaction_item[]
);

CREATE OR REPLACE FUNCTION insert_transaction(entire_transaction entire_transaction) RETURNS int AS $$
DECLARE
	tr_id int;
	tr_item_id int;
	tr_item entire_transaction_item;
	apprv approval;
BEGIN
	-- 1. insert transaction returning id
	INSERT INTO transaction (
		rule_instance_id,
		author,
		author_device_id,
		author_device_latlng,
		author_role,
		equilibrium_time,
		sum_value
	) VALUES (
		(entire_transaction).transaction.rule_instance_id,
		(entire_transaction).transaction.author,
		(entire_transaction).transaction.author_device_id,
		(entire_transaction).transaction.author_device_latlng,
		(entire_transaction).transaction.author_role,
		(entire_transaction).transaction.equilibrium_time,
		(entire_transaction).transaction.sum_value
	) RETURNING id INTO tr_id;
	-- 2. loop through transaction_item array and insert
	-- transaction_item(s) with previously returned transaction id
	FOREACH tr_item IN ARRAY (entire_transaction).transaction_items
		LOOP
			INSERT INTO transaction_item (
				transaction_id,
				item_id,
				price,
				quantity,
				debitor_first,
				rule_instance_id,
				rule_exec_ids,
				unit_of_measurement,
				units_measured,
				debitor,
				creditor,
				debitor_profile_id,
				creditor_profile_id,
				debitor_approval_time,
				creditor_approval_time,
				debitor_expiration_time,
				creditor_expiration_time,
				debitor_rejection_time,
				creditor_rejection_time
			) VALUES (
				tr_id,
				(tr_item).transaction_item.item_id,
				(tr_item).transaction_item.price,
				(tr_item).transaction_item.quantity,
				(tr_item).transaction_item.debitor_first,
				(tr_item).transaction_item.rule_instance_id,
				(tr_item).transaction_item.rule_exec_ids,
				(tr_item).transaction_item.unit_of_measurement,
				(tr_item).transaction_item.units_measured,
				(tr_item).transaction_item.debitor,
				(tr_item).transaction_item.creditor,
				(tr_item).transaction_item.debitor_profile_id,
				(tr_item).transaction_item.creditor_profile_id,
				(tr_item).transaction_item.debitor_approval_time,
				(tr_item).transaction_item.creditor_approval_time,
				(tr_item).transaction_item.debitor_expiration_time,
				(tr_item).transaction_item.creditor_expiration_time,
				(tr_item).transaction_item.debitor_rejection_time,
				(tr_item).transaction_item.creditor_rejection_time
			) RETURNING id INTO tr_item_id;
			-- 3. loop through approvals array and insert approvals with
			--  previously returned transaction id and transaction_item id
			FOREACH apprv IN ARRAY (tr_item).approvals
				LOOP
					INSERT INTO approval (
						rule_instance_id,
						transaction_id,
						transaction_item_id,
						account_name,
						account_role,
						device_id,
						device_latlng,
						approval_time,
						rejection_time,
						expiration_time
					) VALUES (
						(apprv).rule_instance_id,
						tr_id,
						tr_item_id,
						(apprv).account_name,
						(apprv).account_role,
						(apprv).device_id,
						(apprv).device_latlng,
						(apprv).approval_time,
						(apprv).rejection_time,
						(apprv).expiration_time
					);
				END LOOP;
		END LOOP;
	RETURN tr_id;
END;
$$ LANGUAGE plpgsql;