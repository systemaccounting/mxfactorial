#!/bin/bash

# sets first digit of *_PORT env var values in project.yaml to 1 or 3, e.g. 30001 -> 10001 or 30001 -> 10001

if [[ "$#" -gt 1 ]]; then
	echo "use: bash scripts/set-k8s-ports.sh # OPTIONAL: --reset"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
	case $1 in
	--reset) RESET=1 ;;
	*)
		echo "unknown parameter passed: $1"
		exit 1
		;;
	esac
	shift
done

PROJECT_CONF=project.yaml

function set() {
	local one_or_three=$1

	if [[ "$one_or_three" != '1' && "$one_or_three" != '3' ]]; then
		echo "function set() requires one argument: 1 or 3"
		exit 1
	fi

	declare sed_arg
	declare pgport

	if [[ "$one_or_three" == '1' ]]; then
		sed_arg='s/^3/1/'
		pgport=5432
	else
		sed_arg='s/^1/3/'
		pgport=32345
	fi

	CONF_PORTS=($(bash scripts/list-env-vars.sh | grep _PORT))

	for port in "${CONF_PORTS[@]}"; do
		SVC_NAME=$(printf '%s' "$port" | sed 's/_PORT//')
		# switching redis port unnecessary
		if [[ "$SVC_NAME" == 'REDIS' ]]; then
			continue
		fi
		BASE_PATH=$(yq ".. | select(has(\"$port\")) | path | join(\".\")" $PROJECT_CONF)
		CONF_PATH=".$BASE_PATH.$SVC_NAME"_PORT.default
		CURR_PORT_VALUE=$(yq "$CONF_PATH" $PROJECT_CONF)
		export NEW_PORT_VALUE=$(printf '%s' "$CURR_PORT_VALUE" | sed "$sed_arg")
		yq -i "$CONF_PATH = env(NEW_PORT_VALUE)" $PROJECT_CONF
		unset NEW_PORT_VALUE
	done

	# set PGPORT separately to ./k8s/postgres-node-port.yml:spec.ports.containerPort
	yq -i ".infra.terraform.aws.modules.environment.env_var.set.PGPORT.default = $pgport" project.yaml

	# remove trailing newline if empty
	if [[ -z $(tail -c 1 $PROJECT_CONF) ]]; then
		truncate -s -1 $PROJECT_CONF
	fi
}

if [[ -n "$RESET" ]]; then
	set 1
else
	set 3
fi
