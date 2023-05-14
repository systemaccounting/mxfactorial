#!/bin/bash

PROJECT_CONF=project.yaml
SERVICE_PROCESSES=($(yq '.scripts.env_var.set.SERVICE_PROCESSES.default | join("|")' $PROJECT_CONF))
LIST_SIZE=$(yq '.scripts.env_var.set.SERVICE_PROCESSES.default | length' $PROJECT_CONF)
CLIENT_PROCESS=($(yq '.scripts.env_var.set.CLIENT_PROCESS.default' $PROJECT_CONF))
SERVICE_PROCESSES+=("|") # add IFS to terminate last index

declare GREP_ARGS

COUNT=1
while IFS='|' read -r -d '|' line; do
	ADJUSTED="$line" # removing trailing whitespace in last index
	if [[ $COUNT -eq $LIST_SIZE ]]; then
		ADJUSTED="${line::-1}"
	fi
	GREP_ARGS+="-e '$ADJUSTED' "
	COUNT=$(($COUNT+1))
done < <(echo "${SERVICE_PROCESSES[@]}")

GREP_ARGS="${GREP_ARGS::-1}" # removing trailing whitespace in last append


ps aux | eval "grep $GREP_ARGS" | grep -v 'grep' | awk '{len=split($14, a, "/"); print $2" "a[len-1]}'
ps aux | eval "grep -e '$CLIENT_PROCESS'" | grep -v 'grep' | awk '{print $2" client"}'