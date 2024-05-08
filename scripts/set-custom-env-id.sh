#!/bin/bash

set -e

# print use
if [[ "$#" -ne 2 ]]; then
	cat <<-'EOF'
		use:
		bash scripts/set-custom-env-id.sh --env-id 12345
	EOF
	exit 1
fi

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
	case $1 in
	--env-id)
		CUSTOM_ENV_ID="$2"
		shift
		;;
	*)
		echo "unknown parameter passed: $1"
		exit 1
		;;
	esac
	shift
done

PROJECT_CONF=project.yaml
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE=$ENV_FILE_NAME

make delete-env-id
make env-id >/dev/null
if [[ $(uname) == "Darwin" ]]; then
	sed -i '' "s/ENV_ID=.*/ENV_ID=$CUSTOM_ENV_ID/" $ENV_FILE
else
	sed -i "s/ENV_ID=.*/ENV_ID=$CUSTOM_ENV_ID/" $ENV_FILE
fi

printf "\nCUSTOM env-id now set in root $ENV_FILE: $CUSTOM_ENV_ID\n"
