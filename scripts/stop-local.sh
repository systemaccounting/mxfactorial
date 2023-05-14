#!/bin/bash

PROJECT_CONF=project.yaml
GRAPHQL_PORT=$(yq '.services.graphql.env_var.set.GRAPHQL_PORT.default' $PROJECT_CONF)
CLIENT_PORT=$(yq '.client.env_var.set.CLIENT_PORT.default' $PROJECT_CONF)
source ./scripts/manage-cde-ports.sh

disable_cde_ports

PATTERNS=(
	'debug/rule'
	'go run'
	'go-build'
	'cargo-watch'
	'npm run dev'
	'npm run build'
	'.bin/vite'
	'vite build'
	'tail -F'
)

function stop() {
	for pid in $(ps aux | grep -e "$1" | grep -v 'grep' | awk '{print $2}'); do
		kill "$pid" > /dev/null 2>&1 || true;
	done
}

for p in "${PATTERNS[@]}"; do
	stop "$p"
done

make --no-print-directory -C migrations clean