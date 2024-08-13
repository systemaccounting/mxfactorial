#!/bin/bash

set -e

# print use
if [[ "$#" -ne 0 ]] && [[ "$#" -ne 1 ]]; then
	cat <<-'EOF'
		use:
		bash scripts/start-stop-redis.sh # OPTIONAL: --stop
	EOF
	exit 1
fi

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
	case $1 in
	--stop) STOP=1 ;;
	*)
		echo "unknown parameter passed: $1"
		exit 1
		;;
	esac
	shift
done

if [[ $STOP ]]; then
	COMPOSE_IGNORE_ORPHANS=true \
		docker compose \
		-f ./docker/compose.yaml \
		down
else
	COMPOSE_IGNORE_ORPHANS=true \
		docker compose \
		-f ./docker/compose.yaml \
		up \
		-d \
		redis \
		--renew-anon-volumes
fi