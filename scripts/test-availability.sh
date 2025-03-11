#!/bin/bash

# send GET /healthz to each lambda to warm up before tests

set -e

PROJECT_CONF=project.yaml
TESTS_DIR=tests
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE=$TESTS_DIR/$ENV_FILE_NAME
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

# string manipulation required so simply sourcing ./tests/.env not an option
READINESS_CHECK_PATH=$(yq '.infra.terraform.aws.modules.environment.env_var.set.READINESS_CHECK_PATH.default' $PROJECT_CONF)

# list services in integration tests
SERVICES=($(bash scripts/list-deployments.sh | grep --color=never -e transact -e request -e rule -e graphql | xargs basename -a))

# test for availability of each *_URL variable assignment in tests/.env
for SERVICE in "${SERVICES[@]}"; do
	HYPHENED_URL_VAR="${SERVICE^^}_URL"
	URL_VAR="${HYPHENED_URL_VAR//-/_}"

	# exception for GRAPHQL_URI
	if [[ "$URL_VAR" == "GRAPHQL_URL" ]]; then
		URL_VAR="GRAPHQL_URI"
	fi

	if ! grep -q "$URL_VAR" $ENV_FILE; then
		echo "$URL_VAR not found in $ENV_FILE"
		exit 1
	fi

	# get URL value
	URL=$(grep "$URL_VAR" $ENV_FILE | cut -d '=' -f 2)

	# support local integration tests if used to prove service availability
	# add missing http prefix to local values
	if [[ ! $URL == http* ]]; then
		URL="http://$URL"
	fi

	# remove trailing slash
	URL=${URL%/}

	HEALTH_CHECK_URL="${URL}${READINESS_CHECK_PATH}"

	# use awscurl if REGION in URL
	if [[ $URL == *"$REGION"* ]]; then
		echo "testing $SERVICE lambda availability"
		awscurl -XGET --service lambda -H 'Content-Type: application/json' $HEALTH_CHECK_URL
	else
		curl -XGET $HEALTH_CHECK_URL
	fi
done