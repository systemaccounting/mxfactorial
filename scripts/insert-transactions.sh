#!/bin/bash

set -e

PROJECT_CONFIG=project.json
CONFIG_DB_PROPERTY=postgres
REQ_CREATE_DIR=$(jq -r ".apps.\"request-create\".path" $PROJECT_CONFIG)
REQ_APPROVE_DIR=$(jq -r ".apps.\"request-approve\".path" $PROJECT_CONFIG)
TEST_DATA_DIR=$(jq -r ".pkgs.testdata.path" $PROJECT_CONFIG)
TEST_DATA_FILE_NAME=requests.json
TEST_DATA_FILE=$TEST_DATA_DIR/$TEST_DATA_FILE_NAME
MIGRATIONS_DIR=./migrations
TEST_ENV=dev
STARTING_TRANS_ID=3 # start from 3 since transaction id 1 & 2 are created by migrations/testseed

export PGDATABASE=$(jq -r ".$CONFIG_DB_PROPERTY.pgdatabase" $PROJECT_CONFIG)
export PGUSER=$(jq -r ".$CONFIG_DB_PROPERTY.pguser" $PROJECT_CONFIG)
export PGPASSWORD=$(jq -r ".$CONFIG_DB_PROPERTY.pgpassword" $PROJECT_CONFIG)
export PGHOST=$(jq -r ".$CONFIG_DB_PROPERTY.pghost" $PROJECT_CONFIG)
export PGPORT=$(jq -r ".$CONFIG_DB_PROPERTY.pgport" $PROJECT_CONFIG)

# reset postgres in docker
(cd $MIGRATIONS_DIR; make resetdocker DB=test)
echo "*** finished migrations"

echo ""
echo "*** adding a mix of requests and transactions from $TEST_DATA_FILE"

# create services/request-create/.env file if not available
if [[ ! -f $REQ_CREATE_DIR/.env ]]; then
	(cd $REQ_CREATE_DIR; make get-secrets ENV=$TEST_ENV)
fi

# create services/request-approve/.env file if not available
if [[ ! -f $REQ_APPROVE_DIR/.env ]]; then
	(cd $REQ_APPROVE_DIR; make get-secrets ENV=$TEST_ENV)
fi

TRANSACTION_ID=$STARTING_TRANS_ID
jq -rc '.[]' $TEST_DATA_FILE | while IFS='\n' read transaction; do

	# create requests for each in ./reqsAndTrans.json
	(cd $REQ_CREATE_DIR; TEST_EVENT="$transaction" eval $(cat .env) go run ./cmd/main.go)

	# approve every other request to create mix of requests and transactions
	if [[ $(("$TRANSACTION_ID"%2)) -eq 0 ]]; then

		# get debitor approver from user (NOT rule) added transaction item
		DEBITOR_APPROVER=$(echo -n "$transaction" | jq -rc '[.transaction.transaction_items[] | select(.rule_instance_id == null)][0] | .debitor')

		# mock lambda input event
		TEST_EVENT="{\"auth_account\":\""$DEBITOR_APPROVER"\",\"id\":\""$TRANSACTION_ID"\",\"account_name\":\""$DEBITOR_APPROVER"\",\"account_role\":\"debitor\"}"

		# approve transaction request
		(cd $REQ_APPROVE_DIR; TEST_EVENT="$TEST_EVENT" eval $(cat .env) go run ./cmd/main.go)

	fi

	TRANSACTION_ID=$((TRANSACTION_ID+1))
done

echo "*** $(jq 'length' $TEST_DATA_FILE) requests and transactions (mixed) added from $TEST_DATA_FILE"