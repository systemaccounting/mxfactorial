#!/bin/bash

PROJECT_CONF=project.yaml
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
MIGRATIONS_DIR_PATH=./migrations
ENV_FILE="$MIGRATIONS_DIR_PATH/$ENV_FILE_NAME"

make -C $MIGRATIONS_DIR_PATH env ENV=local

source $ENV_FILE

until pg_isready -h $PGHOST -U $PGUSER -d $PGDATABASE; do sleep 1; done

psql -U $PGUSER -d $PGDATABASE -h $PGHOST -c "ALTER SYSTEM SET log_min_messages TO NOTICE;"
psql -U $PGUSER -d $PGDATABASE -h $PGHOST -c "SELECT pg_reload_conf();"