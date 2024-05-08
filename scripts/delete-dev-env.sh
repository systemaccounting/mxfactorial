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
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE=$ENV_FILE_NAME
ENV_ID=$(source scripts/print-env-id.sh)

if [[ -z $ENV_ID ]]; then
    echo "ENV_ID not found in $ENV_FILE"
    echo "bash scripts/set-custom-env-id.sh --env-id 12345 before continuing"
    exit 1
fi

pushd infrastructure/terraform/aws/environments/dev

terraform destroy --auto-approve && rm -rf .terraform* .tfplan*

popd

pushd infrastructure/terraform/aws/environments/region

# skip if api gateway logging permission not managed by local terraform
if [[ -f terraform.tfstate ]]; then
	terraform destroy --auto-approve && rm -rf .terraform* terraform.tfstate
# todo: elif manually delete logging permission if current resource matches naming convention
fi

popd

source scripts/delete-dev-storage.sh # --env arg not available here, dev only

printf "\n${YELLOW}*** ${ENV_ID}-${ENV} env deleted. you may now delete your workspace${NOCOLOR}\n"