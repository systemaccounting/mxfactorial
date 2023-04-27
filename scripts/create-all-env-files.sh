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
APP_CONF_PATHS=($(source scripts/list-conf-paths.sh --type app))

for cp in "${APP_CONF_PATHS[@]}"; do
	if [[ $(yq "$cp | has(\"env_var\")" $PROJECT_CONF) == 'true' ]]; then
		if [[ $(yq "$cp.env_var | has(\"get\")" $PROJECT_CONF) == 'true' ]]; then
			APP_DIR=$(yq "$cp | path | join(\"/\")" $PROJECT_CONF)
			(cd $APP_DIR; make --no-print-directory get-secrets ENV=$ENV)
		fi
	fi
done