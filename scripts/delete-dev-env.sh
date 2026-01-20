#!/bin/bash

set -e

YELLOW='\033[0;33m'
NOCOLOR='\033[0m'

ENV=dev
PROJECT_CONF=project.yaml
ENV_ID=$(source scripts/print-env-id.sh)

if [[ -z $ENV_ID ]]; then
    echo "ENV_ID not found. run 'make env-id' first"
    exit 1
fi

pushd infra/terraform/aws/environments/dev

printf "\n${YELLOW}*** destroying $ENV_ID-$ENV environment${NOCOLOR}\n\n"
terraform destroy --auto-approve && rm -rf .terraform* .tfplan*

popd

pushd infra/terraform/aws/environments/region

if [[ -f terraform.tfstate ]]; then
	printf "\n${YELLOW}*** destroying api gateway logging permission${NOCOLOR}\n\n"
	terraform destroy --auto-approve && rm -rf .terraform* terraform.tfstate
fi

popd

pushd infra/terraform/aws/environments/init-dev

printf "\n${YELLOW}*** destroying $ENV_ID-$ENV storage${NOCOLOR}\n\n"
terraform destroy --auto-approve && rm -rf .terraform* terraform.tfstate

popd

printf "\n${YELLOW}*** $ENV_ID-$ENV deleted${NOCOLOR}\n"
