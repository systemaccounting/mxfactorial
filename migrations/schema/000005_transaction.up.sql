-- a transaction is a batch of transaction_item
-- 1 to many with transaction_item
-- using common table expression:
-- first, insert transaction returning id,
-- then, insert transaction_item(s)
CREATE TABLE transaction (
  id SERIAL PRIMARY KEY,
  rule_instance_id int,
  author character varying(255) not null, -- stores account belonging to earliest approval time in transaction_item to avoid expensive query
  author_device_id character varying(255), -- todo: inventory devices in separate table similar to items
  author_device_latlng point,
  author_role text not null,
  -- https://en.wiktionary.org/wiki/equilibrium_price
  equilibrium_time timestamptz,
  debitor_first boolean default false,
  sum_value numeric,
  event_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rule_instance_id
    FOREIGN KEY(rule_instance_id)
      REFERENCES transaction_rule_instance(id),
  CONSTRAINT fk_author
    FOREIGN KEY(author)
      REFERENCES account(name)
);

CREATE INDEX transaction_pending_event_idx ON transaction (id)
WHERE equilibrium_time IS NOT NULL AND event_time IS NULL;
