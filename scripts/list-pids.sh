#!/bin/bash

PROJECT_CONF=project.yaml

# custom IFS since process list entries have spaces
CUSTOM_IFS=$(yq '.scripts.env_var.set.CUSTOM_IFS.default' $PROJECT_CONF)

# local/devcontainer env
SERVICE_PROCESSES=($(yq ".scripts.env_var.set.SERVICE_PROCESSES.default | join(\"$CUSTOM_IFS\")" $PROJECT_CONF))
CLIENT_PROCESS=$(yq '.scripts.env_var.set.CLIENT_PROCESS.default' $PROJECT_CONF)

# workflows
CI_SERVICE_PROCESSES=($(yq ".scripts.env_var.set.CI_SERVICE_PROCESSES.default | join(\"$CUSTOM_IFS\")" $PROJECT_CONF))

# measure array length with yq since CUSTOM_IFS used
if [[ $CI ]]; then
	SIZE=($(yq '.scripts.env_var.set.CI_SERVICE_PROCESSES.default | length' $PROJECT_CONF))
else
	SIZE=($(yq '.scripts.env_var.set.SERVICE_PROCESSES.default | length' $PROJECT_CONF))
fi

declare GREP_ARGS

function create_grep_args() {
	local PROCESSES=("$@")
	PROCESSES+=($CUSTOM_IFS) # add IFS to terminate last index
	local COUNT=1

	while IFS='|' read -r -d '|' line; do
		# required to remove trailing whitespace added by terminating IFS in last index
		ADJUSTED="$line"
		if [[ $COUNT -eq $SIZE ]]; then
			ADJUSTED="${line::-1}" # remove trailing whitespace
		fi
		GREP_ARGS+="-e '$ADJUSTED' "
		COUNT=$(($COUNT+1))
	done < <(echo "${PROCESSES[@]}")

	GREP_ARGS="${GREP_ARGS::-1}" # removing trailing whitespace in last append
}

# calling create_grep_args appends to GREP_ARGS variable

if [[ $CI ]]; then # client not used in workflows
	create_grep_args "${CI_SERVICE_PROCESSES[@]}"
	ps aux | eval "grep $GREP_ARGS" | grep -v 'grep' | awk '{print $2}'
else
	create_grep_args "${SERVICE_PROCESSES[@]}"
	ps aux | eval "grep $GREP_ARGS" | grep -v 'grep' | awk '{len=split($14, a, "/"); print $2" "a[len-1]}'
	ps aux | eval "grep -e '$CLIENT_PROCESS'" | grep -v 'grep' | awk '{print $2" client"}'
fi