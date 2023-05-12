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

if [[ $ENV != 'local' ]] && [[ ! -f  infrastructure/terraform/env-id/terraform.tfstate ]]; then
	echo '"make build-dev" OR "make resume-dev ENV_ID=12345" before continuing. exiting'
	exit 1
fi

PROJECT_CONF=project.yaml
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