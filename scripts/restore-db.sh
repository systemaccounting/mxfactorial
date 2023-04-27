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

PROJECT_CONF=project.yaml
DUMP_PATH=$(yq '.migrations.dumps.env_var.set.TESTSEED_DUMP_PATH.default' $PROJECT_CONF)
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE="$ENV_FILE_NAME"
PG_CONF_PATH='.infrastructure.terraform.aws.modules.environment.env_var.set'

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
	PGHOST=$(yq "$PG_CONF_PATH.PGHOST.default" $PROJECT_CONF) \
	PGPORT=$(yq "$PG_CONF_PATH.PGPORT.default" $PROJECT_CONF) \
	PGDATABASE=$(yq "$PG_CONF_PATH.PGDATABASE.default" $PROJECT_CONF) \
	PGUSER=$(yq "$PG_CONF_PATH.PGUSER.default" $PROJECT_CONF) \
	PGPASSWORD=$(yq "$PG_CONF_PATH.PGPASSWORD.default" $PROJECT_CONF) \
		psql -f "$DUMP_PATH"
fi