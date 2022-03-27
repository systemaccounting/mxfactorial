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

PROJECT_CONFIG=project.json
APP_PATH=$(jq -r ".apps.\"$APP_NAME\".path" $PROJECT_CONFIG)
INVOKE_LOG_FILE_NAME=$(jq -r ".apps.\"$APP_NAME\".lambda_invoke_log" $PROJECT_CONFIG)

rm -f "$APP_PATH/$INVOKE_LOG_FILE_NAME"