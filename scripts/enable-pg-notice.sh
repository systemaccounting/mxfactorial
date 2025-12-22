#!/bin/bash

PROJECT_CONF=project.yaml
ENV_PATH='.infra.terraform.aws.modules.environment.env_var.set'
PGHOST=$(yq "$ENV_PATH.PGHOST.default" $PROJECT_CONF)
PGUSER=$(yq "$ENV_PATH.PGUSER.default" $PROJECT_CONF)
PGPASSWORD=$(yq "$ENV_PATH.PGPASSWORD.default" $PROJECT_CONF)
PGDATABASE=$(yq "$ENV_PATH.PGDATABASE.default" $PROJECT_CONF)

until pg_isready -h $PGHOST -U $PGUSER -d $PGDATABASE; do sleep 1; done

PGPASSWORD=$PGPASSWORD psql -U $PGUSER -d $PGDATABASE -h $PGHOST -c "ALTER SYSTEM SET log_min_messages TO NOTICE;"
PGPASSWORD=$PGPASSWORD psql -U $PGUSER -d $PGDATABASE -h $PGHOST -c "SELECT pg_reload_conf();"