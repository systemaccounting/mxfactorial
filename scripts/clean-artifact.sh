#!/bin/bash

if [[ "$#" -ne 4 ]]; then
	echo "use: bash scripts/clean-artifact.sh --app-name request-create --artifact-name request-create-src.zip"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --artifact-name) ARTIFACT_NAME="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

APP_DIR_PATH=$(source scripts/list-dir-paths.sh --type app | grep --color=never "$APP_NAME")

rm -f "$APP_DIR_PATH/$ARTIFACT_NAME"