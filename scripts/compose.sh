#!/bin/bash

USE="use:
bash scripts/compose.sh --up # OPTIONAL --build
OR
bash scripts/compose.sh --down"

if [[ "$#" -eq 0 ]] || [[ "$#" -gt 2 ]]; then
	echo "$USE"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --up) UP=1 ;;
        --down) DOWN=1 ;;
        --build) BUILD=1 ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

if [[ -n $UP ]] && [[ -n $DOWN ]]; then
	echo "$USE"
	exit 1
fi

# set B64_GRAPHQL_URI var
source ./scripts/set-uri-vars.sh

# source functions to manage cloud development environment ports
source ./scripts/manage-cde-ports.sh

COMPOSE_DIR=./docker

INIT_CMD="GRAPHQL_URI=$B64_GRAPHQL_URI \\
docker compose \\
  -f $COMPOSE_DIR/compose.bitnami-postgres.yaml \\
  -f $COMPOSE_DIR/compose.rule.yaml \\
  -f $COMPOSE_DIR/compose.request-create.yaml \\
  -f $COMPOSE_DIR/compose.request-approve.yaml \\
  -f $COMPOSE_DIR/compose.transaction-by-id.yaml \\
  -f $COMPOSE_DIR/compose.transactions-by-account.yaml \\
  -f $COMPOSE_DIR/compose.request-by-id.yaml \\
  -f $COMPOSE_DIR/compose.requests-by-account.yaml \\
  -f $COMPOSE_DIR/compose.balance-by-account.yaml \\
  -f $COMPOSE_DIR/compose.graphql.yaml \\
  -f $COMPOSE_DIR/compose.client.yaml"

if [[ $UP ]]; then

  UP_CMD=$(printf '%s \\\n  up \\\n  -d \\\n  --renew-anon-volumes' "$INIT_CMD")

  if [[ $BUILD ]]; then
    UP_CMD=$(printf '%s \\\n  --build' "$UP_CMD")
  fi

	echo "$UP_CMD"
  echo ""
	eval "$UP_CMD"
  publish_cde_ports
  exit 0
fi

if [[ $BUILD ]]; then

  BUILD_CMD=$(printf '%s \\\n  build' "$INIT_CMD")

  echo "$BUILD_CMD"
  echo ""
	eval "$BUILD_CMD"
fi

if [[ $DOWN ]]; then

  DOWN_CMD=$(printf '%s \\\n  down' "$INIT_CMD")

	echo "$DOWN_CMD"
  echo ""
	eval "${DOWN_CMD}"
  disable_cde_ports
fi