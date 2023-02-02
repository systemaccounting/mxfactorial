#!/bin/bash

# set B64_GRAPHQL_URI var
source ./scripts/set-uri-vars.sh

PROJECT_CONFIG=project.json
COMPOSE_DIR=$(jq -r ".docker.compose.dir" $PROJECT_CONFIG)

GRAPHQL_URI=$B64_GRAPHQL_URI \
	docker compose \
		-f $COMPOSE_DIR/compose.client.yaml \
		build \
		--no-cache