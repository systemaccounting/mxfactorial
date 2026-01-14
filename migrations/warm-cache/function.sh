function handler () {
  EVENT_DATA=$1

  # if EVENT_DATA has body property, parse from body string (function url)
  # otherwise assign variables from object root (lambda invoke)
  if [[ $(echo $EVENT_DATA | jq -r '.body') != "null" ]]; then
    BODY=$(echo $EVENT_DATA | jq -r '.body')
    PASSPHRASE=$(echo $BODY | jq -r '.passphrase')
  else
    PASSPHRASE=$(echo $EVENT_DATA | jq -r '.passphrase')
  fi

  if [[ "$PASSPHRASE" != "$WARM_CACHE_PASSPHRASE" ]]; then
    echo "unmatched passphrase" 1>&2;
    exit 1
  fi

  source ./warm-cache.sh

  echo "{\"status\":\"cache warmed\"}"
}
