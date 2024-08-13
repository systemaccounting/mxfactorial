#!/bin/bash

PROJECT_CONF=project.yaml

# custom IFS since process list entries have spaces
CUSTOM_IFS=$(yq '.scripts.env_var.set.CUSTOM_IFS.default' $PROJECT_CONF)

# services started by cargo-watch
SERVICE_PROCESSES=($(yq ".scripts.env_var.set.SERVICE_PROCESSES.default | join(\"$CUSTOM_IFS\")" $PROJECT_CONF))
SERVICE_PROCESSES+=($CUSTOM_IFS) # add IFS to terminate last index
SVC_LIST_SIZE=($(yq '.scripts.env_var.set.SERVICE_PROCESSES.default | length' $PROJECT_CONF))

# left over processes to term
ADDED_PROCESSES_TO_TERM=($(yq ".scripts.env_var.set.ADDED_PROCESSES_TO_TERM.default | join(\"$CUSTOM_IFS\")" $PROJECT_CONF))
ADDED_PROCESSES_TO_TERM+=($CUSTOM_IFS)
ADDED_LIST_SIZE=($(yq '.scripts.env_var.set.ADDED_PROCESSES_TO_TERM.default | length' $PROJECT_CONF))

# services started in workflows without cargo-watch
CI_SERVICE_PROCESSES=($(yq ".scripts.env_var.set.CI_SERVICE_PROCESSES.default | join(\"$CUSTOM_IFS\")" $PROJECT_CONF))
CI_SERVICE_PROCESSES+=($CUSTOM_IFS)
CI_SVC_LIST_SIZE=($(yq '.scripts.env_var.set.CI_SERVICE_PROCESSES.default | length' $PROJECT_CONF))

CLIENT_PROCESS=$(yq '.scripts.env_var.set.CLIENT_PROCESS.default' $PROJECT_CONF)

declare -a PATTERNS

if [[ $CI ]]; then
	# add ci processes to PATTERNS
	COUNT=1
	while IFS="$CUSTOM_IFS" read -r -d "$CUSTOM_IFS" line; do
		ADJUSTED="$line"
		if [[ $COUNT -eq $CI_SVC_LIST_SIZE ]]; then
			ADJUSTED="${line::-1}"
		fi
		PATTERNS+=("'$ADJUSTED'")
		COUNT=$(($COUNT+1))
	done < <(echo "${CI_SERVICE_PROCESSES[@]}")
else
	# add cargo-watch processes to PATTERNS when local/devcontainer
	COUNT=1
	while IFS="$CUSTOM_IFS" read -r -d "$CUSTOM_IFS" line; do
		ADJUSTED="$line" # remove trailing whitespace from last index
		if [[ $COUNT -eq $SVC_LIST_SIZE ]]; then
			ADJUSTED="${line::-1}"
		fi
		PATTERNS+=("'$ADJUSTED'")
		COUNT=$(($COUNT+1))
	done < <(echo "${SERVICE_PROCESSES[@]}")

	PATTERNS+=("'$CLIENT_PROCESS'") # add client process
fi

COUNT=1
while IFS="$CUSTOM_IFS" read -r -d "$CUSTOM_IFS" line; do
	ADJUSTED="$line"
	if [[ $COUNT -eq $ADDED_LIST_SIZE ]]; then
		ADJUSTED="${line::-1}"
	fi
	PATTERNS+=("'$ADJUSTED'")
	COUNT=$(($COUNT+1))
done < <(echo "${ADDED_PROCESSES_TO_TERM[@]}")

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

make --no-print-directory -C migrations clean # also stops redis in compose