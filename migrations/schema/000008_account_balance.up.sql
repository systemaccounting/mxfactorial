CREATE TABLE account_balance (
  account_name character varying(255) not null unique,
  account_balance numeric default 0,
  current_transaction_item_id int, -- todo: not null, accounts created by transaction
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_account_name
  FOREIGN KEY(account_name)
    REFERENCES account(name),
  CONSTRAINT fk_current_transaction_item_id
    FOREIGN KEY(current_transaction_item_id)
      REFERENCES transaction_item(id)
);

-- changes account balance on equilibrium
CREATE OR REPLACE FUNCTION change_account_balance()
	RETURNS trigger AS
$$
BEGIN
  NEW.account_balance = NEW.account_balance + OLD.account_balance;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER change_account_balance
BEFORE UPDATE ON account_balance
FOR EACH ROW
EXECUTE PROCEDURE change_account_balance();