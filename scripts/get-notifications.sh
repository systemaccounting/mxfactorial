#!/bin/bash

set -euo pipefail

if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/get-notifications.sh \
		--dir-path services/notifications-get
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --dir-path) DIR_PATH="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

ENV_FILE_NAME='.env'
ENV_FILE="$DIR_PATH/$ENV_FILE_NAME"

# test for .env file availability
if [[ ! -f $ENV_FILE ]]; then
	echo "missing $ENV_FILE_NAME file, run 'make get-secrets ENV=dev'"
	exit 1
fi

# test for USERNAME assignment in .env file
USERNAME_LINE_COUNT=$((grep -e '^USERNAME' $ENV_FILE || true) | wc -l | awk '{print $1}')
if [[ $USERNAME_LINE_COUNT -eq 0 ]]; then
	echo "missing json web token credential. run 'make save-id-token'"
	exit 1
fi

# test for PASSWORD assignment in .env file
PASSWORD_LINE_COUNT=$((grep -e '^PASSWORD' $ENV_FILE || true) | wc -l | awk '{print $1}')
if [[ $PASSWORD_LINE_COUNT -eq 0 ]]; then
	echo "missing json web token credential. run 'make save-id-token'"
	exit 1
fi

# test for ID_TOKEN assignment in .env file
ID_TOKEN_LINE_COUNT=$((grep -e '^ID_TOKEN' $ENV_FILE || true) | wc -l | awk '{print $1}')
if [[ $ID_TOKEN_LINE_COUNT -eq 0 ]]; then
	echo "missing json web token credential. run 'make save-id-token'"
	exit 1
fi

TEMPLATE_JSON_PATH=./pkg/testdata/getnotifications.json

source $ENV_FILE

WEBSOCKET_MESSAGE=$(yq -I0 -o=json ".token = \"$ID_TOKEN\"" $TEMPLATE_JSON_PATH)

RESPONSE=$(npx wscat -c $WEBSOCKET_CLIENT_URI -x "$WEBSOCKET_MESSAGE")

echo $RESPONSE | yq -o=json

PENDING_NOTIFICATIONS=$(echo -n $RESPONSE | yq '[.pending[] | .notification_id] | join(",")')

echo ""
echo "pending notifications: $PENDING_NOTIFICATIONS"