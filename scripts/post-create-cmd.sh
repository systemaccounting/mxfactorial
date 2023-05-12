#!/bin/bash

# used as postCreateCommand in .devcontainer.json

PROJECT_CONF=project.yaml
GRAPHQL_PORT=$(yq '.services.graphql.env_var.set.GRAPHQL_PORT.default' $PROJECT_CONF)
CLIENT_PORT=$(yq '.client.env_var.set.CLIENT_PORT.default' $PROJECT_CONF)

go mod download

# https://github.com/evanw/esbuild/issues/1819#issuecomment-1018771557
rm -rf client/node_modules

if [[ $CODESPACES ]]; then
	source ./scripts/rebuild-client-image.sh
fi

make compose-up

if [[ $CODESPACES ]]; then
	gh codespace ports visibility $GRAPHQL_PORT:public -c "$CODESPACE_NAME"
	gh codespace ports visibility $CLIENT_PORT:public -c "$CODESPACE_NAME"
fi