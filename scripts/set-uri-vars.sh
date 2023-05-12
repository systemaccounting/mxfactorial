#!/bin/bash

# sourced in other scripts

PROJECT_CONF=project.yaml

LOCAL_ADDRESS=$(yq '.env_var.set.LOCAL_ADDRESS.default' $PROJECT_CONF)
HOST="http://$LOCAL_ADDRESS"

CLIENT_PORT=$(yq '.client.env_var.set.CLIENT_PORT.default' $PROJECT_CONF)
GRAPHQL_PORT=$(yq '.services.graphql.env_var.set.GRAPHQL_PORT.default' $PROJECT_CONF)

CLIENT_URI="$HOST:$CLIENT_PORT"
GRAPHQL_URI="$HOST:$GRAPHQL_PORT"

if [[ $GITPOD_WORKSPACE_URL ]]; then
	ADDR=$(echo "$GITPOD_WORKSPACE_URL" | sed 's/https:\/\///')
	CLIENT_URI="https://${CLIENT_PORT}-${ADDR}"
	GRAPHQL_URI="https://${GRAPHQL_PORT}-${ADDR}"
fi

if [[ $CODESPACES ]]; then
	CLIENT_URI="https://${CODESPACE_NAME}-${CLIENT_PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
	GRAPHQL_URI="https://${CODESPACE_NAME}-${GRAPHQL_PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
fi

if [[ $(uname -s) == "Darwin" ]]; then
  	B64_GRAPHQL_URI=$(printf "$GRAPHQL_URI" | base64)
else
  	B64_GRAPHQL_URI=$(printf "$GRAPHQL_URI" | base64 -w 0)
fi