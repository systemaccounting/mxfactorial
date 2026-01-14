#!/bin/bash

PROJECT_CONF=project.yaml

function list_pids() {
	local pattern="$1"
	local label="$2"
	if [[ -n "$label" ]]; then
		ps aux | grep -e "$pattern" | grep -v 'grep' | awk -v lbl="$label" '{print $2" "lbl}'
	else
		# extract service name from env file path like services/request-create/.env
		ps aux | grep -e "$pattern" | grep -v 'grep' | awk '{len=split($14, a, "/"); print $2" "a[len-1]}'
	fi
}

if [[ $CI ]]; then
	while IFS= read -r pattern; do
		list_pids "$pattern"
	done < <(yq -r '.scripts.env_var.set.CI_SERVICE_PROCESSES.default[]' $PROJECT_CONF)
else
	while IFS= read -r pattern; do
		list_pids "$pattern"
	done < <(yq -r '.scripts.env_var.set.SERVICE_PROCESSES.default[]' $PROJECT_CONF)

	# client process
	list_pids "$(yq -r '.scripts.env_var.set.CLIENT_PROCESS.default' $PROJECT_CONF)" "client"
fi
