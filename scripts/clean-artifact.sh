#!/bin/bash

if [[ "$#" -ne 4 ]]; then
	echo "use: bash clean-artifact.sh --app-name request-create --artifact-name request-create-src.zip"
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

PROJECT_CONFIG=project.json
APP_PATH=$(jq -r ".apps.\"$APP_NAME\".path" $PROJECT_CONFIG)

rm -f "$APP_PATH/$ARTIFACT_NAME"