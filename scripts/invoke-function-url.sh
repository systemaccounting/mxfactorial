#!/bin/bash

set -e

if [[ "$#" -ne 6 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/invoke-function-url.sh \
	        --app-name request-create \
	        --payload "$(cat testEvent.json)" \
	        --env dev
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --payload) PAYLOAD="$2"; shift ;;
        --env) ENVIRONMENT="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done


PROJECT_CONF=project.yaml
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
APP_DIR_PATH=$(source scripts/list-dir-paths.sh --type app | grep --color=never "$APP_NAME")
ENV_FILE="$APP_DIR_PATH/$ENV_FILE_NAME"

if [[ ! -f $ENV_FILE ]]; then
	make get-secrets -C $APP_DIR_PATH ENV=$ENVIRONMENT
fi

SNAKE_APP_NAME=$(echo $APP_NAME | sed 's/-/_/g')
CAP_SNAKE_APP_NAME=$(echo $SNAKE_APP_NAME | tr 'a-z' 'A-Z')

ENV_VAR_NAME="${CAP_SNAKE_APP_NAME}_URL"

LINE_COUNT=$(grep ${ENV_VAR_NAME} $ENV_FILE | wc -l | xargs)

if [[ "$LINE_COUNT" -eq 0 ]]; then
	echo "$ENV_VAR_NAME assignment not available in $ENV_FILE"
	exit 1
fi

ENV_VAR_VAL=$(grep "$ENV_VAR_NAME" "$ENV_FILE" | cut -d '=' -f2)

awscurl -XPOST --service lambda -d "$PAYLOAD" -H 'Content-Type: application/json' "$ENV_VAR_VAL" | yq -o=json -P .