#!/bin/bash

PROJECT_CONF=project.yaml
REQUIRED_PID_COUNT=$(yq '.scripts.env_var.set.REQUIRED_PID_COUNT.default' $PROJECT_CONF)
REQUIRED_CI_PID_COUNT=$(($REQUIRED_PID_COUNT-1))
LOCAL_RESTART_LIMIT=$(yq '.scripts.env_var.set.LOCAL_RESTART_LIMIT.default' $PROJECT_CONF)
RESTART_COUNT=1
RESTART_SLEEP_SECONDS=$(yq '.scripts.env_var.set.RESTART_SLEEP_SECONDS.default' $PROJECT_CONF)
RED='\033[0;31m'
RESET='\033[0m'

source ./scripts/start-local.sh

sleep "$RESTART_SLEEP_SECONDS"

function restart() {
	unset REQ_PID_COUNT
	local REQ_PID_COUNT="$1"
	while [[ "$(make --no-print-directory list-pids | wc -l | xargs)" -lt "$REQ_PID_COUNT" ]] && [[ "$RESTART_COUNT" -le "$LOCAL_RESTART_LIMIT" ]]; do
		RESTARTS=$(($LOCAL_RESTART_LIMIT-$RESTART_COUNT+1))
		echo -e -n  "\n${RED}*** only "$(make --no-print-directory list-pids | wc -l | xargs)" apps started when $REQ_PID_COUNT required. $RESTARTS restart(s) left before exiting. list of started apps:${RESET}\n"
		make --no-print-directory list-pids
		source ./scripts/stop-local.sh
		source ./scripts/start-local.sh
		sleep "$RESTART_SLEEP_SECONDS"
		RESTART_COUNT=$(($RESTART_COUNT+1))
	done
	if [[ "$(make --no-print-directory list-pids | wc -l | xargs)" -lt "$REQ_PID_COUNT" ]]; then
		echo -e -n  "\n${RED}*** only "$(make --no-print-directory list-pids | wc -l | xargs)" apps started when $REQ_PID_COUNT required. list of started apps:${RESET}\n\n"
		make --no-print-directory list-pids
		echo -e -n  "\n${RED}*** \"make stop-dev && make dev\" in a separate shell to try again${RESET}\n"
	fi
}

if [[ $CI ]]; then # -1, client not required in workflows
	restart "$REQUIRED_CI_PID_COUNT"
else
	restart "$REQUIRED_PID_COUNT"
	echo -e -n "\n${YELLOW}*** OPEN a shell and leave this one to follow logs in project root ${NOHUP_LOG}. \"make stop-dev\" in a separate shell to tear down${RESET}\n"
	tail -F "$NOHUP_LOG"
fi