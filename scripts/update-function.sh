#!/bin/bash

set -e

if [[ "$#" -ne 8 ]]; then
	cat <<- 'EOF'
	use:
	bash update-function.sh \
	        --app-name request-create \
	        --artifact-name request-create-src.zip \
	        --env dev \
	        --region us-east-1
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --artifact-name) ARTIFACT_NAME="$2"; shift ;;
        --env) ENVIRONMENT="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json
ARTIFACT_BUCKET_NAME_PREFIX=$(jq -r ".artifacts_bucket_name_prefix" $PROJECT_CONFIG)
ARTIFACT_FILE_PATH=$(jq -r ".apps.\"$APP_NAME\".path" $PROJECT_CONFIG)
LAMBDA_NAME_PREFIX=$(jq -r ".apps.\"$APP_NAME\".\"lambda-name-prefix\"" $PROJECT_CONFIG)
LAMBDA_NAME="$LAMBDA_NAME_PREFIX-$ENVIRONMENT"

MOD=$(aws lambda update-function-code \
		--function-name="$LAMBDA_NAME" \
		--s3-key=$ARTIFACT_NAME \
		--s3-bucket="$ARTIFACT_BUCKET_NAME_PREFIX-$ENVIRONMENT" \
		--region=$REGION \
		--query 'LastModified' \
		--output text)

echo "*** $LAMBDA_NAME lambda deployed @ $MOD"