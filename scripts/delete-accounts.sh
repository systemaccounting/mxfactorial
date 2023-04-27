#!/bin/bash

APP_DIR_PATH=$(source scripts/list-dir-paths.sh --type app | grep --color=never auto-confirm)

TEST_ACCOUNTS_FILE=$(yq '.migrations.testseed.env_var.set.TEST_ACCOUNTS_FILE.default' project.yaml)

ACCOUNT_LIST=($(grep 'insert into account (name, p' "$TEST_ACCOUNTS_FILE" | cut -d "'" -f 2))

make -C "$APP_DIR_PATH" get-secrets ENV=dev

for a in "${ACCOUNT_LIST[@]}"; do
	make -C "$APP_DIR_PATH" rmuser ACC="$a"
done