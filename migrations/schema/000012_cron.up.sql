CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION notify_cron(instance_id INT)
RETURNS void AS $$
BEGIN
  PERFORM notify_event('cron', instance_id::text);
END;
$$ LANGUAGE plpgsql;