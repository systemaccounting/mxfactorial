#!/bin/bash

ENV=dev # hardcoding intended
PROJECT_CONF=project.yaml
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
ENV_ID=$(source ./scripts/print-env-id.sh)
ID_ENV="$ENV_ID-$ENV"
ARTIFACTS_BUCKET_PREFIX=$(yq '.infra.terraform.aws.modules["project-storage"].env_var.set.ARTIFACTS_BUCKET_PREFIX.default' $PROJECT_CONF)
TFSTATE_BUCKET_PREFIX=$(yq '.infra.terraform.aws.modules["project-storage"].env_var.set.TFSTATE_BUCKET_PREFIX.default' $PROJECT_CONF)
LOCAL_TFSTATE_FILE=terraform.tfstate

ARTIFACTS_BUCKET="$ARTIFACTS_BUCKET_PREFIX-$ID_ENV"
TFSTATE_BUCKET="$TFSTATE_BUCKET_PREFIX-$ID_ENV"

INIT_DEV_DIR=infra/terraform/aws/environments/init-dev

export AWS_DEFAULT_REGION="$REGION"

function delete_bucket() {
	local bucket_name="$1"

	aws s3 rm "s3://$bucket_name" --recursive

	aws s3api delete-bucket --bucket "$bucket_name"
}

function delete_dev_storage() {
	# delete buckets
	delete_bucket "$ARTIFACTS_BUCKET"
	delete_bucket "$TFSTATE_BUCKET"

	popd
	source ./scripts/delete-ecr-repos.sh
	pushd $INIT_DEV_DIR
}

pushd $INIT_DEV_DIR

if ! [[ -f $LOCAL_TFSTATE_FILE ]]; then
	echo "tfstate not found. manually deleting dev storage"
	delete_dev_storage
elif [[ $(yq '.resources | length' $LOCAL_TFSTATE_FILE) -eq 0 ]]; then
	echo "resources not found in tfstate. manually deleting dev storage"
	delete_dev_storage
fi

set +e
terraform destroy --auto-approve 2>/dev/null

if [[ "$?" -ne 0 ]]; then
	echo "destroy incomplete. manually deleting dev storage"
	delete_dev_storage
	popd
else
	popd
fi
