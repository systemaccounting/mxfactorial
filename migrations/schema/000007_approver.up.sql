-- go-migrate cant reach enum drop migration after after dirty drop
-- todo: add enum after https://github.com/golang-migrate/migrate/pull/477
-- CREATE TYPE debitor_or_creditor AS ENUM ('debitor', 'creditor');


-- per item approver preferred to per transaction:
-- per item rejection enables approvers to
-- signal how transactions can be improved

-- transaction_item labeled as approved
-- only after timestamps added by approvers
CREATE TABLE approver (
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
