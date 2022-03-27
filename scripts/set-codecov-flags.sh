#!/bin/bash

set -e

# print use
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

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-or-pkg-name) APP_OR_PKG_NAME="$2"; shift ;;
        --test-type) TEST_TYPE="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

function error_exit() { printf '%s\n' "$*" >&2; exit 1; }

PROJECT_CONFIG=project.json

# test if app or pkg in project.json
IS_IN_PROJECT_JSON=$(jq "[.apps, .pkgs | keys] | flatten | any(. == \"$APP_OR_PKG_NAME\")" $PROJECT_CONFIG)

# test for false value returned by jq any
if [[ "$IS_IN_PROJECT_JSON" == 'false' ]]; then
	# error and exit if jq any didnt find app or pkg in package.json
	error_exit "\"$APP_OR_PKG_NAME\" NOT in $PROJECT_CONFIG. exiting"
fi

# get standard codecov flags from project.json
TEST_TYPES=($(jq -r '.github_workflows.codecov.flags | .[]' $PROJECT_CONFIG | xargs))

# create counter for occurrences of standard codecov flags
COUNT=0
# loop over standard codecov flags
for t in "${TEST_TYPES[@]}"; do
	# match codecov flag passed as script arg to
	# current entry of standard codecov flag
	if [[ "$t" == "$TEST_TYPE" ]]; then
		# increment counter
		COUNT=$(($COUNT+1))
	fi
done

# test for 0 standard codecov flags found
if [[ "$COUNT" -eq 0 ]]; then
	# error and exit if 0 standard codecov flags found
	error_exit "\"$TEST_TYPE\" not standard \"${TEST_TYPES[@]}\" codecov coverage flag set in $PROJECT_CONFIG. exiting"
fi

# test for github workflow environment variable
if [[ "$CI" == 'true' ]]; then
	# set CODECOV_FLAGS variable to 1) app or pkg name, and
	# 2) standard codecov flag in github workflow environment
	echo "CODECOV_FLAGS=$APP_OR_PKG_NAME,$TEST_TYPE" >> $GITHUB_ENV
fi