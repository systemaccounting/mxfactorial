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

ENV=dev
PROJECT_CONF=project.yaml
ENV_ID=$(source scripts/print-env-id.sh)

pushd infrastructure/terraform/aws/environments/dev

terraform destroy --auto-approve && rm -rf .terraform* .tfplan*

popd

source scripts/delete-lambda-layers.sh --env "$ENV"

pushd infrastructure/terraform/aws/environments/region

# skip if api gateway logging permission not managed by local terraform
if [[ -f terraform.tfstate ]] && [[ $(yq '.resources | length > 0' ../../../env-id/terraform.tfstate) == "true" ]]; then
	terraform destroy --auto-approve && rm -rf .terraform* terraform.tfstate
# todo: elif manually delete logging permission if current resource matches naming convention
fi

popd

source scripts/delete-dev-storage.sh # --env arg not available here, dev only

printf "\n${YELLOW}*** ${ENV_ID}-${ENV} env deleted. you may now delete your workspace${NOCOLOR}\n"