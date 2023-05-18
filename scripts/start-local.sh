#!/bin/bash

PROJECT_CONF=project.yaml
NOHUP_LOG=$(yq '.env_var.set.NOHUP_LOG.default' $PROJECT_CONF)
GRAPHQL_PORT=$(yq '.services.graphql.env_var.set.GRAPHQL_PORT.default' $PROJECT_CONF)
CLIENT_PORT=$(yq '.client.env_var.set.CLIENT_PORT.default' $PROJECT_CONF)
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
source ./scripts/manage-cde-ports.sh

GREEN='\033[0;32m'
RED='\033[1;31m'
YELLOW='\033[0;33m'
RESET='\033[0m'

docker version > /dev/null 2>&1
if [[ $? -ne 0 ]]; then
	echo -e "${RED}docker required. start docker${RESET}"
	exit 1
fi

set -e # exit when docker login not configured

make --no-print-directory -C migrations start

set +e

rm -f $NOHUP_LOG

APP_DIRS=($(yq '.. | select(has("local_dev") and .local_dev == true) | path | join("/")' $PROJECT_CONF))

for d in "${APP_DIRS[@]}"; do

	unset BUILD_SRC_PATH
	unset RUNTIME
	unset CONF_PATH

	CONF_PATH=$(source scripts/dir-to-conf-path.sh "$d")
	RUNTIME=$(yq "$CONF_PATH.runtime" $PROJECT_CONF)
	BUILD_SRC_PATH=$(yq "$CONF_PATH.build_src_path" $PROJECT_CONF)

	# use non shared make target to avoid cross build for rust
	if [[ "$RUNTIME" == 'provided.al2' ]]; then
		echo -e -n "\n${GREEN}*** compiling $d${RESET}\n"
		make --no-print-directory -C "$d" compile-dev
	fi

	# skip starting client in workflows
	if [[ "$CI" ]] && [[ "$d" == 'client' ]]; then
		continue
	fi

	echo -e -n "\n${GREEN}*** starting $d${RESET}\n"

	if [[ "$CI" ]]; then
		make --no-print-directory -C "$d" get-secrets ENV=local > /dev/null
		# &; \ disown fails in make so backgrounding kept in bash
		if [[ "$RUNTIME" == 'provided.al2' ]]; then
			(cd "$d"; eval $(cat $ENV_FILE_NAME) cargo run > /dev/null 2>&1 & disown $!)
		fi
		if [[ "$RUNTIME" == 'go1.x' ]]; then
			(cd "$d"; eval $(cat $ENV_FILE_NAME) go run ./$BUILD_SRC_PATH > /dev/null 2>&1 & disown $!)
		fi
	else
		make --no-print-directory -C "$d" start
	fi

	# publish graphql port when developing in cloud dev env
	if [[ "$d" == 'services/graphql' ]]; then
		publish_graphql_cde_port
	fi

	# publish client port when developing in cloud dev env
	if [[ "$d" == 'client' ]]; then
		publish_client_cde_port
	fi
done