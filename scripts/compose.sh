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

PROJECT_CONFIG=project.json
COMPOSE_DIR=$(jq -r ".docker.compose.dir" $PROJECT_CONFIG)

UP_CMD="docker compose \\
  -f $COMPOSE_DIR/compose.bitnami-postgres.yaml \\
  -f $COMPOSE_DIR/compose.rules.yaml \\
  -f $COMPOSE_DIR/compose.request-create.yaml \\
  -f $COMPOSE_DIR/compose.request-approve.yaml \\
  -f $COMPOSE_DIR/compose.transaction-by-id.yaml \\
  -f $COMPOSE_DIR/compose.transactions-by-account.yaml \\
  -f $COMPOSE_DIR/compose.request-by-id.yaml \\
  -f $COMPOSE_DIR/compose.requests-by-account.yaml \\
  -f $COMPOSE_DIR/compose.balance-by-account.yaml \\
  -f $COMPOSE_DIR/compose.graphql.yaml \\
  -f $COMPOSE_DIR/compose.client.yaml \\
  up \\
  -d \\
  --renew-anon-volumes \\
  --force-recreate"

DOWN_CMD="docker compose \\
  -f $COMPOSE_DIR/compose.bitnami-postgres.yaml \\
  -f $COMPOSE_DIR/compose.rules.yaml \\
  -f $COMPOSE_DIR/compose.request-create.yaml \\
  -f $COMPOSE_DIR/compose.request-approve.yaml \\
  -f $COMPOSE_DIR/compose.transaction-by-id.yaml \\
  -f $COMPOSE_DIR/compose.transactions-by-account.yaml \\
  -f $COMPOSE_DIR/compose.request-by-id.yaml \\
  -f $COMPOSE_DIR/compose.requests-by-account.yaml \\
  -f $COMPOSE_DIR/compose.balance-by-account.yaml \\
  -f $COMPOSE_DIR/compose.graphql.yaml \\
  -f $COMPOSE_DIR/compose.client.yaml \\
  down"

if [[ $UP ]]; then

  if [[ $BUILD ]]; then
    UP_CMD=$(printf '%s \\\n  --build' "$UP_CMD")
  fi

	echo "$UP_CMD"
  echo ""
	eval "$UP_CMD"
fi

if [[ $DOWN ]]; then
	echo "$DOWN_CMD"
  echo ""
	eval "${DOWN_CMD}"
fi