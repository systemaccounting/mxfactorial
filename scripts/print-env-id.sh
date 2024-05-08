#!/bin/bash

if [[ -z $ENV ]]; then
	echo "set ENV variable in environment before continuing, e.g. export ENV=dev"
	exit 1
fi

PROJECT_CONF=project.yaml
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE=$ENV_FILE_NAME # assumes project root

if [[ $ENV == 'prod' ]]; then # use configured prod env id
	ENV_ID=$(yq '.env_var.set.PROD_ENV_ID.default' $PROJECT_CONF)
elif [[ -z $ENV_ID ]]; then # get ENV_ID from .env file if not set in env
	if [[ -f $ENV_FILE ]] && grep -q "ENV_ID=" $ENV_FILE; then
		ENV_ID=$(grep "ENV_ID=" $ENV_FILE | cut -d'=' -f2)
	else
		echo "ENV_ID not found in $ENV_FILE"
		exit 1
	fi
fi

printf '%s' "$ENV_ID"