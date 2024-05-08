#!/bin/bash

PROJECT_CONF=project.yaml
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE=$ENV_FILE_NAME # assumes project root

function delete_env_id() {
	if [[ "$OSTYPE" == "darwin"* ]]; then
		sed -i '' '/ENV_ID=/d' $ENV_FILE
	else
		sed -i '/ENV_ID=/d' $ENV_FILE
	fi
}

if [[ -f $ENV_FILE ]]; then
	if grep -q "ENV_ID=" $ENV_FILE; then
		ENV_ID=$(grep "ENV_ID=" $ENV_FILE | cut -d'=' -f2)
		delete_env_id
		echo "ENV_ID=$ENV_ID deleted from $ENV_FILE"
	fi
fi