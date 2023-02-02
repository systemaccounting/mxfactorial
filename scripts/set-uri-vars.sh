#!/bin/bash

# sourced in other scripts

PROJECT_CONFIG=project.json

HOST=http://localhost

CLIENT_PORT=$(jq -r .env_var.CLIENT_URI.docker $PROJECT_CONFIG | sed 's/http:\/\/localhost://')
GRAPHQL_PORT=$(jq -r .env_var.GRAPHQL_URI.docker $PROJECT_CONFIG | sed 's/http:\/\/localhost://')

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