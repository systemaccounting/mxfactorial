#!/bin/bash

set -euo pipefail

# required env vars for postgres
: "${PGHOST:?PGHOST required}"
: "${PGPORT:?PGPORT required}"
: "${PGUSER:?PGUSER required}"
: "${PGPASSWORD:?PGPASSWORD required}"
: "${PGDATABASE:?PGDATABASE required}"

# required env vars for cache keys
: "${CACHE_KEY_RULES_STATE:?CACHE_KEY_RULES_STATE required}"
: "${CACHE_KEY_RULES_ACCOUNT:?CACHE_KEY_RULES_ACCOUNT required}"
: "${CACHE_KEY_PROFILE:?CACHE_KEY_PROFILE required}"
: "${CACHE_KEY_PROFILE_ID:?CACHE_KEY_PROFILE_ID required}"
: "${CACHE_KEY_APPROVERS:?CACHE_KEY_APPROVERS required}"

# determine cache backend: redis (local) or dynamodb (lambda)
if [[ -z "${AWS_LAMBDA_FUNCTION_NAME:-}" ]]; then
  CACHE_BACKEND="redis"
  : "${REDIS_HOST:?REDIS_HOST required for redis}"
  : "${REDIS_PORT:?REDIS_PORT required for redis}"
else
  CACHE_BACKEND="dynamodb"
  : "${TRANSACTION_DDB_TABLE:?TRANSACTION_DDB_TABLE required for dynamodb}"
fi

echo "using cache backend: $CACHE_BACKEND" 1>&2

DBCONN="host=$PGHOST port=$PGPORT user=$PGUSER password=$PGPASSWORD dbname=$PGDATABASE sslmode=disable"

function redis_set() {
  local key="$1"
  local value="$2"
  redis6-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" --no-auth-warning SET "$key" "$value" > /dev/null
}

function redis_sadd() {
  local key="$1"
  local value="$2"
  redis6-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" --no-auth-warning SADD "$key" "$value" > /dev/null
}

DDB_BATCH_FILE=$(mktemp)
DDB_BATCH_COUNT=0

function ddb_put() {
  local pk="$1"
  local sk="$2"
  local data="$3"
  local item="{\"PutRequest\":{\"Item\":{\"pk\":{\"S\":\"$pk\"},\"sk\":{\"S\":\"$sk\"},\"data\":{\"S\":$(printf '%s' "$data" | jq -Rs .)}}}}"

  if [[ $DDB_BATCH_COUNT -eq 0 ]]; then
    echo "$item" > "$DDB_BATCH_FILE"
  else
    echo ",$item" >> "$DDB_BATCH_FILE"
  fi
  DDB_BATCH_COUNT=$((DDB_BATCH_COUNT + 1))

  if [[ $DDB_BATCH_COUNT -ge 25 ]]; then
    ddb_flush
  fi
}

function ddb_flush() {
  if [[ $DDB_BATCH_COUNT -gt 0 ]]; then
    local items=$(cat "$DDB_BATCH_FILE" | tr -d '\n')
    aws dynamodb batch-write-item \
      --request-items "{\"$TRANSACTION_DDB_TABLE\":[$items]}" \
      > /dev/null
    DDB_BATCH_COUNT=0
    : > "$DDB_BATCH_FILE"
  fi
}

function cache_set() {
  local key="$1"
  local value="$2"
  if [[ "$CACHE_BACKEND" == "redis" ]]; then
    redis_set "$key" "$value"
  else
    ddb_put "$key" "_" "$value"
  fi
}

function cache_sadd() {
  local key="$1"
  local sk="$2"
  local value="$3"
  if [[ "$CACHE_BACKEND" == "redis" ]]; then
    redis_sadd "$key" "$value"
  else
    ddb_put "$key" "$sk" "$value"
  fi
}

# 1. cache state transaction item rules
echo "caching state transaction item rules..." 1>&2
TMPFILE=$(mktemp)
psql -d "$DBCONN" -t -A > "$TMPFILE" <<EOF
SELECT id, account_role, state_name, row_to_json(r)
FROM transaction_item_rule_instance r
WHERE state_name IS NOT NULL;
EOF
while IFS='|' read -r id account_role state_name json; do
  role_lower=$(echo "$account_role" | tr '[:upper:]' '[:lower:]')
  key="${CACHE_KEY_RULES_STATE}:${role_lower}:${state_name}"
  json=$(echo "$json" | jq -c 'del(.created_at) | .id |= tostring')
  cache_sadd "$key" "$id" "$json"
done < "$TMPFILE"
rm -f "$TMPFILE"
ddb_flush

# 2. cache approval rules by account
echo "caching approval rules..." 1>&2
TMPFILE=$(mktemp)
psql -d "$DBCONN" -t -A > "$TMPFILE" <<EOF
SELECT id, account_role, account_name, row_to_json(r)
FROM approval_rule_instance r;
EOF
while IFS='|' read -r id account_role account_name json; do
  role_lower=$(echo "$account_role" | tr '[:upper:]' '[:lower:]')
  key="${CACHE_KEY_RULES_ACCOUNT}:${role_lower}:${account_name}"
  json=$(echo "$json" | jq -c 'del(.created_at) | .id |= tostring')
  cache_sadd "$key" "$id" "$json"
done < "$TMPFILE"
rm -f "$TMPFILE"
ddb_flush

# 3. cache account profiles
echo "caching account profiles..." 1>&2
TMPFILE=$(mktemp)
psql -d "$DBCONN" -t -A > "$TMPFILE" <<EOF
SELECT row_to_json(ap) FROM account_profile ap;
EOF
while read -r row; do
  account_name=$(echo "$row" | jq -r '.account_name')
  key="${CACHE_KEY_PROFILE}:${account_name}"
  cache_set "$key" "$row"
done < "$TMPFILE"
rm -f "$TMPFILE"
ddb_flush

# 4. cache profile ids
echo "caching profile ids..." 1>&2
TMPFILE=$(mktemp)
psql -d "$DBCONN" -t -A -F $'\t' > "$TMPFILE" <<EOF
SELECT id, account_name FROM account_profile;
EOF
while IFS=$'\t' read -r id account_name; do
  key="${CACHE_KEY_PROFILE_ID}:${account_name}"
  cache_set "$key" "$id"
done < "$TMPFILE"
rm -f "$TMPFILE"
ddb_flush

# 5. cache account approvers
echo "caching account approvers..." 1>&2
TMPFILE=$(mktemp)
psql -d "$DBCONN" -t -A -F $'\t' > "$TMPFILE" <<EOF
SELECT owned_account, owner_account FROM account_owner WHERE owned_account IS NOT NULL AND owner_account IS NOT NULL;
EOF
while IFS=$'\t' read -r owned_account owner_account; do
  key="${CACHE_KEY_APPROVERS}:${owned_account}"
  cache_sadd "$key" "$owner_account" "$owner_account"
done < "$TMPFILE"
rm -f "$TMPFILE"
ddb_flush

rm -f "$DDB_BATCH_FILE"
echo "cache warming complete" 1>&2
