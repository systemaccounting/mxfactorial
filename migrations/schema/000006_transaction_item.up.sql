-- added to transaction by authors
CREATE TABLE transaction_item (
  id SERIAL PRIMARY KEY,
  transaction_id integer NOT NULL,
  item_id character varying(255) NOT NULL, -- temporary until item inserts added in code
  price numeric NOT NULL CHECK (price > 0),
  quantity numeric NOT NULL CHECK (quantity > 0),
  rule_exec_ids text[],
  debitor_first boolean default true,
  rule_instance_id int,
  unit_of_measurement character varying(255),
  units_measured numeric,
  debitor character varying(255) not null,
  creditor character varying(255) not null,
  debitor_profile_id int,
  creditor_profile_id int,
  debitor_approval_time timestamptz,
  creditor_approval_time timestamptz,
  debitor_expiration_time timestamptz,
  creditor_expiration_time timestamptz,
  debitor_rejection_time timestamptz,
  creditor_rejection_time timestamptz,
  CONSTRAINT fk_transaction_id
    FOREIGN KEY(transaction_id)
      REFERENCES transaction(id),
  -- CONSTRAINT fk_debitor_profile_id -- todo
  --   FOREIGN KEY(debitor_profile_id)
  --     REFERENCES account_profile(id),
  -- CONSTRAINT fk_creditor_profile_id -- todo
  --   FOREIGN KEY(creditor_profile_id)
  --     REFERENCES account_profile(id),
  CONSTRAINT fk_rule_instance_id
    FOREIGN KEY(rule_instance_id)
      REFERENCES rule_instance(id)
  -- CONSTRAINT fk_item_id -- todo
  --   FOREIGN KEY(item_id)
  --     REFERENCES item(id)
);
