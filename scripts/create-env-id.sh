#!/bin/bash

PROJECT_CONF=project.yaml
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE=$ENV_FILE_NAME # assumes project root

ENV_ID=$RANDOM

function remove_empty_newlines() {
	if [[ "$OSTYPE" == "darwin"* ]]; then
		sed -i '' '/^$/d' $ENV_FILE
	else
		sed -i '/^$/d' $ENV_FILE
	fi
}

if [[ -f $ENV_FILE ]]; then
	if grep -q "ENV_ID=" $ENV_FILE; then
		CURR_ENV_ID=$(grep "ENV_ID=" $ENV_FILE | cut -d'=' -f2)
		echo "remove ENV_ID=$CURR_ENV_ID assignment in $ENV_FILE to continue"
		exit 1
	else
		printf '\n%s' "ENV_ID=$ENV_ID" >>$ENV_FILE
		remove_empty_newlines
		echo "ENV_ID=$ENV_ID added to $ENV_FILE"
	fi
else
	echo "ENV_ID=$ENV_ID" >$ENV_FILE
fi
