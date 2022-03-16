#!/bin/bash

if [[ "$#" -ne 6 ]]; then
	cat <<- 'EOF'
	use:
	bash zip-executable.sh \
	        --app-name request-create \
	        --artifact-name request-create-src.zip \
	        --executable-name index.handler
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --artifact-name) ARTIFACT_NAME="$2"; shift ;;
        --executable-name) EXECUTABLE_NAME="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json
APP_PATH=$(jq -r ".apps.\"$APP_NAME\".path" $PROJECT_CONFIG)

cd $APP_PATH

zip $ARTIFACT_NAME ./$EXECUTABLE_NAME