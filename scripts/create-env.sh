#!/bin/bash

set -e

if [[ "$#" -ne 6 ]]; then
	echo "use: bash scripts/create-env.sh --app-name request-create --env dev --region us-east-1"
	exit 1
fi

# https://stackoverflow.com/a/33826763
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --env) ENVIRONMENT="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done


PROJECT_CONFIG=project.json

# set PROJECT_JSON_PROPERTY variable
APP_OR_PKG_NAME="$APP_NAME" # todo: change APP_NAME to APP_OR_PKG_NAME
if [[ "$APP_OR_PKG_NAME" == 'root' ]]; then
	PROJECT_JSON_PROPERTY=
else
	source ./scripts/shared-set-property.sh
fi

SECRETS=$(jq -r "[$PROJECT_JSON_PROPERTY.secrets[]] | join (\" \")" $PROJECT_CONFIG)
SSM_VERSION=$(jq -r .ssm_version $PROJECT_CONFIG)
PARAMS=$(jq -r "[$PROJECT_JSON_PROPERTY.params[]] | join (\" \")" $PROJECT_CONFIG)
ENABLE_API_AUTH=$(jq -r .enable_api_auth $PROJECT_CONFIG)
ENABLE_NOTIFICATIONS=$(jq -r .enable_notifications $PROJECT_CONFIG)

ENV_FILE_PATH=$(jq -r "$PROJECT_JSON_PROPERTY.path" $PROJECT_CONFIG)
ENV_FILE_NAME='.env'
ENV_FILE="$ENV_FILE_PATH/$ENV_FILE_NAME"


function test_env_file() {
	if [[ ! -s $ENV_FILE ]]; then
		rm -f $ENV_FILE
		echo 'no env vars required'
	else
		echo 'env vars retrieved'
	fi
}

function set_secrets() {
	for s in ${SECRETS[@]}; do
		PARAM_NAME=$(jq -r ".ssm_params.$s" $PROJECT_CONFIG)
		ENV_VAR=$(aws ssm get-parameter \
			--name "/$ENVIRONMENT/$SSM_VERSION/$PARAM_NAME" \
			--query "Parameter.Value" \
			--region $REGION \
			--with-decryption \
			--output text)
		echo $s=$ENV_VAR >> $ENV_FILE
	done
}

function set_params() {
	for p in ${PARAMS[@]}; do
		if [[ $p == 'AWS_REGION' ]]; then
			echo $p=$REGION >> $ENV_FILE
		elif [[ $p == 'LOCAL_ENV' ]]; then
			echo LOCAL_ENV=1 >> $ENV_FILE
		elif [[ $p == 'ENABLE_API_AUTH' ]]; then
			echo ENABLE_API_AUTH=$ENABLE_API_AUTH >> $ENV_FILE
		elif [[ $p == 'ENABLE_NOTIFICATIONS' ]]; then
			echo ENABLE_NOTIFICATIONS=$ENABLE_NOTIFICATIONS >> $ENV_FILE
		fi
	done
}

rm -f $ENV_FILE
set_secrets
set_params
test_env_file