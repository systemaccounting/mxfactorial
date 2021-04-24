CREATE TABLE websocket (
  id SERIAL PRIMARY KEY,
  -- https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-mapping-template-reference.html
  connection_id character varying(255) not null UNIQUE,
  account character varying(255) not null,
  epoch_created_at bigint NOT NULL, -- e.g. 1547557733712, also supplied by apigateway
  created_at timestamptz, -- converted from epoch
  CONSTRAINT fk_account
      FOREIGN KEY (account)
        REFERENCES account(name)
);

CREATE OR REPLACE FUNCTION convert_epoch()
	RETURNS trigger AS
$$
BEGIN
  NEW.created_at = to_timestamp(NEW.epoch_created_at/1000);
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- trigger adds created_at from
-- from epoch from apigateway
CREATE TRIGGER convert_epoch
BEFORE INSERT ON websocket
FOR EACH ROW
EXECUTE PROCEDURE convert_epoch();