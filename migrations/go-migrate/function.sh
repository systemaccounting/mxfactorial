function handler () {
  EVENT_DATA=$1

  # avoid using identically named variables in sourced migrate script

  # if EVENT_DATA has branch property, then assign variables from object root
  if [[ $(echo $EVENT_DATA | jq -r '.branch') != "null" ]]; then
    BRANCH=$(echo $EVENT_DATA | jq -r '.branch')
    DATABASE_TYPE=$(echo $EVENT_DATA | jq -r '.db_type')
    MIGRATE_CMD=$(echo $EVENT_DATA | jq -r '.cmd')
    PASSPHRASE=$(echo $EVENT_DATA | jq -r '.passphrase')
  else
    # parse escaped variables from body string
    BODY=$(echo $EVENT_DATA | jq -r '.body')
    BRANCH=$(echo $BODY | jq -r '.branch')
    DATABASE_TYPE=$(echo $BODY | jq -r '.db_type')
    MIGRATE_CMD=$(echo $BODY | jq -r '.cmd')
    PASSPHRASE=$(echo $BODY | jq -r '.passphrase')
  fi

  CLONE_DIR="/tmp/mxfactorial"
  MIGRATE_DIR="$CLONE_DIR/migrations"

  if [[ "$PASSPHRASE" != "$GO_MIGRATE_PASSPHRASE" ]]; then
    # add cloudwatch logs from custom runtime lambda by redirecting stdout to stderr
    echo "unmatched passphrase" 1>&2;
    exit 1
  fi

  # clean up previous invoke
  rm -rf /tmp/mxfactorial

  # clone repo
  git clone --branch $BRANCH --depth 1 https://github.com/systemaccounting/mxfactorial "$CLONE_DIR"

  # migrate using files from cloned repo
  source ./migrate.sh --dir "$MIGRATE_DIR" --db_type "$DATABASE_TYPE" --cmd "$MIGRATE_CMD"

  RESPONSE="branch: $BRANCH, db_type: $DATABASE_TYPE, cmd: $MIGRATE_CMD"

  echo $RESPONSE
}