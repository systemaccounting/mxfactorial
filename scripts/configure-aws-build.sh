#!/bin/bash

set -e

# https://stackoverflow.com/a/28938235
CYAN='\033[0;36m'
NOCOLOR='\033[0m'

ENV=dev
PROJECT_CONF=project.yaml
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
IAM_USER=$(yq '.scripts.env_var.set.IAM_USER.default' $PROJECT_CONF)
TFSTATE_ENV_ID=infrastructure/terraform/env-id/terraform.tfstate
TFSTATE_INIT_DEV=infrastructure/terraform/aws/environments/init-dev/terraform.tfstate
DEV_ENV_DIR=infrastructure/terraform/aws/environments/dev
TFSTATE_DEV="$DEV_ENV_DIR/.terraform/terraform.tfstate"

if [[ -f $TFSTATE_DEV ]]; then
  DEV_DEPLOYED=$(cd $DEV_ENV_DIR; terraform state pull | yq '.resources | length > 0')
  echo $DEV_DEPLOYED
fi
exit 0

aws configure set default.region "$REGION"

function build_env() {
  set -e
  source ./scripts/build-dev-env.sh
}

# exit when previously built env available
if [[ -f $TFSTATE_ENV_ID ]] && [[ $(yq '.resources | length > 0' $TFSTATE_ENV_ID) == "true" ]]; then
  ENV_ID=$(yq '.outputs.env_id.value' $TFSTATE_ENV_ID)

  if [[ -f $TFSTATE_INIT_DEV ]] && [[ $(yq '.resources | length > 0' $TFSTATE_INIT_DEV) == "true" ]]; then

    if [[ -f $TFSTATE_DEV ]]; then

      DEV_DEPLOYED=$(cd $DEV_ENV_DIR; terraform state pull | yq '.resources | length > 0')

      if [[ $DEV_DEPLOYED == 'true' ]]; then

        echo "found previously built ${ENV_ID}-${ENV} env"

        aws configure

        exit 0

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