-- go-migrate cant reach enum drop migration after after dirty drop
-- todo: add enum after https://github.com/golang-migrate/migrate/pull/477
-- CREATE TYPE debitor_or_creditor AS ENUM ('debitor', 'creditor');

-- items receive approval_time values only
-- on approval from all item approvers
CREATE TABLE approver (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL,
  transaction_item_id INTEGER,
  account_name character varying(255) NOT NULL,
  account_role text NOT NULL, -- todo: switch to enum after above noted go-migrate feature deployed
  device_id character varying(255), -- todo: inventory devices in separate table similar to items
  device_latlng character varying(255), -- todo: inventory devices in separate table similar to items
  approval_time timestamptz,
  rejection_time timestamptz,
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

-- a transaction_item is approved by account_owner(s)
-- account_owner auto-added when transaction_item created
CREATE OR REPLACE FUNCTION add_approver()
	RETURNS trigger AS
$$
DECLARE
  current_transaction transaction%ROWTYPE;
  tested_author_role text; -- todo: switch to enum after above noted go-migrate feature deployed
BEGIN
    -- store current transaction in
    -- memory for value test and insert
    SELECT *
    INTO current_transaction
    FROM transaction
    WHERE id = NEW.transaction_id;

    -- test for transaction.author_role in transaction_item
    -- todo: add rollback in app code for transaction.author_role != NEW.debitor or NEW.creditor error edge case
    IF NEW.debitor = current_transaction.author THEN
      tested_author_role := 'debitor';
    ELSIF NEW.creditor = current_transaction.author THEN
      tested_author_role := 'creditor';
    END IF;
    IF tested_author_role != NULL THEN
      IF tested_author_role != current_transaction.author_role THEN
        RAISE EXCEPTION 'transaction.author role not same in transaction_item';
      END IF;
    END IF;

    -- insert debitor approver(s)
    INSERT INTO approver (account_name, account_role, transaction_id, transaction_item_id)
    SELECT DISTINCT coalesce(owner_account, '') || coalesce(owner_subaccount, ''), 'debitor', NEW.transaction_id , NEW.id
    FROM account_owner
    WHERE account_owner.owned_subaccount = NEW.debitor;

    -- insert credtior approver(s)
    INSERT INTO approver (account_name, account_role, transaction_id, transaction_item_id)
    SELECT DISTINCT coalesce(owner_account, '') || coalesce(owner_subaccount, ''), 'creditor', NEW.transaction_id , NEW.id
    FROM account_owner
    WHERE account_owner.owned_subaccount = NEW.creditor;

	RETURN NULL;
END;
$$
LANGUAGE plpgsql;

-- trigger creates approver(s) after transaction_item insert
CREATE TRIGGER add_approver
AFTER INSERT ON transaction_item
FOR EACH ROW
EXECUTE PROCEDURE add_approver();