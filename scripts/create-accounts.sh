#!/bin/bash

APP_OR_PKG_NAME=auto-confirm

PROJECT_CONFIG=project.json

# source commonly used functions
source ./scripts/shared-error.sh

# set PROJECT_JSON_PROPERTY variable
source ./scripts/shared-set-property.sh

# set DIR_PATH variable
source ./scripts/shared-set-dir-path.sh

MIGRATION_FILE=$(jq -r '.cognito.test_accounts_file' "$PROJECT_CONFIG")

ACCOUNT_LIST=($(grep 'insert into account (name, p' "$MIGRATION_FILE" | cut -d "'" -f 2))

make -C "$DIR_PATH" get-secrets ENV=dev

for a in "${ACCOUNT_LIST[@]}"; do
	make -C "$DIR_PATH" createuser ACC="$a"
done