#!/bin/bash

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --force) FORCE=1; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done


if [[ ! "$FORCE" ]]; then
	set -e
fi

YELLOW='\033[0;33m'
NOCOLOR='\033[0m'

ENVIRONMENT=dev
PROJECT_CONFIG=project.json
ENV_ID=$(jq -r '.outputs.env_id.value' infrastructure/terraform/env-id/terraform.tfstate)

pushd infrastructure/terraform/aws/environments/dev

terraform destroy --auto-approve

popd

source scripts/delete-lambda-layers.sh --env "$ENVIRONMENT"

pushd infrastructure/terraform/aws/environments/region

# skip if api gateway logging permission not managed by local terraform
if [[ -f terraform.tfstate ]] && [[ $(jq '.resources | length > 0' ../../../env-id/terraform.state) == "true" ]]; then
	terraform destroy --auto-approve
# todo: elif manually delete logging permission if current resource matches naming convention
fi

popd

source scripts/delete-dev-storage.sh # --env arg not available here, dev only

printf "\n${YELLOW}*** ${ENV_ID}-${ENVIRONMENT} env deleted. you may now delete your workspace${NOCOLOR}\n"