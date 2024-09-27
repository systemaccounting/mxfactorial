#!/bin/bash

set -e

# https://stackoverflow.com/a/28938235
CYAN='\033[0;36m'
NOCOLOR='\033[0m'

ENV=dev
PROJECT_CONF=project.yaml

ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE=$ENV_FILE_NAME

REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
IAM_USER=$(yq '.scripts.env_var.set.IAM_USER.default' $PROJECT_CONF)

TFSTATE_INIT_DEV=infra/terraform/aws/environments/init-dev/terraform.tfstate
DEV_ENV_DIR=infra/terraform/aws/environments/dev
TFSTATE_DEV="$DEV_ENV_DIR/.terraform/terraform.tfstate"

aws configure set default.region "$REGION"

function build_env() {
  set -e
  source ./scripts/build-dev-env.sh
}

# test for existing env
if [[ -f $ENV_FILE ]] && grep -q "ENV_ID=" $ENV_FILE; then # test for ENV_ID in root .env
  ENV_ID=$(source ./scripts/print-env-id.sh)
  if [[ -f $TFSTATE_INIT_DEV ]] && [[ $(yq '.resources | length > 0' $TFSTATE_INIT_DEV) == "true" ]]; then # test for init-dev state file
    if [[ -f $TFSTATE_DEV ]]; then # test for dev state file
      aws sts get-caller-identity &>/dev/null # test cli creds
      if [[ "$?" -ne 0 ]]; then # fetch remote state if creds are configured
        echo "${ENV_ID}-${ENV} env found but aws credentials not configured"
        echo "\"aws configure\" to manage previously built env"
        exit 0
      else # fetch remote state
        DEV_DEPLOYED=$(
          cd $DEV_ENV_DIR
          terraform state pull | yq '.resources | length > 0'
        )
        if [[ $DEV_DEPLOYED == 'true' ]]; then # test for previously built env
          echo "found previously built env: ${ENV_ID}-${ENV}"
          echo "\"make delete-dev\" to destroy"
          exit 0
        else # build env with configured creds
          build_env
        fi
      fi
    fi
  fi
fi

printf "\n${CYAN}*** deploying the systemaccounting infrastructure and application code to your own aws account minimizes security administration and billing risk ***

on your own machine where admin aws account credentials are configured, run:

    bash scripts/manage-gitpod-iam.sh --new # OR --delete

to create:

1. a ${IAM_USER} user,
2. an \"AWS Access Key ID\", and
3. an \"AWS Secret Access Key\"

then enter the gitpod user \"AWS Access Key ID\" and \"AWS Secret Access Key\" below to view the terraform plans, and deploy the infrastructure and application code${NOCOLOR}\n\n"

aws configure

set +e

# test cli creds
# https://stackoverflow.com/questions/2292847/how-to-silence-output-in-a-bash-script#comment102069201_2293011
aws sts get-caller-identity &>/dev/null
if [[ "$?" -ne 0 ]]; then
  echo -e "aws credentials not configured

to restart dev environment build:
  1. aws configure
  2. make build-dev"
fi

build_env
