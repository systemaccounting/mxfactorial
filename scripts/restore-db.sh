#!/bin/bash

set -e

# print use
if [[ "$#" -ne 0 ]] && [[ "$#" -ne 1 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/restore-db.sh # OPTIONAL: --rds
	EOF
	exit 1
fi

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
		--rds) DUMP_RDS=1 ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json
DUMP_PATH=$(jq -r ".env_var.TESTSEED_DUMP_PATH.docker" $PROJECT_CONFIG)
ENV_FILE=.env

if [[ $DUMP_RDS ]]; then
	pushd migrations >/dev/null
	if ! [[ -f $ENV_FILE ]]; then
		echo "migrations/$ENV_FILE file not found. \"make -C migrations get-secrets ENV=\$ENV\" to create $ENV_FILE file"
		exit 1
	fi
	eval "$(awk '$0="export "$0' $ENV_FILE)"
	popd >/dev/null
	psql -f "$DUMP_PATH"
else
	PGHOST=$(jq -r ".env_var.PGHOST.docker" $PROJECT_CONFIG) \
	PGPORT=$(jq -r ".env_var.PGPORT.docker" $PROJECT_CONFIG) \
	PGDATABASE=$(jq -r ".env_var.PGDATABASE.docker" $PROJECT_CONFIG) \
	PGUSER=$(jq -r ".env_var.PGUSER.docker" $PROJECT_CONFIG) \
	PGPASSWORD=$(jq -r ".env_var.PGPASSWORD.docker" $PROJECT_CONFIG) \
		psql -f "$DUMP_PATH"
fi