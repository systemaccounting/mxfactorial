#!/bin/bash

set -e

if [[ "$#" -ne 0 ]] && [[ "$#" -ne 1 ]]; then
	echo "use: bash scripts/insert-transactions.sh --continue"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
	case $1 in
	--continue) CONT=1 ;;
	*)
		echo "unknown parameter passed: $1"
		exit 1
		;;
	esac
	shift
done

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
TEST_DATA_FILE_LENGTH=$(yq -o=json 'length' $TEST_DATA_FILE)
MIGRATIONS_DIR=./migrations
TEST_ENV=dev

ENV_VAR_PATH='infrastructure.terraform.aws.modules.environment.env_var.set'
export PGDATABASE=$(yq ".${ENV_VAR_PATH}.PGDATABASE.default" $PROJECT_CONF)
export PGUSER=$(yq ".${ENV_VAR_PATH}.PGUSER.default" $PROJECT_CONF)
export PGPASSWORD=$(yq ".${ENV_VAR_PATH}.PGPASSWORD.default" $PROJECT_CONF)
export PGHOST=$(yq ".${ENV_VAR_PATH}.PGHOST.default" $PROJECT_CONF)
export PGPORT=$(yq ".${ENV_VAR_PATH}.PGPORT.default" $PROJECT_CONF)

# reset postgres in docker
(
	cd $MIGRATIONS_DIR
	make resetdocker DB=test
)
echo "*** finished migrations"

echo ""

function transact() {
	local transaction="$1"
	# create requests for each in tests/testdata/requests.json
	TRANSACTION_ID=$(curl -s -H 'Content-Type: application/json' -d "$transaction" $REQUEST_CREATE_URL | yq '.transaction.id')

	# approve every other request to create mix of requests and transactions
	if [[ $(("$TRANSACTION_ID" % 2)) -eq 0 ]]; then

		# get debitor approver from user (NOT rule) added transaction item
		DEBITOR_APPROVER=$(echo -n "$transaction" | yq -I0 '[.transaction.transaction_items[] | select(.rule_instance_id == null)][0] | .debitor')

		# mock lambda input event
		APPROVAL="{\"auth_account\":\""$DEBITOR_APPROVER"\",\"id\":\""$TRANSACTION_ID"\",\"account_name\":\""$DEBITOR_APPROVER"\",\"account_role\":\"debitor\"}"

		# approve transaction request
		curl -s -H 'Content-Type: application/json' -d "$APPROVAL" $REQUEST_APPROVE_URL >/dev/null
	fi
}

# continue inserting random transactions from testdata file indefinitely
if [[ -n "$CONT" ]]; then
	echo "*** adding a random mix of requests and transactions from $TEST_DATA_FILE indefinitely"
	# increase account balances to avoid insufficient balance error
	psql -U $PGUSER -d $PGDATABASE -h $PGHOST -c "UPDATE account_balance SET current_balance = 999999000 WHERE true;" >/dev/null
	while true; do
		RANDOM_INDEX=$((RANDOM % TEST_DATA_FILE_LENGTH))
		transaction=$(yq -I0 -o=json ".[$RANDOM_INDEX]" $TEST_DATA_FILE)
		transact "$transaction"
	done
else
	echo "*** adding a mix of requests and transactions from $TEST_DATA_FILE"
	# insert all transactions from testdata file
	yq -I0 -o=json '.[]' $TEST_DATA_FILE | while IFS='\n' read transaction; do
		transact "$transaction"
		printf '%s' '.'
	done
	echo ""
	echo "*** $(yq -o=json 'length' $TEST_DATA_FILE) requests and transactions (mixed) added from $TEST_DATA_FILE"
fi
