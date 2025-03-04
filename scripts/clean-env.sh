#!/bin/bash

if [[ "$#" -ne 2 ]]; then
	echo "use: bash scripts/clean-env.sh --app-name request-create"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml

APP_DIR_PATH=$(source scripts/list-dir-paths.sh --type all | grep --color=never "^$APP_NAME$")
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE="$APP_DIR_PATH/$ENV_FILE_NAME"

rm -f $ENV_FILE