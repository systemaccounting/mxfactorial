CREATE OR REPLACE FUNCTION notify_event(event_name TEXT, event_id TEXT)
RETURNS void AS $$
BEGIN
  PERFORM pg_notify('event', json_build_object(
    'event', event_name,
    'id', event_id
  )::text);
END;
$$ LANGUAGE plpgsql;
