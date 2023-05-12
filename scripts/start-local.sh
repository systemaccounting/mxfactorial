#!/bin/bash

PROJECT_CONF=project.yaml
NOHUP_LOG=$(yq '.env_var.set.NOHUP_LOG.default' $PROJECT_CONF)

make --no-print-directory -C migrations run

rm -f $NOHUP_LOG

APP_DIRS=($(yq '.. | select(has("local_dev") and .local_dev == true) | path | join("/")' $PROJECT_CONF))

for d in "${APP_DIRS[@]}"; do

	CONF_PATH=$(source scripts/dir-to-conf-path.sh "$d")
	RUNTIME=$(yq "$CONF_PATH.runtime" $PROJECT_CONF)

	if [[ "$RUNTIME" == 'provided.al2' ]]; then
		make --no-print-directory -C "$d" compile-dev
	fi

	make --no-print-directory -C "$d" dev

	unset RUNTIME
	unset CONF_PATH
done

if [[ $CODESPACES ]]; then
	GRAPHQL_PORT=$(yq '.services.graphql.env_var.set.GRAPHQL_PORT.default' $PROJECT_CONF)
	CLIENT_PORT=$(yq '.client.env_var.set.CLIENT_PORT.default' $PROJECT_CONF)
	gh codespace ports visibility $GRAPHQL_PORT:public -c "$CODESPACE_NAME"
	gh codespace ports visibility $CLIENT_PORT:public -c "$CODESPACE_NAME"
fi

tail -F $NOHUP_LOG