#!/bin/bash

set -e

# print use
if [[ "$#" -lt 8 ]] || [[ "$#" -gt 10 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/set-pending-tests.sh \
		--app-or-pkg-name tools \
		--sha ffac537e6cbbf934b08745a378932722df287a53 \
		--region us-east-1 \
		--env dev \
		--exclude-services

	OPTIONAL ARGS:
	"--exclude-services", excludes services from package dependents
	"--debug", prints variable contents
	EOF
	exit 1
fi

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-or-pkg-name) APP_OR_PKG_NAME="$2"; shift ;;
        --sha) GITHUB_SHA="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        --env) ENVIRONMENT="$2"; shift ;;
        --exclude-services) EXCLUDE_SERVICES=1 ;;
        --debug) DEBUG=1 ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

# prior art: https://stackoverflow.com/questions/2990414/echo-that-outputs-to-stderr#comment59599789_2990533
function error_exit() { printf '%s\n' "$*" >&2; exit 1; }

PROJECT_CONFIG=project.json
DYNAMODB_TTL_DAYS=$(jq -r '.github_workflows.dynamodb_table.ttl_days' $PROJECT_CONFIG)
DAY=$((60*60*24))
CURRENT_EPOCH=$(date +%s)
DYNAMODB_TTL_EPOCH=$(($CURRENT_EPOCH + $DYNAMODB_TTL_DAYS * $DAY))

# test if in project.json apps
IS_APP_IN_PROJECT_JSON=$(jq ".apps | keys | any(. == \"$APP_OR_PKG_NAME\")" $PROJECT_CONFIG)
# test if in project.json pkgs
IS_PKG_IN_PROJECT_JSON=$(jq ".pkgs | keys | any(. == \"$APP_OR_PKG_NAME\")" $PROJECT_CONFIG)

# test if jq any found app
if [[ "$IS_APP_IN_PROJECT_JSON" == 'true' ]]; then
	# get list of CHANGED_SVCS dirs
	source ./scripts/list-changed-svcs.sh --pkg-name "$APP_OR_PKG_NAME"
	# set CHANGED_DIRS to CHANGED_SVCS
	CHANGED_DIRS=("${CHANGED_SVCS[@]}")
# test if jq any found pkg
elif [[ "$IS_PKG_IN_PROJECT_JSON" == 'true' ]]; then
	# get list of IMPORTING_PKG_DIRS
	source ./scripts/list-changed-pkgs.sh --pkg-name "$APP_OR_PKG_NAME"
	# set IMPORTING_PKG_DIRS to CHANGED_SVCS
	CHANGED_DIRS=("${IMPORTING_PKG_DIRS[@]}")

	# include services if EXCLUDE_SERVICES is NOT set
	if [[ -z "$EXCLUDE_SERVICES" ]]; then
		# get list of CHANGED_SVCS
		source ./scripts/list-changed-svcs.sh --pkg-name "$APP_OR_PKG_NAME"
		# add CHANGED_SVCS to CHANGED_DIRS
		CHANGED_DIRS+=("${CHANGED_SVCS[@]}")
	fi
else
	# error when script arg not found in project.json apps or pkgs
	error_exit "error: \"$APP_OR_PKG_NAME\" is NOT in $PROJECT_CONFIG. exiting."
fi

# create PENDING_TESTS array
declare -a PENDING_TESTS
for d in "${CHANGED_DIRS[@]}"; do
	# add app or package name to PENDING_TESTS array
	PENDING_TESTS+=($(basename $d))
done

if [[ -n "$DEBUG" ]]; then
	echo "PENDING_TESTS: ${#PENDING_TESTS[@]}"
	printf '%s\n' "${PENDING_TESTS[@]}"
	echo ""
fi

if [[ "${#PENDING_TESTS[@]}" -eq 0 ]]; then
	error_exit "error: 0 tests pending for \"$APP_OR_PKG_NAME\". exiting."
fi

# convert array from bash to json
JSON_ARRAY=$(jq --compact-output --null-input '$ARGS.positional' --args "${PENDING_TESTS[@]}")

DDB_TABLE_NAME_PREFIX=$(jq -r '.github_workflows.dynamodb_table.name_prefix' $PROJECT_CONFIG)
DDB_TABLE="${DDB_TABLE_NAME_PREFIX}-${ENVIRONMENT}"
DDB_TABLE_HASH_KEY=$(jq -r '.github_workflows.dynamodb_table.hash_key' $PROJECT_CONFIG)
DDB_TABLE_PENDING_TESTS_ATTR=$(jq -r '.github_workflows.dynamodb_table.pending_tests_attribute' $PROJECT_CONFIG)
DDB_TABLE_TTL_ATTR=$(jq -r '.github_workflows.dynamodb_table.ttl_attribute' $PROJECT_CONFIG)
ITEM="{\"$DDB_TABLE_HASH_KEY\":{\"S\":"\"$GITHUB_SHA"\"},\"$DDB_TABLE_PENDING_TESTS_ATTR\":{\"SS\":$JSON_ARRAY},\"ttl\":{\"N\":\"$DYNAMODB_TTL_EPOCH\"}}"

# put PendingTests item in dynamodb as string set
# https://github.com/awsdocs/amazon-dynamodb-developer-guide/blob/master/doc_source/HowItWorks.NamingRulesDataTypes.md#sets
aws dynamodb put-item \
	--region "$REGION" \
	--table-name "$DDB_TABLE" \
	--item "$ITEM"