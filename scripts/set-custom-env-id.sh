#!/bin/bash

set -e

# print use
if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/set-custom-env-id.sh --env-id 12345
	EOF
	exit 1
fi

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env-id) CUSTOM_ENV_ID="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

TFSTATE_ENV_ID=infrastructure/terraform/env-id/terraform.tfstate

make env-id

TFSTATE_TMP_1=$(jq --indent 4 ".outputs.env_id.value = \"$CUSTOM_ENV_ID\"" $TFSTATE_ENV_ID)

TFSTATE_NEW=$(echo $TFSTATE_TMP_1 | jq --indent 4 ".resources[0].instances[0].attributes.dec = \"$CUSTOM_ENV_ID\"")

echo -E "${TFSTATE_NEW}" > $TFSTATE_ENV_ID

printf "\nCUSTOM env-id now set: \"$CUSTOM_ENV_ID\"\n"
