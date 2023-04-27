#!/bin/bash

set -e

if [[ "$#" -ne 2 ]]; then
	echo "use: bash scripts/delete-lambda-layers.sh --env dev"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
TFSTATE_ENV_ID=infrastructure/terraform/env-id/terraform.tfstate
ENV_ID=$(source ./scripts/print-env-id.sh)
APP_NAME=go-migrate # todo: convert to list populated from project.yaml
GO_MIGRATE_LAYER_PREFIX=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.GO_MIGRATE_LAYER_PREFIX.default' $PROJECT_CONF)
LAYER_NAME="$GO_MIGRATE_LAYER_PREFIX-$ENV_ID-$ENV"
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

LAYER_VERSIONS=($(aws lambda list-layer-versions --layer-name "$LAYER_NAME" --region "$REGION" --query 'LayerVersions[*].[LayerVersionArn]' --output text))

for lv in "${LAYER_VERSIONS[@]}"; do
	VERSION=$(echo "$lv" | cut -d: -f 8)
	echo -e "\ndeleting $LAYER_NAME lambda layer version $VERSION\n"
	aws lambda delete-layer-version --layer-name "$LAYER_NAME" --version-number "$VERSION" --region "$REGION"
done