#!/bin/bash

# sourced in other scripts
# cde: cloud development environment

PROJECT_CONF=project.yaml
GRAPHQL_PORT=$(yq '.services.graphql.env_var.set.GRAPHQL_PORT.default' $PROJECT_CONF)
CLIENT_PORT=$(yq '.client.env_var.set.CLIENT_PORT.default' $PROJECT_CONF)

function publish_graphql_cde_port() {
	if [[ $CODESPACES ]]; then
		gh codespace ports visibility $GRAPHQL_PORT:public -c "$CODESPACE_NAME"
	fi
	if [[ $GITPOD_WORKSPACE_URL ]]; then
		gp ports visibility $GRAPHQL_PORT:public
	fi
}

function disable_graphql_cde_port() {
	if [[ $CODESPACES ]]; then
		gh codespace ports visibility $GRAPHQL_PORT:private -c "$CODESPACE_NAME"
	fi
	if [[ $GITPOD_WORKSPACE_URL ]]; then
		gp ports visibility $GRAPHQL_PORT:private
	fi
}

function publish_client_cde_port() {
	if [[ $CODESPACES ]]; then
		gh codespace ports visibility $CLIENT_PORT:publish -c "$CODESPACE_NAME"
	fi
	if [[ $GITPOD_WORKSPACE_URL ]]; then
		gp ports visibility $CLIENT_PORT:publish
	fi
}

function disable_client_cde_port() {
	if [[ $CODESPACES ]]; then
		gh codespace ports visibility $CLIENT_PORT:private -c "$CODESPACE_NAME"
	fi
	if [[ $GITPOD_WORKSPACE_URL ]]; then
		gp ports visibility $CLIENT_PORT:private
	fi
}


function publish_cde_ports() {
	publish_graphql_cde_port
	publish_client_cde_port
}

function disable_cde_ports() {
	disable_graphql_cde_port
	disable_client_cde_port
}