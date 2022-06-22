#!/bin/bash

set -e

# print use
if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/dump-db.sh --path migrations/dumps/testseed.sql
	EOF
	exit 1
fi

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --path) DUMP_PATH="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json
CONFIG_DB_PROPERTY=postgres

PGHOST=$(jq -r ".$CONFIG_DB_PROPERTY.pghost" $PROJECT_CONFIG) \
PGPORT=$(jq -r ".$CONFIG_DB_PROPERTY.pgport" $PROJECT_CONFIG) \
PGDATABASE=$(jq -r ".$CONFIG_DB_PROPERTY.pgdatabase" $PROJECT_CONFIG) \
PGUSER=$(jq -r ".$CONFIG_DB_PROPERTY.pguser" $PROJECT_CONFIG) \
PGPASSWORD=$(jq -r ".$CONFIG_DB_PROPERTY.pgpassword" $PROJECT_CONFIG) \
	pg_dump > "$DUMP_PATH"