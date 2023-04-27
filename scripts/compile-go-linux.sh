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

PROJECT_CONF=project.yaml

APP_DIR_PATH=$(source scripts/list-dir-paths.sh --type app | grep --color=never "$APP_NAME")
APP_CONF_PATH=$(source scripts/list-conf-paths.sh --type app | grep --color=never "$APP_NAME")

BINARY_NAME=$(yq '.services.env_var.set.BINARY_NAME.default' $PROJECT_CONF)
BUILD_SRC_PATH=$(yq "$APP_CONF_PATH.build_src_path" $PROJECT_CONF)

cd $APP_DIR_PATH

GOOS=linux CGO_ENABLED=0 go build -o $BINARY_NAME ./$BUILD_SRC_PATH