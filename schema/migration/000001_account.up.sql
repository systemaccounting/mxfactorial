-- personal account
CREATE TABLE account (
  name character varying(255) not null PRIMARY KEY,
  password text,
  created_by character varying(255), -- NOT NULL == subaccount
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- account created for business etc
CREATE TABLE subaccount (
  name character varying(255) NOT NULL PRIMARY KEY,
  created_by character varying(255) NOT NULL,
  created_at timestamptz NOT NULL,
  CONSTRAINT fk_name
    FOREIGN KEY(name)
      REFERENCES account(name),
  CONSTRAINT fk_created_by
    FOREIGN KEY(created_by)
      REFERENCES account(name)
);

-- subaccount names cannot duplicate account names
-- eg "joe" account vs "joe" subaccount
-- so subaccount shares account namespace
-- subaccount created on account trigger
CREATE OR REPLACE FUNCTION add_subaccount()
	RETURNS trigger AS
$$
BEGIN
		INSERT INTO subaccount(name, created_by, created_at)
		VALUES (NEW.name, NEW.created_by, NEW.created_at);
	RETURN NULL;
END;
$$
LANGUAGE plpgsql;

-- trigger creates subaccount when created_by value not null
CREATE TRIGGER add_subaccount
AFTER INSERT ON account
FOR EACH ROW
WHEN (NEW.created_by IS NOT NULL)
EXECUTE PROCEDURE add_subaccount();

-- enables multiple subaccount owners
CREATE TABLE account_owner (
  id SERIAL PRIMARY KEY,
  owner_account character varying(255),
  owned_account character varying(255),
  owner_subaccount character varying(255),
  owned_subaccount character varying(255),
  removed_by character varying(255),
  removed_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_owner_account
    FOREIGN KEY(owner_account)
      REFERENCES account(name),
  CONSTRAINT fk_owned_account
    FOREIGN KEY(owned_account)
      REFERENCES account(name),
  CONSTRAINT fk_owner_subaccount
    FOREIGN KEY(owner_subaccount)
      REFERENCES subaccount(name),
  CONSTRAINT fk_owned_subaccount
    FOREIGN KEY(owned_subaccount)
      REFERENCES subaccount(name),
  CONSTRAINT fk_removed_by
    FOREIGN KEY(removed_by)
      REFERENCES account(name),
  CONSTRAINT paired_owner_account
    CHECK (
      CASE WHEN owner_account IS NOT NULL
        THEN owner_subaccount IS NULL AND (owned_account IS NULL OR owned_subaccount IS NULL)
      END
    ),
  CONSTRAINT paired_owned_account
    CHECK (
      CASE WHEN owned_account IS NOT NULL
        THEN owned_subaccount IS NULL AND owner_subaccount IS NULL AND owner_account IS NOT NULL
      END
    ),
  CONSTRAINT paired_owner_subaccount
    CHECK (
      CASE WHEN owner_subaccount IS NOT NULL
        THEN owner_account IS NULL AND owned_account IS NULL AND owned_subaccount IS NOT NULL
      END
    ),
  CONSTRAINT paired_owned_subaccount
    CHECK (
      CASE WHEN owned_subaccount IS NOT NULL
        THEN owned_account IS NULL AND (owner_account IS NOT NULL OR owner_subaccount IS NOT NULL)
      END
    ),
  CONSTRAINT paired_owner_owned_account_only
    CHECK (
      CASE WHEN owner_account IS NOT NULL AND owned_account IS NOT NULL
        THEN owned_account = owner_account
      END
    )
);

-- a transaction_item is approved by an account_owner
-- account_owner auto-added when account created
CREATE OR REPLACE FUNCTION add_account_owner()
	RETURNS trigger AS
$$
BEGIN
		INSERT INTO account_owner(owner_account, owned_account)
		VALUES (NEW.name, NEW.name);
	RETURN NULL;
END;
$$
LANGUAGE plpgsql;

-- trigger creates account_owner when created_by value null
CREATE TRIGGER add_account_owner
AFTER INSERT ON account
FOR EACH ROW
WHEN (NEW.created_by IS NULL)
EXECUTE PROCEDURE add_account_owner();

CREATE TABLE account_setting (
  account_name character varying(255) not null,
  notification_email_address character varying(255) [] not null,
  request_sent_email boolean not null,
  transaction_sent_email boolean not null,
  request_received_email boolean not null,
  transaction_received_email boolean not null,
  password_per_request boolean not null,
  password_per_transaction boolean not null,
  publish_aggregates boolean not null, -- revenue, expense etc
  publish_all boolean not null, -- everything
  CONSTRAINT fk_account_name
    FOREIGN KEY(account_name)
      REFERENCES account(name)
);