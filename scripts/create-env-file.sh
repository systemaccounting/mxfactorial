#!/bin/bash

set -e

if [[ "$#" -ne 4 ]]; then
	echo "use: bash scripts/create-env.sh --app-name request-create --env dev"
	exit 1
fi

# https://stackoverflow.com/a/33826763
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml

APP_CONF_PATH=$(source scripts/list-conf-paths.sh --type all | grep --color=never -E "$APP_NAME$|$APP_NAME\"]$")

# early term when 0 secrets required
if [[ $(yq "$APP_CONF_PATH | has(\"env_var\")" $PROJECT_CONF) == 'false' ]]; then
	echo '0 secrets required. skipping'
	exit 0
fi

if [[ $(yq "$APP_CONF_PATH.env_var | has(\"get\")" $PROJECT_CONF) == 'false' ]]; then
	echo '0 secrets required. skipping'
	exit 0
fi

if [[ $(yq "$APP_CONF_PATH.env_var.get | length" $PROJECT_CONF) -eq 0 ]]; then
	echo '0 secrets required. skipping'
	exit 0
fi

SECRETS=($(yq "$APP_CONF_PATH.env_var.get | join(\" \")" $PROJECT_CONF))
SSM_VERSION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.SSM_VERSION.default' $PROJECT_CONF)
ENV_ID=$(source scripts/print-env-id.sh)

PARAMS=($(yq "$APP_CONF_PATH.params | join(\" \")" $PROJECT_CONF))
ENABLE_API_AUTH=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.ENABLE_API_AUTH.default' $PROJECT_CONF)
ENABLE_NOTIFICATIONS=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.ENABLE_NOTIFICATIONS.default' $PROJECT_CONF)
APP_DIR_PATH=$(source scripts/list-dir-paths.sh --type all | grep --color=never "$APP_NAME$")
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE="$APP_DIR_PATH/$ENV_FILE_NAME"
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)


function test_env_file() {
	if [[ ! -s $ENV_FILE ]]; then
		rm -f $ENV_FILE
		echo 'no env vars required'
	else
		echo 'env vars retrieved'
	fi
}

function set_secrets() {
	for s in "${SECRETS[@]}"; do
		SSM_SUFFIX=$(yq "... | select(has(\"$s\")).$s.ssm" $PROJECT_CONF)
		ENV_VAR=$(aws ssm get-parameter \
			--name "/$ENV_ID/$SSM_VERSION/$ENV/$SSM_SUFFIX" \
			--query 'Parameter.Value' \
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