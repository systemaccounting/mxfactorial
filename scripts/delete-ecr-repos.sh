#!/bin/bash

PROJECT_CONF=project.yaml
ENV=dev
ENV_ID=$(source scripts/print-env-id.sh)
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

for APP_NAME in $(bash scripts/list-deployments.sh | grep -v client | xargs basename -a); do
	IMAGE_NAME="$ENV_ID/$ENV/$APP_NAME"
	aws ecr delete-repository --repository-name $IMAGE_NAME --region $REGION --force
done