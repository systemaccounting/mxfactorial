#!/bin/bash

set -e

if [[ "$#" -ne 4 ]]; then
	echo "use: bash scripts/create-env.sh --app-name request-create --env dev"
	exit 1
fi

# https://stackoverflow.com/a/33826763
while [[ "$#" -gt 0 ]]; do
	case $1 in
	--app-name)
		APP_NAME="$2"
		shift
		;;
	--env)
		ENV="$2"
		shift
		;;
	*)
		echo "unknown parameter passed: $1"
		exit 1
		;;
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
	if [[ ! -f '.env' ]] && [[ -z $ENV_ID ]]; then
		echo 'set ENV_ID variable in project root .env or make build-dev to build a cloud dev environment'
		exit 1
	fi
	ENV_ID=$(source scripts/print-env-id.sh)
fi

SSM_VERSION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.SSM_VERSION.default' $PROJECT_CONF)
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
SECRETS=($(yq "$APP_CONF_PATH.env_var.get | join(\" \")" $PROJECT_CONF))
PARAMS=($(yq "$APP_CONF_PATH.params | join(\" \")" $PROJECT_CONF))
ENABLE_API_AUTH=$(yq '.infra.terraform.aws.modules.environment.env_var.set.ENABLE_API_AUTH.default' $PROJECT_CONF)
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE="$APP_DIR_PATH/$ENV_FILE_NAME"
LOCAL_ADDRESS=$(yq '.env_var.set.LOCAL_ADDRESS.default' $PROJECT_CONF)

# set CLIENT_URI and GRAPHQL_URI vars
source ./scripts/set-uri-vars.sh

function set_default_value() {
	local SECRET="$1"
	if [[ "$SECRET" == *'_URL' ]]; then
		SVC_NAME=$(printf '%s' "$SECRET" | sed 's/_URL//')
		PORT_ENV_VAR="$SVC_NAME"_PORT
		PORT_VAL=$(yq "... | select(has(\"$PORT_ENV_VAR\")).$PORT_ENV_VAR.default" $PROJECT_CONF)
		echo "$SECRET=$LOCAL_ADDRESS:$PORT_VAL" >>$ENV_FILE
	elif [[ "$SECRET" == 'GRAPHQL_URI' ]]; then # todo: change GRAPHQL_URI to GRAPHQL_URL
		SVC_NAME=$(printf '%s' "$SECRET" | sed 's/_URI//')
		PORT_ENV_VAR="$SVC_NAME"_PORT
		PORT_VAL=$(yq "... | select(has(\"$PORT_ENV_VAR\")).$PORT_ENV_VAR.default" $PROJECT_CONF)
		if [[ $GITPOD_WORKSPACE_URL ]] || [[ $CODESPACES ]]; then
			echo "$SECRET=$GRAPHQL_URI" >>$ENV_FILE
		else
			echo "$SECRET=$LOCAL_ADDRESS:$PORT_VAL" >>$ENV_FILE
		fi
	elif [[ "$SECRET" == 'GRAPHQL_SUBSCRIPTIONS_URI' ]]; then
		SVC_NAME=$(printf '%s' "$SECRET" | sed 's/_SUBSCRIPTIONS_URI//')
		PORT_ENV_VAR="$SVC_NAME"_PORT
		PORT_VAL=$(yq "... | select(has(\"$PORT_ENV_VAR\")).$PORT_ENV_VAR.default" $PROJECT_CONF)
		# todo: handle in scripts/set-uri-vars.sh
		if [[ $GITPOD_WORKSPACE_URL ]] || [[ $CODESPACES ]]; then
			echo "$SECRET=$GRAPHQL_URI" >>$ENV_FILE
		else
			echo "$SECRET=$LOCAL_ADDRESS:$PORT_VAL/ws" >>$ENV_FILE
		fi
	elif [[ "$SECRET" == 'CLIENT_URI' ]]; then # todo: change CLIENT_URI to CLIENT_URL
		SVC_NAME=$(printf '%s' "$SECRET" | sed 's/_URI//')
		PORT_ENV_VAR="$SVC_NAME"_PORT
		PORT_VAL=$(yq "... | select(has(\"$PORT_ENV_VAR\")).$PORT_ENV_VAR.default" $PROJECT_CONF)
		if [[ $GITPOD_WORKSPACE_URL ]] || [[ $CODESPACES ]]; then
			echo "$SECRET=$CLIENT_URI" >>$ENV_FILE
		else
			echo "$SECRET=$LOCAL_ADDRESS:$PORT_VAL" >>$ENV_FILE
		fi
	elif [[ "$SECRET" == 'RUST_LOG' ]]; then
		RUST_LOG_VAL=$(yq "$APP_CONF_PATH.rust_log" $PROJECT_CONF)
		echo "$SECRET=$RUST_LOG_VAL" >>$ENV_FILE
	else
		ENV_VAR=$(yq "... | select(has(\"$SECRET\")).$SECRET.default" $PROJECT_CONF)
		if [[ $ENV_VAR == 'null' ]]; then
			ENV_VAR=
		fi
		echo $SECRET=$ENV_VAR >>$ENV_FILE
	fi

	# add sveltekit PORT assignment for client vite build:
	# https://svelte.dev/docs/kit/adapter-node#Environment-variables-PORT-HOST-and-SOCKET_PATH
	if [[ "$SECRET" == 'CLIENT_PORT' ]] && [[ "$APP_NAME" == 'client' ]]; then
		echo "PORT=$CLIENT_PORT" >>$ENV_FILE
	fi

	unset ENV_VAR
	unset SECRET
}

