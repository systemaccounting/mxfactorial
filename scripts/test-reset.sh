#!/bin/bash

set -euo pipefail

if [[ "$#" -gt 3 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/test-reset.sh --set
	bash scripts/test-reset.sh
	bash scripts/test-reset.sh --env dev --set
	bash scripts/test-reset.sh --env dev
	EOF
	exit 1
fi

SET_MODE=false

while [[ "$#" -gt 0 ]]; do
	case $1 in
	--env) ENV="$2"; shift ;;
	--set) SET_MODE=true ;;
	*)
		echo "unknown parameter passed: $1"
		exit 1
		;;
	esac
	shift
done

PROJECT_CONF=project.yaml
ENV_VAR_PATH='infra.terraform.aws.modules.environment.env_var.set'

if [[ -n "${ENV:-}" ]]; then
	REGION=$(yq ".${ENV_VAR_PATH}.REGION.default" $PROJECT_CONF)

	# skip SSM lookups when PG vars inherited from parent process
	if [[ -z "${PGHOST:-}" ]]; then
		ENV_ID=$(source scripts/print-env-id.sh)
		SSM_VERSION=$(yq ".${ENV_VAR_PATH}.SSM_VERSION.default" $PROJECT_CONF)
		SSM_PREFIX="$ENV_ID/$SSM_VERSION/$ENV"

		for VAR in PGDATABASE PGUSER PGPASSWORD PGHOST PGPORT; do
			SSM_SUFFIX=$(yq ".${ENV_VAR_PATH}.${VAR}.ssm" $PROJECT_CONF)
			export $VAR=$(aws ssm get-parameter \
				--name "/$SSM_PREFIX/$SSM_SUFFIX" \
				--query 'Parameter.Value' \
				--region $REGION \
				--with-decryption \
				--output text)
		done
	fi

	if [[ -n "${TRANSACTION_DDB_TABLE:-}" ]]; then
		DDB_TABLE="$TRANSACTION_DDB_TABLE"
	else
		if [[ -z "${SSM_PREFIX:-}" ]]; then
			ENV_ID=$(source scripts/print-env-id.sh)
			SSM_VERSION=$(yq ".${ENV_VAR_PATH}.SSM_VERSION.default" $PROJECT_CONF)
			SSM_PREFIX="$ENV_ID/$SSM_VERSION/$ENV"
		fi
		DDB_TABLE_SSM_SUFFIX=$(yq ".${ENV_VAR_PATH}.TRANSACTION_DDB_TABLE.ssm" $PROJECT_CONF)
		DDB_TABLE=$(aws ssm get-parameter \
			--name "/$SSM_PREFIX/$DDB_TABLE_SSM_SUFFIX" \
			--query 'Parameter.Value' \
			--region $REGION \
			--with-decryption \
			--output text)
	fi

	echo "*** cloud mode: $ENV"
else
	export PGDATABASE=$(yq ".${ENV_VAR_PATH}.PGDATABASE.default" $PROJECT_CONF)
	export PGUSER=$(yq ".${ENV_VAR_PATH}.PGUSER.default" $PROJECT_CONF)
	export PGPASSWORD=$(yq ".${ENV_VAR_PATH}.PGPASSWORD.default" $PROJECT_CONF)
	export PGHOST=$(yq ".${ENV_VAR_PATH}.PGHOST.default" $PROJECT_CONF)
	export PGPORT=$(yq ".${ENV_VAR_PATH}.PGPORT.default" $PROJECT_CONF)

	REDIS_PASSWORD=$(yq '.crates.cache.env_var.set.REDIS_PASSWORD.default' $PROJECT_CONF)
fi

DBCONN="host=$PGHOST port=$PGPORT user=$PGUSER password=$PGPASSWORD dbname=$PGDATABASE sslmode=disable"

