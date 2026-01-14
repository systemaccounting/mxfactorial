#!/bin/bash

set -e

# print use
if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/rebuild-service.sh --name transactions-by-account
	EOF
	exit 1
fi


# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --name) NAME="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

# set B64_GRAPHQL_URI var
source ./scripts/set-uri-vars.sh

COMPOSE_IGNORE_ORPHANS=true \
GRAPHQL_URI=$B64_GRAPHQL_URI \
	docker compose \
		-f ./docker/services.yaml \
		up \
		-d \
		--force-recreate \
		--renew-anon-volumes \
		--build \
		$NAME