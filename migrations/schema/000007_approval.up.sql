-- go-migrate cant reach enum drop migration after after dirty drop
-- todo: add enum after https://github.com/golang-migrate/migrate/pull/477
-- CREATE TYPE debitor_or_creditor AS ENUM ('debitor', 'creditor');


-- per item approval preferred to per transaction:
-- per item rejection enables approvals to
-- signal how transactions can be improved

-- transaction_item labeled as approved
-- only after timestamps added by approvals
CREATE TABLE approval (
  id SERIAL PRIMARY KEY,
  rule_instance_id int,
  transaction_id INTEGER NOT NULL,
  transaction_item_id INTEGER,
  account_name character varying(255) NOT NULL,
  account_role text NOT NULL, -- todo: switch to enum after above noted go-migrate feature deployed
  device_id character varying(255), -- todo: inventory devices in separate table similar to items
  device_latlng character varying(255), -- todo: inventory devices in separate table similar to items
  approval_time timestamptz,
  rejection_time timestamptz,
  expiration_time timestamptz,
  CONSTRAINT fk_rule_instance_id
    FOREIGN KEY(rule_instance_id)
      REFERENCES rule_instance(id),
  CONSTRAINT fk_transaction_id
    FOREIGN KEY(transaction_id)
      REFERENCES transaction(id),
  CONSTRAINT fk_transaction_item_id
    FOREIGN KEY(transaction_item_id)
      REFERENCES transaction_item(id),
  CONSTRAINT fk_account_name
    FOREIGN KEY(account_name)
      REFERENCES account(name),
  CONSTRAINT approval_time_present
    CHECK (
      CASE WHEN approval_time IS NOT NULL
        THEN rejection_time IS NULL
      END
    ),
  CONSTRAINT rejection_time_present
    CHECK (
      CASE WHEN rejection_time IS NOT NULL
        THEN approval_time IS NULL
      END
    )
);

CREATE INDEX idx_acct_name_trans_id ON approval (account_name, transaction_id);

-- 1. adds approval timestamps to all approvals for a
--    transaction where account appears as debitor or creditor
--    for example, JacobWebb the debitor approves all
--    transaction items where JacobWebb appears as debitor:
--        SELECT approve_all_role_account(3, 'JacobWebb', 'debitor') AS equilibrium_time;
-- 2. adds approval timestamps to affected transaction_item(s)
-- 3. adds equilibrium timestamp to transaction if all approvals have timestamps
-- 4. RETURNS time if equilibrium, NULL if not
CREATE OR REPLACE FUNCTION approve_all_role_account(
		tr_id int,
		acct_name text,
		acct_role text
	) RETURNS TIMESTAMPTZ AS $$
DECLARE apprvl_time TIMESTAMPTZ DEFAULT NOW();
DECLARE apprvl RECORD;
BEGIN
	FOR apprvl IN UPDATE approval
		SET approval_time = apprvl_time
		WHERE transaction_id = tr_id AND account_name = acct_name AND account_role = acct_role AND approval_time IS NULL
		RETURNING *
	LOOP
		IF apprvl.account_name = acct_name AND apprvl.account_role = acct_role THEN
			UPDATE transaction_item SET debitor_approval_time = apprvl_time WHERE id = apprvl.transaction_item_id;
		END IF;
	END LOOP;
	FOR apprvl IN SELECT approval_time FROM approval WHERE transaction_id = tr_id
	LOOP
		IF apprvl.approval_time IS NULL THEN
			RETURN apprvl.approval_time;
		END IF;
	END LOOP;
	UPDATE transaction SET equilibrium_time = apprvl_time WHERE id = tr_id;
	RETURN apprvl_time;
END;
$$ LANGUAGE plpgsql;