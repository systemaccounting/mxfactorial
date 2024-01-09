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

if [[ $APP_NAME != 'root' ]]; then
	APP_CONF_PATH=$(source scripts/list-conf-paths.sh --type all | grep --color=never -E "\.$APP_NAME$|$APP_NAME\"]$")
	APP_DIR_PATH=$(source scripts/list-dir-paths.sh --type all | grep --color=never -E "^$APP_NAME$|^.*/$APP_NAME$")
else
	APP_CONF_PATH=
	APP_DIR_PATH=.
fi

# early term when 0 secrets required
if [[ $APP_CONF_PATH ]] && [[ $(yq "$APP_CONF_PATH | has(\"env_var\")" $PROJECT_CONF) == 'false' ]]; then
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

# avoid env-id when developing locally
if [[ $ENV != 'local' ]]; then
	ENV_ID=$(source scripts/print-env-id.sh)
fi

SSM_VERSION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.SSM_VERSION.default' $PROJECT_CONF)
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
SECRETS=($(yq "$APP_CONF_PATH.env_var.get | join(\" \")" $PROJECT_CONF))
PARAMS=($(yq "$APP_CONF_PATH.params | join(\" \")" $PROJECT_CONF))
ENABLE_API_AUTH=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.ENABLE_API_AUTH.default' $PROJECT_CONF)
ENABLE_NOTIFICATIONS=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.ENABLE_NOTIFICATIONS.default' $PROJECT_CONF)
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE="$APP_DIR_PATH/$ENV_FILE_NAME"
LOCAL_ADDRESS=$(yq '.env_var.set.LOCAL_ADDRESS.default' $PROJECT_CONF)
HOST="http://$LOCAL_ADDRESS"

# set CLIENT_URI and GRAPHQL_URI vars
source ./scripts/set-uri-vars.sh

function test_env_file() {
	if [[ ! -s $ENV_FILE ]]; then
		rm -f $ENV_FILE
		echo 'no env vars required'
	else
		echo 'env vars retrieved'
	fi
}

function set_default_values() {
	for s in "${SECRETS[@]}"; do
		if [[ "$s" == *'_URL' ]]; then
			SVC_NAME=$(printf '%s' "$s" | sed 's/_URL//')
			PORT_ENV_VAR="$SVC_NAME"_PORT
			PORT_VAL=$(yq "... | select(has(\"$PORT_ENV_VAR\")).$PORT_ENV_VAR.default" $PROJECT_CONF)
			echo "$s=$HOST:$PORT_VAL" >> $ENV_FILE
		elif [[ "$s" == 'GRAPHQL_URI' ]]; then # todo: change GRAPHQL_URI to GRAPHQL_URL
			SVC_NAME=$(printf '%s' "$s" | sed 's/_URI//')
			PORT_ENV_VAR="$SVC_NAME"_PORT
			PORT_VAL=$(yq "... | select(has(\"$PORT_ENV_VAR\")).$PORT_ENV_VAR.default" $PROJECT_CONF)
			if [[ $GITPOD_WORKSPACE_URL ]] || [[ $CODESPACES ]]; then
				echo "$s=$GRAPHQL_URI" >> $ENV_FILE
			else
				echo "$s=$HOST:$PORT_VAL" >> $ENV_FILE
			fi
		elif [[ "$s" == 'CLIENT_URI' ]]; then # todo: change CLIENT_URI to CLIENT_URL
			SVC_NAME=$(printf '%s' "$s" | sed 's/_URI//')
			PORT_ENV_VAR="$SVC_NAME"_PORT
			PORT_VAL=$(yq "... | select(has(\"$PORT_ENV_VAR\")).$PORT_ENV_VAR.default" $PROJECT_CONF)
			if [[ $GITPOD_WORKSPACE_URL ]] || [[ $CODESPACES ]]; then
				echo "$s=$CLIENT_URI" >> $ENV_FILE
			else
				echo "$s=$HOST:$PORT_VAL" >> $ENV_FILE
			fi
		else
			ENV_VAR=$(yq "... | select(has(\"$s\")).$s.default" $PROJECT_CONF)
			if [[ $ENV_VAR == 'null' ]]; then
				ENV_VAR=
			fi
			echo $s=$ENV_VAR >> $ENV_FILE
		fi
	done
}

function set_secrets() {
	for s in "${SECRETS[@]}"; do
		CONF_OBJ=$(yq "... | select(has(\"$s\")).$s" $PROJECT_CONF)
		if [[ $(echo "$CONF_OBJ" | yq .ssm) != 'null' ]]; then
			SSM_SUFFIX=$(yq "... | select(has(\"$s\")).$s.ssm" $PROJECT_CONF)
			ENV_VAR=$(aws ssm get-parameter \
				--name "/$ENV_ID/$SSM_VERSION/$ENV/$SSM_SUFFIX" \
				--query 'Parameter.Value' \
				--region $REGION \
				--with-decryption \
				--output text)
		else
			ENV_VAR=$(echo "$CONF_OBJ" | yq ".default")
		fi
		# lambdas sign their requests when a function name is detected
		# so this env var is set to 1 while integration testing from
		# a local machine or workflow
		if [[ $s == 'AWS_LAMBDA_FUNCTION_NAME' ]]; then
			ENV_VAR=1
		fi
		echo $s=$ENV_VAR >> $ENV_FILE
		unset ENV_VAR
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
if [[ $ENV == 'local' ]]; then
	set_default_values
else
	set_secrets
fi
set_params
test_env_file