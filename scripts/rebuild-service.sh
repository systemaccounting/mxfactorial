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

PROJECT_CONFIG=project.json
COMPOSE_DIR=$(jq -r ".docker.compose.dir" $PROJECT_CONFIG)

GRAPHQL_URI=$(jq -r .env_var.GRAPHQL_URI.docker $PROJECT_CONFIG)
GRAPHQL_PORT=$(printf "$GRAPHQL_URI" | sed 's/http:\/\/localhost://')

if [[ $GITPOD_WORKSPACE_URL ]]; then
  ADDR=$(printf "$GITPOD_WORKSPACE_URL" | sed 's/https:\/\///')
  GRAPHQL_URI="https://${GRAPHQL_PORT}-${ADDR}"
fi

if [[ $CODESPACES ]]; then
	GRAPHQL_URI="https://${CODESPACE_NAME}-${GRAPHQL_PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
fi

if [[ $(uname -s) == "Darwin" ]]; then
  B64_GRAPHQL_URI=$(printf "$GRAPHQL_URI" | base64)
else
  B64_GRAPHQL_URI=$(printf "$GRAPHQL_URI" | base64 -w 0)
fi

COMPOSE_IGNORE_ORPHANS=true \
GRAPHQL_URI=$B64_GRAPHQL_URI \
	docker compose \
		${INCLUDE_DB} \
		-f $COMPOSE_DIR/compose.$NAME.yaml \
		up \
		-d \
		--force-recreate \
		--renew-anon-volumes \
		--no-deps \
		--build \
		$NAME