if [[ "$SET_MODE" == true ]]; then
	# query initial max IDs and initial balance from postgres
	IFS='|' read -r APPROVAL_MAX TRANSACTION_ITEM_MAX TRANSACTION_MAX \
		ACCOUNT_PROFILE_MAX APPROVAL_RULE_INSTANCE_MAX ACCOUNT_OWNER_MAX \
		TRANSACTION_RULE_INSTANCE_MAX TRANSACTION_ITEM_RULE_INSTANCE_MAX \
		INITIAL_BALANCE <<< "$(psql -d "$DBCONN" -t -A <<'SQL'
SELECT
  (SELECT COALESCE(MAX(id), 0) FROM approval),
  (SELECT COALESCE(MAX(id), 0) FROM transaction_item),
  (SELECT COALESCE(MAX(id), 0) FROM transaction),
  (SELECT COALESCE(MAX(id), 0) FROM account_profile),
  (SELECT COALESCE(MAX(id), 0) FROM approval_rule_instance),
  (SELECT COALESCE(MAX(id), 0) FROM account_owner),
  (SELECT COALESCE(MAX(id), 0) FROM transaction_rule_instance),
  (SELECT COALESCE(MAX(id), 0) FROM transaction_item_rule_instance),
  (SELECT current_balance FROM account_balance LIMIT 1)
SQL
)"

	# store initial in cache
	if [[ -n "${ENV:-}" ]]; then
		for pair in \
			"approval|$APPROVAL_MAX" \
			"transaction_item|$TRANSACTION_ITEM_MAX" \
			"transaction|$TRANSACTION_MAX" \
			"account_profile|$ACCOUNT_PROFILE_MAX" \
			"approval_rule_instance|$APPROVAL_RULE_INSTANCE_MAX" \
			"account_owner|$ACCOUNT_OWNER_MAX" \
			"transaction_rule_instance|$TRANSACTION_RULE_INSTANCE_MAX" \
			"transaction_item_rule_instance|$TRANSACTION_ITEM_RULE_INSTANCE_MAX" \
			"initial_balance|$INITIAL_BALANCE"; do
			KEY="${pair%%|*}"
			VAL="${pair##*|}"
			aws dynamodb put-item \
				--table-name "$DDB_TABLE" \
				--item "{\"pk\":{\"S\":\"test_fixture:$KEY\"},\"sk\":{\"S\":\"_\"},\"val\":{\"N\":\"$VAL\"}}" \
				--region "$REGION" > /dev/null
		done
	else
		docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning MSET \
			test_fixture:approval "$APPROVAL_MAX" \
			test_fixture:transaction_item "$TRANSACTION_ITEM_MAX" \
			test_fixture:transaction "$TRANSACTION_MAX" \
			test_fixture:account_profile "$ACCOUNT_PROFILE_MAX" \
			test_fixture:approval_rule_instance "$APPROVAL_RULE_INSTANCE_MAX" \
			test_fixture:account_owner "$ACCOUNT_OWNER_MAX" \
			test_fixture:transaction_rule_instance "$TRANSACTION_RULE_INSTANCE_MAX" \
			test_fixture:transaction_item_rule_instance "$TRANSACTION_ITEM_RULE_INSTANCE_MAX" \
			test_fixture:initial_balance "$INITIAL_BALANCE" \
			> /dev/null
	fi

	echo "*** test fixture set"
	exit 0
fi

