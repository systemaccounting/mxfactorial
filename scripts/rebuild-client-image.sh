#!/bin/bash

# set B64_GRAPHQL_URI var
source ./scripts/set-uri-vars.sh

GRAPHQL_URI=$B64_GRAPHQL_URI \
	docker compose \
		-f ./docker/services.yaml \
		build \
		client \
		--no-cache