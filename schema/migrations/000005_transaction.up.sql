-- a transaction is a batch of transaction_item
-- 1 to many with transaction_item
-- using common table expression:
-- first, insert transaction returning id,
-- then, insert transaction_item(s)
CREATE TABLE transaction (
  id SERIAL PRIMARY KEY,
  author character varying(255) not null, -- stores account belonging to earliest approval time in transaction_item to avoid expensive query
  author_device_id character varying(255), -- todo: inventory devices in separate table similar to items
  author_device_latlng character varying(255),
  author_role text not null,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_author
    FOREIGN KEY(author)
      REFERENCES account(name)
);