# read initial from cache
if [[ -n "${ENV:-}" ]]; then
	APPROVAL_MAX=$(aws dynamodb get-item --table-name "$DDB_TABLE" --key '{"pk":{"S":"test_fixture:approval"},"sk":{"S":"_"}}' --query 'Item.val.N' --region "$REGION" --output text)
	TRANSACTION_ITEM_MAX=$(aws dynamodb get-item --table-name "$DDB_TABLE" --key '{"pk":{"S":"test_fixture:transaction_item"},"sk":{"S":"_"}}' --query 'Item.val.N' --region "$REGION" --output text)
	TRANSACTION_MAX=$(aws dynamodb get-item --table-name "$DDB_TABLE" --key '{"pk":{"S":"test_fixture:transaction"},"sk":{"S":"_"}}' --query 'Item.val.N' --region "$REGION" --output text)
	ACCOUNT_PROFILE_MAX=$(aws dynamodb get-item --table-name "$DDB_TABLE" --key '{"pk":{"S":"test_fixture:account_profile"},"sk":{"S":"_"}}' --query 'Item.val.N' --region "$REGION" --output text)
	APPROVAL_RULE_INSTANCE_MAX=$(aws dynamodb get-item --table-name "$DDB_TABLE" --key '{"pk":{"S":"test_fixture:approval_rule_instance"},"sk":{"S":"_"}}' --query 'Item.val.N' --region "$REGION" --output text)
	ACCOUNT_OWNER_MAX=$(aws dynamodb get-item --table-name "$DDB_TABLE" --key '{"pk":{"S":"test_fixture:account_owner"},"sk":{"S":"_"}}' --query 'Item.val.N' --region "$REGION" --output text)
	TRANSACTION_RULE_INSTANCE_MAX=$(aws dynamodb get-item --table-name "$DDB_TABLE" --key '{"pk":{"S":"test_fixture:transaction_rule_instance"},"sk":{"S":"_"}}' --query 'Item.val.N' --region "$REGION" --output text)
	TRANSACTION_ITEM_RULE_INSTANCE_MAX=$(aws dynamodb get-item --table-name "$DDB_TABLE" --key '{"pk":{"S":"test_fixture:transaction_item_rule_instance"},"sk":{"S":"_"}}' --query 'Item.val.N' --region "$REGION" --output text)
	INITIAL_BALANCE=$(aws dynamodb get-item --table-name "$DDB_TABLE" --key '{"pk":{"S":"test_fixture:initial_balance"},"sk":{"S":"_"}}' --query 'Item.val.N' --region "$REGION" --output text)
else
	APPROVAL_MAX=$(docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning GET test_fixture:approval 2>/dev/null)
	TRANSACTION_ITEM_MAX=$(docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning GET test_fixture:transaction_item 2>/dev/null)
	TRANSACTION_MAX=$(docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning GET test_fixture:transaction 2>/dev/null)
	ACCOUNT_PROFILE_MAX=$(docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning GET test_fixture:account_profile 2>/dev/null)
	APPROVAL_RULE_INSTANCE_MAX=$(docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning GET test_fixture:approval_rule_instance 2>/dev/null)
	ACCOUNT_OWNER_MAX=$(docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning GET test_fixture:account_owner 2>/dev/null)
	TRANSACTION_RULE_INSTANCE_MAX=$(docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning GET test_fixture:transaction_rule_instance 2>/dev/null)
	TRANSACTION_ITEM_RULE_INSTANCE_MAX=$(docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning GET test_fixture:transaction_item_rule_instance 2>/dev/null)
	INITIAL_BALANCE=$(docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning GET test_fixture:initial_balance 2>/dev/null)
fi

# validate initial values exist
for VAL in "$APPROVAL_MAX" "$TRANSACTION_ITEM_MAX" "$TRANSACTION_MAX" \
	"$ACCOUNT_PROFILE_MAX" "$APPROVAL_RULE_INSTANCE_MAX" "$ACCOUNT_OWNER_MAX" \
	"$TRANSACTION_RULE_INSTANCE_MAX" "$TRANSACTION_ITEM_RULE_INSTANCE_MAX" \
	"$INITIAL_BALANCE"; do
	if [[ -z "$VAL" || "$VAL" == "(nil)" || "$VAL" == "None" ]]; then
		echo "*** error: fixture not set. run: bash scripts/test-reset.sh --set"
		exit 1
	fi
done

