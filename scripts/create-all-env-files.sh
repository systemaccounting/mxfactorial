#!/bin/bash

if [[ "$#" -ne 2 ]]; then
	echo "use: bash scripts/create-all-env-files.sh --env dev"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done


PROJECT_CONF=project.yaml
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE=$ENV_FILE_NAME # assumes project root

if [[ -f $ENV_FILE ]]; then
	if grep -q "ENV_ID=" $ENV_FILE; then
		ENV_ID=$(grep "ENV_ID=" $ENV_FILE | cut -d'=' -f2)
	else
		echo "ENV_ID assignment missing from root .env"
		echo "make env-id before continuing"
		exit 1
	fi
else
	echo "make get-secrets ENV=$ENV before continuing"
	exit 1
fi

if [[ $ENV != 'local' ]] && [[ -z ENV_ID ]]; then
	echo '"make build-dev" OR "make resume-dev ENV_ID=12345" before continuing. exiting'
	exit 1
fi

APP_CONF_PATHS=($(source scripts/list-conf-paths.sh --type app))

for cp in "${APP_CONF_PATHS[@]}"; do
	if [[ $(yq "$cp | has(\"env_var\")" $PROJECT_CONF) == 'true' ]]; then
		if [[ $(yq "$cp.env_var | has(\"get\")" $PROJECT_CONF) == 'true' ]]; then
			APP_DIR=$(yq "$cp | path | join(\"/\")" $PROJECT_CONF)
			echo "*** creating $ENV $APP_DIR/.env"
			(cd $APP_DIR; make --no-print-directory get-secrets ENV=$ENV)
		fi
	fi
done

echo "*** creating $ENV ./.env"
make --no-print-directory get-secrets ENV=$ENV