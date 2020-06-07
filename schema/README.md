<p align="center">
  <a href="http://www.systemaccounting.org/math_identity" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

* `cd clone-faas` and `bash build.sh` before `terraform apply`. no `bash build.sh all` required for `clone-faas` deps. `bash deploy.sh $ENV` for `index.js` deployment
* `cd update-faas` and `bash build.sh all`, then `terraform apply`. `bash deploy.sh $ENV` for `index.js` deployment
*  new `update-faas` layer versions deployed through `terraform apply` only

## updating schema
*  push schema change commit to `schema/diffs`
*  `cd schema`
*  `bash schema.sh`
*  follow prompts


## important
* **IF** `yarn add $PACKAGE` in `update-faas` **THEN** `sh build.sh deps && terraform apply` to deploy new layer version 

## data migration

1. list and copy functions on source db
    ```sql
    select n.nspname as function_schema,
          p.proname as function_name,
          l.lanname as function_language,
          case when l.lanname = 'internal' then p.prosrc
                else pg_get_functiondef(p.oid)
                end as definition,
          pg_get_function_arguments(p.oid) as function_arguments,
          t.typname as return_type
    from pg_proc p
    left join pg_namespace n on p.pronamespace = n.oid
    left join pg_language l on p.prolang = l.oid
    left join pg_type t on t.oid = p.prorettype 
    where n.nspname not in ('pg_catalog', 'information_schema')
    order by function_schema,
            function_name;
    ```
1. list and copy triggers on source db
    ```sql
    select event_object_schema as table_schema,
          event_object_table as table_name,
          trigger_schema,
          trigger_name,
          string_agg(event_manipulation, ',') as event,
          action_timing as activation,
          action_condition as condition,
          action_statement as definition
    from information_schema.triggers
    group by 1,2,3,4,6,7,8
    order by table_schema,
            table_name;
    ```
1. list and copy sequences on source db
    ```sql
    SELECT c.relname FROM pg_class c WHERE c.relkind = 'S';
    ```
1. list and copy indexes on source db
    ```sql
    SELECT
        tablename,
        indexname,
        indexdef
    FROM
        pg_indexes
    WHERE
        schemaname = 'public'
    ORDER BY
        tablename,
        indexname;
    ```
1. add schema to target db
1. migrate data
1. duplicate functions from source to target db. single [example](https://github.com/systemaccounting/mxfactorial/blob/478fc3360434bb2c7e4bd02fb09d6d3d764824c3/schema/migrate-faas/migrations/1575600291930_websockets.js#L16-L27):
    ```sql
    CREATE OR REPLACE FUNCTION public.convert_epoch_timestamp()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
      BEGIN
        NEW.created_at = to_timestamp(NEW.epoch_created_at/1000);
        RETURN NEW;
      END;$function$
    ```
1. duplicate triggers from source to target db. single example:
    ```sql
    CREATE TRIGGER order_trigger AFTER INSERT OR UPDATE
    ON "order" FOR EACH ROW EXECUTE PROCEDURE save_order_in_history();
    ```
1. duplicate sequences from source to target db. single example:
    ```sql
    create sequence notification_websockets_id_seq owned by notification_websockets.id;
    SELECT setval('notification_websockets_id_seq', coalesce(max(id), 0)) FROM notification_websockets;
    ALTER TABLE notification_websockets ALTER COLUMN id SET DEFAULT nextval('notification_websockets_id_seq');
1. depending on [data migration tool](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html), primary indexes may not require manual duplication to target. list indexes on target db (same query as source db list index query above)
1. for each index on source db **NOT on target db**, duplicate on target. example:
    ```sql
    CREATE UNIQUE INDEX notification_websockets_pkey ON notification_websockets(id int4_ops);
    ```