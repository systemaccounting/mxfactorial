#!/bin/bash

set -e

PROJECT_CONF=project.yaml
LOCAL_ADDRESS=$(yq '.env_var.set.LOCAL_ADDRESS.default' $PROJECT_CONF)
HOST="http://$LOCAL_ADDRESS"
REQUEST_CREATE_PORT=$(yq ".services.request-create.env_var.set.REQUEST_CREATE_PORT.default" $PROJECT_CONF)
REQUEST_CREATE_URL=$HOST:$REQUEST_CREATE_PORT
REQUEST_APPROVE_PORT=$(yq ".services.request-approve.env_var.set.REQUEST_APPROVE_PORT.default" $PROJECT_CONF)
REQUEST_APPROVE_URL=$HOST:$REQUEST_APPROVE_PORT
TEST_DATA_DIR=./tests/testdata
TEST_DATA_FILE_NAME=requests.json
TEST_DATA_FILE=$TEST_DATA_DIR/$TEST_DATA_FILE_NAME
MIGRATIONS_DIR=./migrations
TEST_ENV=dev
STARTING_TRANS_ID=3 # start from 3 since transaction id 1 & 2 are created by migrations/testseed

ENV_VAR_PATH='infrastructure.terraform.aws.modules.environment.env_var.set'
export PGDATABASE=$(yq ".${ENV_VAR_PATH}.PGDATABASE.default" $PROJECT_CONF)
export PGUSER=$(yq ".${ENV_VAR_PATH}.PGUSER.default" $PROJECT_CONF)
export PGPASSWORD=$(yq ".${ENV_VAR_PATH}.PGPASSWORD.default" $PROJECT_CONF)
export PGHOST=$(yq ".${ENV_VAR_PATH}.PGHOST.default" $PROJECT_CONF)
export PGPORT=$(yq ".${ENV_VAR_PATH}.PGPORT.default" $PROJECT_CONF)

# reset postgres in docker
(cd $MIGRATIONS_DIR; make resetdocker DB=test)
echo "*** finished migrations"

echo ""
echo "*** adding a mix of requests and transactions from $TEST_DATA_FILE"

TRANSACTION_ID=$STARTING_TRANS_ID

yq -I0 -o=json '.[]' $TEST_DATA_FILE | while IFS='\n' read transaction; do

	# create requests for each in tests/testdata/requests.json
	curl -s -H 'Content-Type: application/json' -d "$transaction" $REQUEST_CREATE_URL >/dev/null

	# approve every other request to create mix of requests and transactions
	if [[ $(("$TRANSACTION_ID"%2)) -eq 0 ]]; then

		# get debitor approver from user (NOT rule) added transaction item
		DEBITOR_APPROVER=$(echo -n "$transaction" | yq -I0 '[.transaction.transaction_items[] | select(.rule_instance_id == null)][0] | .debitor')

		# mock lambda input event
		APPROVAL="{\"auth_account\":\""$DEBITOR_APPROVER"\",\"id\":\""$TRANSACTION_ID"\",\"account_name\":\""$DEBITOR_APPROVER"\",\"account_role\":\"debitor\"}"

		# approve transaction request
		curl -s -H 'Content-Type: application/json' -d "$APPROVAL" $REQUEST_APPROVE_URL >/dev/null
	fi

	printf '%s' '.'

	TRANSACTION_ID=$((TRANSACTION_ID+1))
done

echo ""
echo "*** $(yq -o=json 'length' $TEST_DATA_FILE) requests and transactions (mixed) added from $TEST_DATA_FILE"