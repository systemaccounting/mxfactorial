#!/bin/bash

PROJECT_CONF=project.yaml
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE="$ENV_FILE_NAME"
ENABLE_API_AUTH=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.ENABLE_API_AUTH.default' $PROJECT_CONF)

cd client

if [[ ! -f $ENV_FILE ]]; then
	echo '"make get-secrets ENV=$ENV" before continuing. exiting'
	exit 1
fi

ROWS=($(<$ENV_FILE))
rm $ENV_FILE

for l in "${ROWS[@]}"; do

	PAIR=($(echo "$l" | sed "s/=/ /"))
	VAR="${PAIR[0]}"

	if [[ $(uname -s) == 'Darwin' ]]; then
		VAL=$(printf '%s' "${PAIR[1]}" | base64)

	else
		VAL=$(printf '%s' "${PAIR[1]}" | base64 -w 0)
	fi

	if [[ $VAR == 'CLIENT_PORT' ]]; then
		VAL="${PAIR[1]}"
	fi

	if [[ $VAR == 'ENABLE_API_AUTH' ]]; then
		VAL="${PAIR[1]}"
	fi

	if [[ $ENABLE_API_AUTH == 'false' ]]; then
		if [[ $VAR == 'POOL_ID' ]]; then
			VAL=
		fi

		if [[ $VAR == 'CLIENT_ID' ]]; then
			VAL=
		fi
	fi


	echo "$VAR=$VAL" >> $ENV_FILE
	unset PAIR
	unset VAR
done

