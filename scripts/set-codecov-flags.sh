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

PROJECT_CONF=project.yaml

# test if app or pkg in project.yaml
if [[ $(bash scripts/list-dir-paths.sh --type all | grep --color=never "$APP_OR_PKG_NAME$" >/dev/null 2>&1; echo $?) -ne 0 ]]; then
  error_exit "\"$APP_OR_PKG_NAME\" NOT in $PROJECT_CONF. exiting."
fi

# get standard codecov flags from project.yaml
TEST_TYPES=($(yq '.[".github"].codecov.flags | join(" ")' $PROJECT_CONF))

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
	error_exit "\"$TEST_TYPE\" not standard \"${TEST_TYPES[@]}\" codecov coverage flag set in $PROJECT_CONF. exiting"
fi

# test for github workflow environment variable
if [[ "$CI" == 'true' ]]; then
	# set CODECOV_FLAGS variable to 1) app or pkg name, and
	# 2) standard codecov flag in github workflow environment
	echo "CODECOV_FLAGS=$APP_OR_PKG_NAME,$TEST_TYPE" >> $GITHUB_ENV
fi