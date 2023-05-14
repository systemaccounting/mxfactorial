#!/bin/bash

PROJECT_CONF=project.yaml

SERVICE_PROCESSES=($(yq '.scripts.env_var.set.SERVICE_PROCESSES.default | join("|")' $PROJECT_CONF))
LIST_SIZE=$(yq '.scripts.env_var.set.SERVICE_PROCESSES.default | length' $PROJECT_CONF)
CLIENT_PROCESS=($(yq '.scripts.env_var.set.CLIENT_PROCESS.default' $PROJECT_CONF))
SERVICE_PROCESSES+=("|") # add IFS to terminate last index

declare -a SVC_PATTERNS

COUNT=1
while IFS='|' read -r -d '|' line; do
	ADJUSTED="$line" # removing trailing whitespace to last index
	if [[ $COUNT -eq $LIST_SIZE ]]; then
		ADJUSTED="${line::-1}"
	fi
	SVC_PATTERNS+=("'$ADJUSTED'")
	COUNT=$(($COUNT+1))
done < <(echo "${SERVICE_PROCESSES[@]}")

PATTERNS=("${SVC_PATTERNS[@]}" "'$CLIENT_PROCESS'" "'go-build'" "'npm run dev'" "'npm run build'" "'vite build'" "'tail -F'")

source ./scripts/manage-cde-ports.sh
disable_cde_ports

function stop() {
	for pid in $(ps aux | eval "grep -e $1" | grep -v 'grep' | awk '{print $2}'); do
		kill "$pid" > /dev/null 2>&1 || true;
	done
}

for p in "${PATTERNS[@]}"; do
	stop "$p"
done

make --no-print-directory -C migrations clean