# delete test data (order matters for foreign keys)
psql -d "$DBCONN" -q -o /dev/null <<SQL
DELETE FROM approval WHERE id > $APPROVAL_MAX;
DELETE FROM transaction_item WHERE id > $TRANSACTION_ITEM_MAX;
DELETE FROM transaction WHERE id > $TRANSACTION_MAX;
DELETE FROM account_balance WHERE account_name = 'test_account';
SET session_replication_role = 'replica';
UPDATE account_balance SET current_balance = $INITIAL_BALANCE, current_transaction_item_id = NULL;
SET session_replication_role = 'origin';
DELETE FROM account_profile WHERE id > $ACCOUNT_PROFILE_MAX;
DELETE FROM approval_rule_instance WHERE id > $APPROVAL_RULE_INSTANCE_MAX;
DELETE FROM transaction_item_rule_instance WHERE id > $TRANSACTION_ITEM_RULE_INSTANCE_MAX;
DELETE FROM transaction_rule_instance WHERE id > $TRANSACTION_RULE_INSTANCE_MAX;
DELETE FROM account_owner WHERE owner_account = 'test_account';
DELETE FROM account WHERE name = 'test_account';

UPDATE approval SET approval_time = NULL WHERE rule_instance_id IS NULL AND id <= $APPROVAL_MAX;
UPDATE transaction_item SET debitor_approval_time = NULL WHERE id <= $TRANSACTION_ITEM_MAX;
UPDATE transaction SET equilibrium_time = NULL, event_time = NULL WHERE id <= $TRANSACTION_MAX;

SELECT setval('transaction_id_seq', $TRANSACTION_MAX);
SELECT setval('transaction_item_id_seq', $TRANSACTION_ITEM_MAX);
SELECT setval('approval_id_seq', $APPROVAL_MAX);
SELECT setval('approval_rule_instance_id_seq', $APPROVAL_RULE_INSTANCE_MAX);
SELECT setval('transaction_rule_instance_id_seq', GREATEST($TRANSACTION_RULE_INSTANCE_MAX, 1), $TRANSACTION_RULE_INSTANCE_MAX > 0);
SELECT setval('transaction_item_rule_instance_id_seq', GREATEST($TRANSACTION_ITEM_RULE_INSTANCE_MAX, 1), $TRANSACTION_ITEM_RULE_INSTANCE_MAX > 0);
SELECT setval('account_profile_id_seq', $ACCOUNT_PROFILE_MAX);
SELECT setval('account_owner_id_seq', $ACCOUNT_OWNER_MAX);
SQL

# flush date-prefixed gdp and accumulator keys from cache
if [[ -n "${ENV:-}" ]]; then
	# scan for gdp and accumulator keys then batch delete
	ITEMS=$(aws dynamodb scan \
		--table-name "$DDB_TABLE" \
		--filter-expression "contains(pk, :gdp) OR begins_with(pk, :acc) OR begins_with(pk, :appr)" \
		--expression-attribute-values '{":gdp":{"S":":gdp:"},":acc":{"S":"transaction_rule_instance:"},":appr":{"S":"rules:approval:"}}' \
		--projection-expression "pk, sk" \
		--region "$REGION" \
		--output json)

	COUNT=$(echo "$ITEMS" | yq '.Count')
	if [[ "$COUNT" -gt 0 ]]; then
		BATCH=$(echo "$ITEMS" | yq -o=json '[.Items[] | {"DeleteRequest":{"Key": .}}]')
		aws dynamodb batch-write-item \
			--request-items "{\"$DDB_TABLE\":$BATCH}" \
			--region "$REGION" > /dev/null
	fi
else
	approval_rule_keys=$(docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning KEYS 'rules:approval:*' 2>/dev/null | tr '\n' ' ')
	if [[ -n "$approval_rule_keys" ]]; then
		docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning DEL $approval_rule_keys > /dev/null
	fi
	gdp_keys=$(docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning KEYS '*:gdp:*' 2>/dev/null | tr '\n' ' ')
	if [[ -n "$gdp_keys" ]]; then
		docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning DEL $gdp_keys > /dev/null
	fi
	acc_keys=$(docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning KEYS 'transaction_rule_instance:*' 2>/dev/null | tr '\n' ' ')
	if [[ -n "$acc_keys" ]]; then
		docker exec mxf-redis-1 redis-cli -a "$REDIS_PASSWORD" --no-auth-warning DEL $acc_keys > /dev/null
	fi
fi

echo "*** test reset complete"
