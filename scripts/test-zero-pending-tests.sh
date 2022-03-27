#!/bin/bash

set -e

# print use
if [[ "$#" -ne 6 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/test-zero-pending-tests.sh \
		--sha ffac537e6cbbf934b08745a378932722df287a53 \
		--region us-east-1 \
		--env dev
	EOF
	exit 1
fi

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --sha) GITHUB_SHA="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        --env) ENVIRONMENT="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

function error_exit() { printf '%s\n' "$*" >&2; exit 1; }

PROJECT_CONFIG=project.json
DDB_TABLE_NAME_PREFIX=$(jq -r '.github_workflows.dynamodb_table.name_prefix' $PROJECT_CONFIG)
DDB_TABLE="${DDB_TABLE_NAME_PREFIX}-${ENVIRONMENT}"
DDB_TABLE_HASH_KEY=$(jq -r '.github_workflows.dynamodb_table.hash_key' $PROJECT_CONFIG)
DDB_TABLE_PENDING_TESTS_ATTR=$(jq -r '.github_workflows.dynamodb_table.pending_tests_attribute' $PROJECT_CONFIG)
DDB_KEY='{"'"$DDB_TABLE_HASH_KEY"'":{"S":"'"$GITHUB_SHA"'"}}'

# get PendingTest item from dynamodb
DDB_RESPONSE=$(aws dynamodb get-item \
    --region "${REGION}" \
    --table-name "${DDB_TABLE}" \
    --key "${DDB_KEY}")

# test for dynomodb item
if [[ -z $DDB_RESPONSE ]]; then
	# error on missing dynamodb item
	error_exit "error: $GITHUB_SHA GITHUB_SHA not found in dynamodb. exiting."
fi

# parse Item from dynamodb response
DDB_ITEM=$(echo "$DDB_RESPONSE" | jq ".Item")

# test for PendingTests Item json property
PENDING_TESTS_AVAILABLE=$(echo "$DDB_ITEM" | jq "keys | any(. == \"$DDB_TABLE_PENDING_TESTS_ATTR\")")

# test for true value returned by jq any
if [[ "$PENDING_TESTS_AVAILABLE" == 'true' ]]; then

	# parse PendingTests json array as bash array
	PENDING_TESTS=($(echo "$DDB_ITEM" | jq -r ".$DDB_TABLE_PENDING_TESTS_ATTR.SS | .[]" | xargs))

	# error when PENDING_TESTS is NOT empty
	printf 'PENDING: %s\n' "${PENDING_TESTS[@]}" >&2
	error_exit "error: PENDING_TESTS remaining. add workflow(s). exiting."
else
	echo "$0: 0 pending tests for $GITHUB_SHA GITHUB_SHA."
fi