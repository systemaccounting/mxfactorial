#!/bin/bash

set -e

if [[ "$#" -ne 6 ]]; then
	echo "use: bash create-env.sh --app-name request-create --env dev --region us-east-1"
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

APP_PROPERTY=".apps.\"$APP_NAME\""

if [[ $APP_NAME == 'root' ]]; then
	APP_PROPERTY=
fi

PROJECT_CONFIG=project.json
SECRETS=$(jq -r "[$APP_PROPERTY.secrets[]] | join (\" \")" $PROJECT_CONFIG)
PARAMS=$(jq -r "[$APP_PROPERTY.params[]] | join (\" \")" $PROJECT_CONFIG)
ENV_FILE_PATH=$(jq -r "$APP_PROPERTY.path" $PROJECT_CONFIG)
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
		ENV_VAR=$(aws secretsmanager get-secret-value \
			--region $REGION \
			--secret-id $ENVIRONMENT/$s \
			--query 'SecretString' \
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
		fi
	done
}

rm -f $ENV_FILE
set_secrets
set_params
test_env_file