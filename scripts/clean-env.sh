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

PROJECT_CONFIG=project.json
ENV_FILE_PATH=$(jq ".apps.\"$APP_NAME\".path" $PROJECT_CONFIG | xargs)
ENV_FILE_NAME='.env'
ENV_FILE="$ENV_FILE_PATH/$ENV_FILE_NAME"

rm -f $ENV_FILE