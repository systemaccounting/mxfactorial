#!/bin/bash

set -euo pipefail

if [[ "$#" -ne 4 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/clear-notifications.sh \
		--dir-path services/notifications-clear \
		--ids 2,7,12
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --dir-path) DIR_PATH="$2"; shift ;;
		--ids) IDS="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' project.yaml)
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

TEMPLATE_JSON_PATH=./pkg/testdata/clearnotifications.json

source $ENV_FILE

# convert comma separated integers to strings: 2,7,12 => "2","7","12"
declare IDS_TO_CLEAR
for i in $(echo $IDS | tr , ' '); do
	IDS_TO_CLEAR+=\"$i\",;
done

# remove trailing comma
IDS_TO_CLEAR=${IDS_TO_CLEAR%?}

WEBSOCKET_MESSAGE=$(yq \
	-I0 \
	-o=json \
	".token = \"$ID_TOKEN\" | .notification_ids = [$IDS_TO_CLEAR]" \
	$TEMPLATE_JSON_PATH)

npx wscat -c $WEBSOCKET_CLIENT_URI -x "$WEBSOCKET_MESSAGE"