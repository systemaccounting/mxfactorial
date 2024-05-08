#!/bin/bash

ENV=dev # hardcoding intended
PROJECT_CONF=project.yaml
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
ENV_ID=$(source ./scripts/print-env-id.sh)
ID_ENV="$ENV_ID-$ENV"
ARTIFACTS_BUCKET_PREFIX=$(yq '.infrastructure.terraform.aws.modules["project-storage"].env_var.set.ARTIFACTS_BUCKET_PREFIX.default' $PROJECT_CONF)
CLIENT_ORIGIN_BUCKET_PREFIX=$(yq '.infrastructure.terraform.aws.modules["project-storage"].env_var.set.CLIENT_ORIGIN_BUCKET_PREFIX.default' $PROJECT_CONF)
TFSTATE_BUCKET_PREFIX=$(yq '.infrastructure.terraform.aws.modules["project-storage"].env_var.set.TFSTATE_BUCKET_PREFIX.default' $PROJECT_CONF)
DDB_TABLE_NAME_PREFIX=$(yq '.infrastructure.terraform.aws.modules["project-storage"].env_var.set.DDB_TABLE_NAME_PREFIX.default' $PROJECT_CONF)
LOCAL_TFSTATE_FILE=terraform.tfstate

ARTIFACTS_BUCKET="$ARTIFACTS_BUCKET_PREFIX-$ID_ENV"
CLIENT_ORIGIN_BUCKET="$CLIENT_ORIGIN_BUCKET_PREFIX-$ID_ENV"
TFSTATE_BUCKET="$TFSTATE_BUCKET_PREFIX-$ID_ENV"
DDB_TABLE="$DDB_TABLE_NAME_PREFIX-$ID_ENV"

INIT_DEV_DIR=infrastructure/terraform/aws/environments/init-dev

export AWS_DEFAULT_REGION="$REGION"

function delete_bucket() {
	local bucket_name="$1"

	aws s3 rm "s3://$bucket_name" --recursive

	aws s3api delete-bucket --bucket "$bucket_name"
}

function delete_dev_storage() {
	# delete buckets
	delete_bucket "$ARTIFACTS_BUCKET"
	delete_bucket "$CLIENT_ORIGIN_BUCKET"
	delete_bucket "$TFSTATE_BUCKET"

	# delete ddb table
	DEL_RESP=$(aws dynamodb delete-table --table-name "$DDB_TABLE" --query 'TableDescription.{ TableName: TableName, TableStatus: TableStatus }')
	TABLE_NAME=$(echo $DEL_RESP | yq '.TableName')
	TABLE_STATUS=$(echo $DEL_RESP | yq '.TableStatus')

	popd
	source ./scripts/delete-ecr-repos.sh
	pushd $INIT_DEV_DIR

	printf '%s %s dynamodb table\n' "$TABLE_STATUS" "$TABLE_NAME"
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
