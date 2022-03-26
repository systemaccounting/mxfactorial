#!/bin/bash

set -e

if [[ "$#" -ne 4 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/set-codecov-flags.sh \
	        --app-or-pkg-name request-create \
	        --test-type unittest

	OPTIONAL "--test-type" args:
	1. unittest
	2. integration
	3. ui
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-or-pkg-name) APP_OR_PKG_NAME="$2"; shift ;;
        --test-type) TEST_TYPE="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json

IS_IN_PROJECT_JSON=$(jq "[.apps, .pkgs | keys] | flatten | any(. == \"$APP_OR_PKG_NAME\")" $PROJECT_CONFIG)
TEST_TYPES=(unittest integration ui)

if [[ "$IS_IN_PROJECT_JSON" == 'false' ]]; then
	echo "\"$APP_OR_PKG_NAME\" NOT in $PROJECT_CONFIG. exiting"
	exit 1
fi

COUNT=0
for t in "${TEST_TYPES[@]}"; do
	if [[ "$t" == "$TEST_TYPE" ]]; then
		COUNT=$(($COUNT+1))
	fi
done

if [[ "$COUNT" -eq 0 ]]; then
	echo "\"$TEST_TYPE\" not standard \"${TEST_TYPES[@]}\" codecov coverage flag. exiting"
	exit 1
fi

if [[ "$CI" == 'true' ]]; then
	echo "CODECOV_FLAGS=$APP_OR_PKG_NAME,$TEST_TYPE" >> $GITHUB_ENV
fi