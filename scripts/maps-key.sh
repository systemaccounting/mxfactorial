#!/bin/bash

set -eo pipefail

if [[ $(basename $(pwd)) != "mxfactorial" ]]; then
	echo "error: run from project root"
	exit 1
fi

PROJECT_CONF=project.yaml
SSM_VERSION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.SSM_VERSION.default' $PROJECT_CONF)
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
SSM_SUFFIX=$(yq '.client.env_var.set.GOOGLE_MAPS_API_KEY.ssm' $PROJECT_CONF)

ENV=dev

export ENV_ID
ENV_ID=$(source scripts/print-env-id.sh)
SSM_NAME="/$ENV_ID/$SSM_VERSION/$ENV/$SSM_SUFFIX"

SET=false

while [[ "$#" -gt 0 ]]; do
	case $1 in
		--set) SET=true; VALUE="$2"; shift; shift ;;
		*) echo "unknown parameter passed: $1"; exit 1 ;;
	esac
done

if [[ $SET == true ]]; then
	if [[ -z $VALUE ]]; then
		echo "use: ENV=dev bash scripts/maps-key.sh --set <api-key>"
		exit 1
	fi
	aws ssm put-parameter \
		--name "$SSM_NAME" \
		--value "$VALUE" \
		--type SecureString \
		--region "$REGION" \
		--overwrite \
		--output text
	echo "set $SSM_NAME"
else
	aws ssm get-parameter \
		--name "$SSM_NAME" \
		--query 'Parameter.Value' \
		--region "$REGION" \
		--with-decryption \
		--output text
fi
