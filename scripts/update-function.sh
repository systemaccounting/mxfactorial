#!/bin/bash

set -e

if [[ "$#" -ne 6 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/update-function.sh \
	        --app-name request-create \
	        --artifact-name request-create-src.zip \
	        --env dev
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --artifact-name) ARTIFACT_NAME="$2"; shift ;;
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml

ENV_ID=$(source scripts/print-env-id.sh)

ID_ENV="$ENV_ID-$ENV"

ARTIFACTS_BUCKET_PREFIX=$(yq '.infrastructure.terraform.aws.modules["project-storage"].env_var.set.ARTIFACTS_BUCKET_PREFIX.default' $PROJECT_CONF)

LAMBDA_NAME="$APP_NAME-$ID_ENV"

REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

MOD=$(aws lambda update-function-code \
		--function-name="$LAMBDA_NAME" \
		--s3-key=$ARTIFACT_NAME \
		--s3-bucket="$ARTIFACTS_BUCKET_PREFIX-$ID_ENV" \
		--region=$REGION \
		--query 'LastModified' \
		--output text)

echo "*** $LAMBDA_NAME lambda deployed @ $MOD"