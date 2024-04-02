#!/bin/bash

# set B64_GRAPHQL_URI var
source ./scripts/set-uri-vars.sh

GRAPHQL_URI=$B64_GRAPHQL_URI \
	docker-compose \
		--log-level ERROR \
		-f ./docker/compose.yaml \
		build \
		client \
		--no-cache