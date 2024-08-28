#!/bin/bash

set -e

if [[ "$#" -gt 2 ]]; then
	echo "use: bash scripts/insert-transactions.sh --continue --mix"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
	case $1 in
	--continue) CONT=1 ;;
	--mix) MIX=1 ;;
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

function request() {
	local request="$1"
	# create transaction request
	TRANSACTION_ID=$(curl -s -H 'Content-Type: application/json' -d "$request" $REQUEST_CREATE_URL | yq '.transaction.id')
	# get debitor approver from user (NOT rule) added transaction item
	DEBITOR_APPROVER=$(echo -n "$request" | yq -I0 '[.transaction.transaction_items[] | select(.rule_instance_id == null)][0] | .debitor')
}

function approve() {
	# mock lambda input event
	APPROVAL="{\"auth_account\":\""$DEBITOR_APPROVER"\",\"id\":\""$TRANSACTION_ID"\",\"account_name\":\""$DEBITOR_APPROVER"\",\"account_role\":\"debitor\"}"
	# approve transaction request
	curl -s -H 'Content-Type: application/json' -d "$APPROVAL" $REQUEST_APPROVE_URL >/dev/null
	unset TRANSACTION_ID
	unset DEBITOR_APPROVER
}

# insert random transactions indefinitely
if [[ -n "$CONT" ]]; then
	if [[ -n "$MIX" ]]; then
		echo "*** adding a random mix of requests and transactions from $TEST_DATA_FILE indefinitely"
	else
		echo "*** adding transactions from $TEST_DATA_FILE indefinitely"
	fi

	# increase account balances to avoid insufficient balance error
	psql -U $PGUSER -d $PGDATABASE -h $PGHOST -c "UPDATE account_balance SET current_balance = 999999000 WHERE true;" >/dev/null

	while true; do
		RANDOM_INDEX=$((RANDOM % TEST_DATA_FILE_LENGTH))
		transaction=$(yq -I0 -o=json ".[$RANDOM_INDEX]" $TEST_DATA_FILE)
		request "$transaction"
		# skip approving odd transactions when mixing
		if [[ -n "$MIX" ]] && [[ $(("$TRANSACTION_ID" % 2)) -ne 0 ]]; then
			continue
		else
			approve
		fi
		# sleep for 100ms to avoid burdening cpu, e.g. 1000/4.5 minutes vs 1000/2.5 minutes without sleep
		sleep 0.1
	done
else # insert all transactions from testdata file
	if [[ -n "$MIX" ]]; then
		echo "*** adding a mix of requests and transactions from $TEST_DATA_FILE"
	else
		echo "*** adding transactions from $TEST_DATA_FILE"
	fi

	# insert all transactions from testdata file
	yq -I0 -o=json '.[]' $TEST_DATA_FILE | while IFS='\n' read transaction; do
		request "$transaction"
		# skip approving odd transactions when mixing
		if [[ -n "$MIX" ]] && [[ $(("$TRANSACTION_ID" % 2)) -ne 0 ]]; then
			continue
		else
			approve
		fi
	done

	echo ""

	if [[ -n "$MIX" ]]; then
		echo "*** $TEST_DATA_FILE_LENGTH requests and transactions (mixed) added from $TEST_DATA_FILE"
	else
		echo "*** $TEST_DATA_FILE_LENGTH transactions added from $TEST_DATA_FILE"
	fi
fi
