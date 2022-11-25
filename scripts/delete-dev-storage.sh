#!/bin/bash

ENVIRONMENT=dev # hardcoding intended
PROJECT_CONFIG=project.json
REGION=$(jq -r '.region' $PROJECT_CONFIG)
ENV_ID=$(jq -r '.outputs.env_id.value' infrastructure/terraform/env-id/terraform.tfstate)
ID_ENV="$ENV_ID-$ENVIRONMENT"

ARTIFACTS_BUCKET_PREFIX=$(jq -r '.artifacts_bucket_name_prefix' $PROJECT_CONFIG)
CLIENT_ORIGIN_BUCKET_PREFIX=$(jq -r '.client_origin_bucket_name_prefix' $PROJECT_CONFIG)
TFSTATE_BUCKET_PREFIX=$(jq -r '.tfstate_bucket_name_prefix' $PROJECT_CONFIG)
DDB_TABLE_NAME_PREFIX=$(jq -r '.github_workflows.dynamodb_table.name_prefix' $PROJECT_CONFIG)

ARTIFACTS_BUCKET="$ARTIFACTS_BUCKET_PREFIX-$ID_ENV"
CLIENT_ORIGIN_BUCKET="$CLIENT_ORIGIN_BUCKET_PREFIX-$ID_ENV"
TFSTATE_BUCKET="$TFSTATE_BUCKET_PREFIX-$ID_ENV"
DDB_TABLE="$DDB_TABLE_NAME_PREFIX-$ID_ENV"

export AWS_DEFAULT_REGION="$REGION"

pushd infrastructure/terraform/aws/environments/init-dev

function delete_bucket() {
	local bucket_name="$1"

	aws s3 rm "s3://$bucket_name" --recursive

	aws s3api delete-bucket --bucket "$bucket_name"
}

set +e
terraform destroy --auto-approve 2>/dev/null

if [[ "$?" -ne 0 ]]; then
	echo "tfstate not found. manually deleting dev storage"

	# delete buckets
	delete_bucket "$ARTIFACTS_BUCKET"
	delete_bucket "$CLIENT_ORIGIN_BUCKET"
	delete_bucket "$TFSTATE_BUCKET"

	# delete ddb table
	DEL_RESP=$(aws dynamodb delete-table --table-name "$DDB_TABLE" --query 'TableDescription.{ TableName: TableName, TableStatus: TableStatus }')
	TABLE_NAME=$(echo $DEL_RESP | jq -r '.TableName')
	TABLE_STATUS=$(echo $DEL_RESP | jq -r '.TableStatus')

	printf '%s %s dynamodb table\n' "$TABLE_STATUS" "$TABLE_NAME"
fi

popd