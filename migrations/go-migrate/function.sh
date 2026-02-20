function handler () {
  EVENT_DATA=$1

  # avoid using identically named variables in sourced migrate script

  # if EVENT_DATA has body property, parse from body string (function url)
  # otherwise assign variables from object root (lambda invoke)
  if [[ $(echo $EVENT_DATA | jq -r '.body') != "null" ]]; then
    BODY=$(echo $EVENT_DATA | jq -r '.body')
    SUBDIRS=$(echo $BODY | jq -r '.subdirs')
    MIGRATE_CMD=$(echo $BODY | jq -r '.cmd')
    PASSPHRASE=$(echo $BODY | jq -r '.passphrase')
  else
    SUBDIRS=$(echo $EVENT_DATA | jq -r '.subdirs')
    MIGRATE_CMD=$(echo $EVENT_DATA | jq -r '.cmd')
    PASSPHRASE=$(echo $EVENT_DATA | jq -r '.passphrase')
  fi

  MIGRATE_DIR="/var/task/migrations"

  if [[ "$PASSPHRASE" != "$GO_MIGRATE_PASSPHRASE" ]]; then
    # add cloudwatch logs from custom runtime lambda by redirecting stdout to stderr
    echo "unmatched passphrase" 1>&2;
    exit 1
  fi

  # migrate using baked-in migrations
  source ./migrate.sh --dir "$MIGRATE_DIR" --subdirs "$SUBDIRS" --cmd "$MIGRATE_CMD"

  echo "{\"subdirs\":\"$SUBDIRS\",\"cmd\":\"$MIGRATE_CMD\"}"
}