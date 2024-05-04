CREATE TABLE account_balance (
  account_name character varying(255) not null unique,
  current_balance numeric default 0 CHECK (current_balance > 0),
  current_transaction_item_id int, -- todo: not null, accounts created by transaction
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_account_name
  FOREIGN KEY(account_name)
    REFERENCES account(name)
  -- CONSTRAINT fk_current_transaction_item_id
  --   FOREIGN KEY(current_transaction_item_id)
  --     REFERENCES transaction_item(id)
);

-- changes account balance on equilibrium
CREATE OR REPLACE FUNCTION change_account_balance()
	RETURNS trigger AS
$$
BEGIN
  NEW.current_balance = NEW.current_balance + OLD.current_balance;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER change_account_balance
BEFORE UPDATE ON account_balance
FOR EACH ROW
EXECUTE PROCEDURE change_account_balance();

-- enables changing multiple account balances from plpgsql function in go
CREATE TYPE balance_change AS (
	account_name varchar(255),
	current_balance numeric,
	current_transaction_item_id integer
);

-- changes multiple account balances
CREATE OR REPLACE FUNCTION change_balances(VARIADIC balance_changes account_balance[])
RETURNS void
AS $$
DECLARE
	bc account_balance;
BEGIN
	FOREACH bc IN ARRAY balance_changes
		LOOP
			UPDATE account_balance
			SET current_balance = bc.current_balance,
          		current_transaction_item_id = bc.current_transaction_item_id
			WHERE account_name = bc.account_name;
		END LOOP;
END;
$$ LANGUAGE plpgsql;