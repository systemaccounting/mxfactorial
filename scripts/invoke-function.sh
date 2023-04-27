#!/bin/bash

set -e

if [[ "$#" -ne 6 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/invoke-function.sh \
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
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml

ENV_ID=$(source scripts/print-env-id.sh)

LAMBDA_NAME="$APP_NAME-$ENV_ID-$ENV"

LAMBDA_INVOKE_LOG_FILE_PATH=$(source scripts/list-dir-paths.sh --type app | grep --color=never "$APP_NAME")

LAMBDA_INVOKE_LOG_FILE_NAME=$(yq '.services.env_var.set.LAMBDA_INVOKE_LOG.default' $PROJECT_CONF)

LAMBDA_INVOKE_LOG="$LAMBDA_INVOKE_LOG_FILE_PATH/$LAMBDA_INVOKE_LOG_FILE_NAME"

REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

aws lambda invoke \
	--region $REGION \
	--invocation-type RequestResponse \
	--function-name $LAMBDA_NAME \
	--payload $(echo "$PAYLOAD" | base64) \
	$LAMBDA_INVOKE_LOG

# store first character of invoke log file
RESPONSE_FIRST_CHARACTER=$(head -c 1 $LAMBDA_INVOKE_LOG)
case $RESPONSE_FIRST_CHARACTER in
	'"') # when object returned as string
		yq 'fromjson' $LAMBDA_INVOKE_LOG
		;;
	*)
		yq -o=json -P $LAMBDA_INVOKE_LOG
		;;
esac