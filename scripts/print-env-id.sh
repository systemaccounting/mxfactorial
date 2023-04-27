#!/bin/bash

if [[ -z $ENV ]]; then
	echo "set ENV variable in sourcing script before continuing"
	exit 1
fi

if [[ -z $PROJECT_CONF ]]; then
	echo "set PROJECT_CONF variable in sourcing script before continuing"
	exit 1
fi

if [[ $ENV == 'prod' ]]; then # use configured prod env id
	ENV_ID=$(yq '.infrastructure.terraform["env-id"].prod.env_var.set.PROD_ENV_ID.default' $PROJECT_CONF)
elif [[ -z $ENV_ID ]]; then # use env id from terraform if not in environment
	ENV_ID=$(yq '.outputs.env_id.value' infrastructure/terraform/env-id/terraform.tfstate)
fi

printf '%s' "$ENV_ID"