#!/bin/bash

set -e

YELLOW='\033[0;33m'
NOCOLOR='\033[0m'
BUILD_START_TIME=$(date +%s)

ENV=dev
PROJECT_CONF=project.yaml
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
TFSTATE_BUCKET_PREFIX=$(yq '.infra.terraform.aws.modules["project-storage"].env_var.set.TFSTATE_BUCKET_PREFIX.default' $PROJECT_CONF)
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE=$ENV_FILE_NAME

if [[ -z $ENV_ID ]]; then
	if [[ -f $ENV_FILE ]] && grep -q "^ENV_ID=" $ENV_FILE; then
		ENV_ID=$(grep "^ENV_ID=" $ENV_FILE | cut -d'=' -f2)
	else
		make env-id
		ENV_ID=$(source scripts/print-env-id.sh)
	fi
fi

ENV_ID=$(source ./scripts/print-env-id.sh)
TFSTATE_EXT=$(yq '.infra.terraform.env_var.set.TFSTATE_EXT.default' $PROJECT_CONF)
TFSTATE_APIGW_SUFFIX=$(yq '.infra.terraform.aws.environments.region.env_var.set.TFSTATE_APIGW_SUFFIX.default' $PROJECT_CONF)
TFSTATE_APIGW="$TFSTATE_APIGW_SUFFIX".$TFSTATE_EXT
TFSTATE_ENV_SUFFIX=$(yq '.infra.terraform.env_var.set.TFSTATE_ENV_SUFFIX.default' $PROJECT_CONF)
TFSTATE_ENV="$TFSTATE_ENV_SUFFIX".$TFSTATE_EXT

ID_ENV="$ENV_ID-$ENV"
TFSTATE_BUCKET="$TFSTATE_BUCKET_PREFIX-$ID_ENV"
TFPLAN_FILE=.tfplan

pushd infra/terraform/aws/environments/init-dev

terraform init

printf "\n${YELLOW}*** provisioning artifact, cache origin and terraform state storage${NOCOLOR}\n\n"
terraform apply

popd

function apply_agigw_logging_perm() {

	source ./scripts/terraform-init-dev.sh \
		--key "$TFSTATE_APIGW" \
		--dir infra/terraform/aws/environments/region

	pushd infra/terraform/aws/environments/region

	printf "\n${YELLOW}*** provisioning $ID_ENV api gateway logging permission and saving in $TFSTATE_APIGW${NOCOLOR}\n\n"
	terraform apply

	popd
}

APIGW_ACCT=$(aws apigateway get-account --region "$REGION")
ACCT_HAS_ROLE=$(echo $APIGW_ACCT | yq 'has("cloudwatchRoleArn")')

# test for a cloudwatch role arn assignment to the regional api gateway account
if [[ "$ACCT_HAS_ROLE" == "true" ]]; then

	# get the currently assigned cloudwatch role arn to the api gateway account
	ASSIGNED_ROLE_ARN=$(echo $APIGW_ACCT | yq '.cloudwatchRoleArn')

	# test for availability of assigned role in iam
	ASSIGNED_ROLE_ARN_COUNT=$(aws iam list-roles --query "Roles[?contains(Arn, \`$ASSIGNED_ROLE_ARN\`) == \`true\`]" --region "$REGION" | yq 'length')

	# create a new cloudwatch role arn and assign to api gateway account
	# IF currently assigned role was deleted in iam
	if [[ "$ASSIGNED_ROLE_ARN_COUNT" -eq 0 ]]; then apply_agigw_logging_perm; fi

	# no-op IF assigned role is available in iam
else
	# create a new cloudwatch role arn and assign to api
	# gateway account IF cloudwatch role arn not found
	apply_agigw_logging_perm
fi

printf "\n${YELLOW}*** compiling app binaries and pushing to artifact bucket${NOCOLOR}\n\n"
make --no-print-directory all CMD=initial-deploy ENV=dev

source ./scripts/terraform-init-dev.sh \
	--key "$TFSTATE_ENV" \
	--dir infra/terraform/aws/environments/dev

pushd infra/terraform/aws/environments/dev

printf "\n${YELLOW}*** creating terraform plan for $ID_ENV infrastructure${NOCOLOR}\n\n"
terraform plan -out $TFPLAN_FILE

terraform show -no-color $TFPLAN_FILE > "$TFPLAN_FILE.txt"
code "$TFPLAN_FILE.txt"

function apply_env() {
	printf "\n${YELLOW}*** provisioning environment infrastructure for $ID_ENV${NOCOLOR}\n\n"
    terraform apply "$TFPLAN_FILE"
}

# https://stackoverflow.com/a/226724
echo "apply $TFPLAN_FILE?
enter 1 for yes, 2 for no"
select yn in "yes" "no"; do
    case $yn in
        yes ) apply_env; break;;
        * ) exit;;
    esac
done

if [[ $(yq '.scripts.env_var.set.BUILD_DB.default' "../../../../../$PROJECT_CONF") == "false" ]]; then
	echo "exiting after skipping db during terraform development

*** enable .scripts.env_var.set.BUILD_DB.default in $PROJECT_CONF to build development environment"
	exit 0
fi

pushd ../../../../../migrations

printf "\n${YELLOW}*** deploying migrations to rds in $ID_ENV${NOCOLOR}\n\n"
make --no-print-directory uprds DB=test ENV=dev

popd; popd;

printf "\n${YELLOW}*** testing integration with new infrastructure and app deployments${NOCOLOR}\n\n"
set +e # avoid exiting on flaky tests
make --no-print-directory test-cloud ENV=dev

BUILD_END_TIME=$(date +%s)
BUILD_DURATION=$(($BUILD_END_TIME - $BUILD_START_TIME))

printf "\n${YELLOW}*** $ID_ENV environment build time: $(printf '%02dh:%02dm:%02ds\n' $(($BUILD_DURATION/3600)) $(($BUILD_DURATION%3600/60)) $(($BUILD_DURATION%60)))${NOCOLOR}\n"