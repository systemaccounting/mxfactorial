#!/bin/bash

set -e

# print use
if [[ "$#" -ne 2 ]] && [[ "$#" -ne 3 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/rebuild-service.sh --name transactions-by-account # OPTIONAL: --no-db
	EOF
	exit 1
fi

INCLUDE_DB='-f ./docker/compose.bitnami-postgres.yaml'

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --name) NAME="$2"; shift ;;
        --no-db) unset INCLUDE_DB ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

COMPOSE_IGNORE_ORPHANS=true \
	docker compose \
		${INCLUDE_DB} \
		-f ./docker/compose.$NAME.yaml \
		up \
		-d \
		--force-recreate \
		--renew-anon-volumes \
		--no-deps \
		--build \
		$NAME