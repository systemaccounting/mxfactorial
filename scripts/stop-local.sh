#!/bin/bash

PROJECT_CONF=project.yaml

source ./scripts/manage-cde-ports.sh
disable_cde_ports

function stop() {
	for pid in $(ps aux | grep -e "$1" | grep -v 'grep' | awk '{print $2}'); do
		kill "$pid" > /dev/null 2>&1 || true
	done
}

# kill service processes
if [[ $CI ]]; then
	while IFS= read -r pattern; do
		stop "$pattern"
	done < <(yq -r '.scripts.env_var.set.CI_SERVICE_PROCESSES.default[]' $PROJECT_CONF)
else
	while IFS= read -r pattern; do
		stop "$pattern"
	done < <(yq -r '.scripts.env_var.set.SERVICE_PROCESSES.default[]' $PROJECT_CONF)

	# client process
	stop "$(yq -r '.scripts.env_var.set.CLIENT_PROCESS.default' $PROJECT_CONF)"
fi

# additional processes
while IFS= read -r pattern; do
	stop "$pattern"
done < <(yq -r '.scripts.env_var.set.ADDED_PROCESSES_TO_TERM.default[]' $PROJECT_CONF)

docker compose -f docker/storage.yaml down
