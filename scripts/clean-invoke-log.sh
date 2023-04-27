#!/bin/bash

if [[ "$#" -ne 2 ]]; then
	echo "use: bash scripts/clean-invoke-log.sh --app-name request-create"
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

APP_DIR_PATH=$(source scripts/list-dir-paths.sh --type app | grep --color=never "$APP_NAME")

INVOKE_LOG_FILE_NAME=$(yq '.services.env_var.set.LAMBDA_INVOKE_LOG.default' $PROJECT_CONF)

rm -f "$APP_DIR_PATH/$INVOKE_LOG_FILE_NAME"