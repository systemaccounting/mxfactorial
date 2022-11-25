#!/bin/bash

set -e

# print use
if [[ "$#" -ne 8 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/remove-pending-test.sh \
		--app-or-pkg-name lambdapg \
		--sha ffac537e6cbbf934b08745a378932722df287a53 \
		--region us-east-1 \
		--env dev
	EOF
	exit 1
fi

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-or-pkg-name) TEST_TO_REMOVE="$2"; shift ;;
        --sha) GITHUB_SHA="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        --env) ENVIRONMENT="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

function error_exit() { printf '%s\n' "$*" >&2; exit 1; }

PROJECT_CONFIG=project.json

# test pkg or app name as available in project.json
IS_IN_PROJECT_JSON=$(jq "[.apps, .pkgs | keys] | flatten | any(. == \"$TEST_TO_REMOVE\")" $PROJECT_CONFIG)

# test for false value returned by jq any
if [[ "$IS_IN_PROJECT_JSON" == 'false' ]]; then
	# error when app or pkg not found in project.json
	printf '%s\n' "error: \"$TEST_TO_REMOVE\" NOT in $PROJECT_CONFIG. exiting." >&2
	exit 1
fi

# todo: add env-id
DDB_TABLE_NAME_PREFIX=$(jq -r '.github_workflows.dynamodb_table.name_prefix' $PROJECT_CONFIG)
DDB_TABLE="${DDB_TABLE_NAME_PREFIX}-${ENVIRONMENT}"
DDB_TABLE_HASH_KEY=$(jq -r '.github_workflows.dynamodb_table.hash_key' $PROJECT_CONFIG)
DDB_TABLE_PENDING_TESTS_ATTR=$(jq -r '.github_workflows.dynamodb_table.pending_tests_attribute' $PROJECT_CONFIG)
DDB_KEY="{\"$DDB_TABLE_HASH_KEY\":{\"S\":\"$GITHUB_SHA\"}}"
DDB_UPDATE_EXPRESSION="DELETE $DDB_TABLE_PENDING_TESTS_ATTR :p"
DDB_EXPRESSION_ATTR_VALUES="{\":p\": {\"SS\": [\"$TEST_TO_REMOVE\"]}}"

# get PendingTest item from dynamodb
DDB_RESPONSE=$(aws dynamodb get-item \
    --region "$REGION" \
    --table-name "$DDB_TABLE" \
    --key "$DDB_KEY")

# test for dynomodb item
if [[ -z $DDB_RESPONSE ]]; then
	# error on missing dynamodb item
	error_exit "error: $GITHUB_SHA GITHUB_SHA not found in dynamodb. exiting."
fi

# parse Item from dynamodb response
DDB_ITEM=$(echo "$DDB_RESPONSE" | jq ".Item")

# test for PendingTests Item json property
PENDING_TESTS_AVAILABLE=$(echo "$DDB_ITEM" | jq "keys | any(. == \"$DDB_TABLE_PENDING_TESTS_ATTR\")")

# test for false value returned from jq any
if [[ "$PENDING_TESTS_AVAILABLE" == 'false' ]]; then
	# error on missing PendingTests property
	error_exit "error: 0 pending tests available in $GITHUB_SHA GITHUB_SHA. exiting."
fi

# parse PendingTests json array as bash array
PENDING_TESTS=($(echo "$DDB_ITEM" | jq -r ".$DDB_TABLE_PENDING_TESTS_ATTR.SS | .[]" | xargs))

# create TEST_TO_REMOVE occurrence counter
COUNT=0
# loop through PENDING_TESTS received from dynamodb
for t in "${PENDING_TESTS[@]}"; do
	# count TEST_TO_REMOVE occurrence
	if [[ "$t" == "$TEST_TO_REMOVE" ]]; then
		COUNT=$(($COUNT+1))
	fi
	# test each PENDING_TESTS entry as available in project.json
	IS_IN_PROJECT_JSON=$(jq "[.apps, .pkgs | keys] | flatten | any(. == \"$t\")" $PROJECT_CONFIG)
	# test for false value returned from jq any
	if [[ "$IS_IN_PROJECT_JSON" == 'false' ]]; then
		# error on missing project.json entry for any PENDING_TESTS entry
		error_exit "error: \"$t\" NOT in $PROJECT_CONFIG. exiting."
	fi
done

# test for zero occurrences of TEST_TO_REMOVE in PENDING_TESTS
if [[ "$COUNT" -eq 0 ]]; then
	# error when TEST_TO_REMOVE not found in PENDING_TESTS
	printf 'PENDING: %s\n' "${PENDING_TESTS[@]}" >&2
	error_exit "error: \"$TEST_TO_REMOVE\" NOT in PENDING. remove workflow. exiting."
fi

# remove TEST_TO_REMOVE from PENDING_TESTS
# for example, if TEST_TO_REMOVE="lambdapg", PENDING_TESTS=["lambdapg","notify","request"]
# dynamodb updates PENDING_TESTS=["notify","request"]
UPDATED_RESPONSE=$(aws dynamodb update-item \
    --region "${REGION}" \
    --table-name "${DDB_TABLE}" \
    --key "$DDB_KEY" \
    --update-expression "$DDB_UPDATE_EXPRESSION" \
    --expression-attribute-values "$DDB_EXPRESSION_ATTR_VALUES" \
	--return-values ALL_NEW)

# parse updated Item from dynamodb response
UPDATED_DDB_ITEM=$(echo "$UPDATED_RESPONSE" | jq ".Attributes")

# test for PendingTests Item json property
PENDING_TESTS_AVAILABLE=$(echo "$UPDATED_DDB_ITEM" | jq "keys | any(. == \"$DDB_TABLE_PENDING_TESTS_ATTR\")")

# test for true value returned by jq any
if [[ "$PENDING_TESTS_AVAILABLE" == 'true' ]]; then

	# parse PendingTests json array as bash array
	PENDING_TESTS=($(echo "$UPDATED_DDB_ITEM" | jq -r ".$DDB_TABLE_PENDING_TESTS_ATTR.SS | .[]" | xargs))

	# printing PENDING_TESTS when NOT empty
	printf 'PENDING_TESTS: %s\n' "${PENDING_TESTS[@]}"
else
	echo "$0: 0 pending tests for $GITHUB_SHA GITHUB_SHA."
fi