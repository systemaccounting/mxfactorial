#!/bin/bash

set -e

PROJECT_CONFIG=project.json
REQUEST_CREATE_URL=$(jq -r ".env_var.REQUEST_CREATE_URL.docker" $PROJECT_CONFIG)
REQUEST_APPROVE_URL=$(jq -r ".env_var.REQUEST_APPROVE_URL.docker" $PROJECT_CONFIG)
TEST_DATA_DIR=$(jq -r ".pkgs.testdata.path" $PROJECT_CONFIG)
TEST_DATA_FILE_NAME=requests.json
TEST_DATA_FILE=$TEST_DATA_DIR/$TEST_DATA_FILE_NAME
MIGRATIONS_DIR=./migrations
TEST_ENV=dev
STARTING_TRANS_ID=3 # start from 3 since transaction id 1 & 2 are created by migrations/testseed

export PGDATABASE=$(jq -r "env_var.PGDATABASE.docker" $PROJECT_CONFIG)
export PGUSER=$(jq -r "env_var.PGUSER.docker" $PROJECT_CONFIG)
export PGPASSWORD=$(jq -r "env_var.PGPASSWORD.docker" $PROJECT_CONFIG)
export PGHOST=$(jq -r "env_var.PGHOST.docker" $PROJECT_CONFIG)
export PGPORT=$(jq -r "env_var.PGPORT.docker" $PROJECT_CONFIG)

# reset postgres in docker
(cd $MIGRATIONS_DIR; make resetdocker DB=test)
echo "*** finished migrations"

echo ""
echo "*** adding a mix of requests and transactions from $TEST_DATA_FILE"

TRANSACTION_ID=$STARTING_TRANS_ID
jq -rc '.[]' $TEST_DATA_FILE | while IFS='\n' read transaction; do

	# create requests for each in ./reqsAndTrans.json
	curl -s -d "$transaction" $REQUEST_CREATE_URL >/dev/null

	# approve every other request to create mix of requests and transactions
	if [[ $(("$TRANSACTION_ID"%2)) -eq 0 ]]; then

		# get debitor approver from user (NOT rule) added transaction item
		DEBITOR_APPROVER=$(echo -n "$transaction" | jq -rc '[.transaction.transaction_items[] | select(.rule_instance_id == null)][0] | .debitor')

		# mock lambda input event
		APPROVAL="{\"auth_account\":\""$DEBITOR_APPROVER"\",\"id\":\""$TRANSACTION_ID"\",\"account_name\":\""$DEBITOR_APPROVER"\",\"account_role\":\"debitor\"}"

		# approve transaction request
		curl -s -d "$APPROVAL" $REQUEST_APPROVE_URL >/dev/null
	fi

	printf '%s' '.'

	TRANSACTION_ID=$((TRANSACTION_ID+1))
done

echo ""
echo "*** $(jq 'length' $TEST_DATA_FILE) requests and transactions (mixed) added from $TEST_DATA_FILE"