#!/bin/bash

set -euo pipefail

if [[ "$#" -ne 8 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/print-id-token.sh \
		--client-id abc123abc123abc123abc123ab \
		--username SomeUser \
		--password SomeSecret \
		--region us-east-1
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --client-id) CLIENT_ID="$2"; shift ;;
        --username) USERNAME="$2"; shift ;;
        --password) PASSWORD="$2"; shift ;;
		--region) REGION="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

aws cognito-idp initiate-auth \
	--region $REGION \
	--auth-flow 'USER_PASSWORD_AUTH' \
	--client-id $CLIENT_ID \
	--auth-parameters USERNAME=$USERNAME,PASSWORD=$PASSWORD \
	--query 'AuthenticationResult.IdToken' \
	--output text