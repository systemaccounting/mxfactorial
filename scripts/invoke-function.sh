#!/bin/bash

set -e

if [[ "$#" -ne 8 ]]; then
	cat <<- 'EOF'
	use:
	bash invoke-function.sh \
	        --app-name request-create \
	        --payload "$(cat testEvent.json)" \
	        --env dev \
	        --region us-east-1
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --payload) PAYLOAD="$2"; shift ;;
        --env) ENVIRONMENT="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json
LAMBDA_NAME_PREFIX=$(jq -r ".apps.\"$APP_NAME\".lambda_name_prefix" $PROJECT_CONFIG)
LAMBDA_NAME="$LAMBDA_NAME_PREFIX-$ENVIRONMENT"
LAMBDA_INVOKE_LOG_FILE_PATH=$(jq -r ".apps.\"$APP_NAME\".path" $PROJECT_CONFIG)
LAMBDA_INVOKE_LOG_FILE_NAME=$(jq -r ".apps.\"$APP_NAME\".lambda_invoke_log" $PROJECT_CONFIG)
LAMBDA_INVOKE_LOG="$LAMBDA_INVOKE_LOG_FILE_PATH/$LAMBDA_INVOKE_LOG_FILE_NAME"

aws lambda invoke \
	--region $REGION \
	--invocation-type RequestResponse \
	--function-name $LAMBDA_NAME \
	--payload $(echo "$PAYLOAD" | base64) \
	$LAMBDA_INVOKE_LOG

# store first character of invoke log file
RESPONSE_FIRST_CHARACTER=$(head -c 1 $LAMBDA_INVOKE_LOG)
case $RESPONSE_FIRST_CHARACTER in
	'{') # rules lambda returns object
		jq '.' $LAMBDA_INVOKE_LOG
		;;
	'"') # others return object as string
		jq 'fromjson' $LAMBDA_INVOKE_LOG
		;;
	*) # print null response
		jq '.' $LAMBDA_INVOKE_LOG
		;;
esac