#!/bin/bash

set -e

YELLOW='\033[0;33m'
NOCOLOR='\033[0m'

ENVIRONMENT=dev
PROJECT_CONFIG=project.json
ENV_ID=$(jq -r '.outputs.env_id.value' infrastructure/terraform/env-id/terraform.tfstate)

pushd infrastructure/terraform/aws/environments/dev

terraform destroy --auto-approve

popd

source scripts/delete-lambda-layers.sh --env "$ENVIRONMENT"

cd infrastructure/terraform/aws/environments/region

# skip if api gateway logging permission not managed by terraform
if [[ -f terraform.tfstate ]] && [[ $(jq '.resources | length > 0' terraform.tfstate) == "true" ]]; then
	terraform destroy --auto-approve
fi

cd ../init-dev

terraform destroy --auto-approve

printf "\n${YELLOW}*** ${ENV_ID}-${ENVIRONMENT} env deleted. you may now delete your workspace${NOCOLOR}\n"