function set_secret() {
	local SECRET="$1"
	CONF_OBJ=$(yq "... | select(has(\"$SECRET\")).$SECRET" $PROJECT_CONF)
	if [[ $(echo "$CONF_OBJ" | yq .ssm) != 'null' ]]; then
		SSM_SUFFIX=$(yq "... | select(has(\"$SECRET\")).$SECRET.ssm" $PROJECT_CONF)
		ENV_VAR=$(aws ssm get-parameter \
			--name "/$ENV_ID/$SSM_VERSION/$ENV/$SSM_SUFFIX" \
			--query 'Parameter.Value' \
			--region $REGION \
			--with-decryption \
			--output text)
	else
		ENV_VAR=$(echo "$CONF_OBJ" | yq ".default")
	fi
	echo $s=$ENV_VAR >>$ENV_FILE
	unset ENV_VAR
	unset SECRET
}

function set_params() {
	for p in ${PARAMS[@]}; do
		if [[ $p == 'AWS_REGION' ]]; then
			echo $p=$REGION >>$ENV_FILE
		elif [[ $p == 'ENABLE_API_AUTH' ]]; then
			echo ENABLE_API_AUTH=$ENABLE_API_AUTH >>$ENV_FILE
		fi
	done
}

if [[ -f $ENV_FILE ]] && grep -q "^ENV_ID=" $ENV_FILE; then
	ENV_ID=$(grep "ENV_ID=" $ENV_FILE | cut -d'=' -f2)
	ADD_BACK=1
fi

rm -f $ENV_FILE

for s in "${SECRETS[@]}"; do
	if [[ $ENV == 'local' ]]; then
		if [[ "$s" == 'AWS_LAMBDA_FUNCTION_NAME' ]]; then
			continue # skip setting when ENV=local
		fi
		set_default_value "$s"
	else
		set_secret "$s"
	fi
done

# add ENV_ID back if was removed
if [[ $ADD_BACK ]]; then
	echo ENV_ID=$ENV_ID >>$ENV_FILE
fi

set_params

# ytt requires yaml format
# convert $ENV_FILE to yaml if k8s dir is an $ENV_FILE substring
if [[ $ENV_FILE == *'k8s/'* ]]; then
	if [[ $(uname) == 'Darwin' ]]; then
		sed -i '' 's/=/: /' $ENV_FILE
	else
		sed -i 's/=/: /' $ENV_FILE
	fi
fi

if [[ ! -s $ENV_FILE ]]; then
	rm -f $ENV_FILE
	echo 'no env vars required'
else
	echo 'env vars retrieved'
fi
