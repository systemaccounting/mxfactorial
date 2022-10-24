#!/bin/bash

set -euo pipefail

if [[ "$#" -ne 8 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/save-id-token.sh \
		--dir-path services/notifications-get \
		--username SomeUser \
		--password SomePassword \
		--region us-east-1
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --dir-path) DIR_PATH="$2"; shift ;;
        --username) USERNAME="$2"; shift ;;
        --password) PASSWORD="$2"; shift ;;
		--region) REGION="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

ENV_FILE_NAME='.env'
ENV_FILE="$DIR_PATH/$ENV_FILE_NAME"
TEMP_FILE=temp

# test for .env file availability
if [[ ! -f $ENV_FILE ]]; then
	echo "missing $ENV_FILE_NAME file, run 'make get-secrets ENV=dev'"
	exit 1
fi

# test for USERNAME assignment in .env file
grep -v -e 'USERNAME' -e 'PASSWORD' -e 'ID_TOKEN' $ENV_FILE > $TEMP_FILE && mv $TEMP_FILE $ENV_FILE

# add username and password to .env file
echo "USERNAME=$USERNAME" >> $ENV_FILE
echo "PASSWORD=$PASSWORD" >> $ENV_FILE

# source USERNAME and PASSWORD in .env file
source $ENV_FILE

# get id token from cognito
ID_TOKEN=$(aws cognito-idp initiate-auth \
	--region $REGION \
	--auth-flow 'USER_PASSWORD_AUTH' \
	--client-id $CLIENT_ID \
	--auth-parameters USERNAME=$USERNAME,PASSWORD=$PASSWORD \
	--query 'AuthenticationResult.IdToken' \
	--output text)

# save id token in .env file
printf "ID_TOKEN=" >> $ENV_FILE
printf "\"" >> $ENV_FILE
printf $ID_TOKEN >> $ENV_FILE
printf "\"" >> $ENV_FILE