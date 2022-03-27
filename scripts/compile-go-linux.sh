#!/bin/bash

if [[ "$#" -ne 2 ]]; then
	echo "use: bash scripts/compile-go-linux.sh --app-name request-create"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.json
APP_PATH=$(jq -r ".apps.\"$APP_NAME\".path" $PROJECT_CONF)
BINARY_FILE_NAME=$(jq -r ".apps.\"$APP_NAME\".executable_name" $PROJECT_CONF)
BUILD_SRC_PATH=$(jq -r ".apps.\"$APP_NAME\".build_src_path" $PROJECT_CONF)

cd $APP_PATH

GOOS=linux go build -o $BINARY_FILE_NAME ./$BUILD_SRC_PATH