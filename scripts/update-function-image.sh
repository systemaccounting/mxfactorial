#!/bin/bash

set -e

if [[ "$#" -ne 4 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/update-function-image.sh \
	        --app-name go-migrate \
	        --env dev
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
ENV_ID=$(source scripts/print-env-id.sh)
ID_ENV="$ENV_ID-$ENV"
REPO=$(source scripts/print-ecr-repo-name.sh --image-prefix $APP_NAME --env $ENV)
TAG_VERSION=latest
IMAGE_NAME=$REPO:$TAG_VERSION
LAMBDA_NAME="$APP_NAME-$ID_ENV"
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

MOD=$(aws lambda update-function-code \
		--function-name="$LAMBDA_NAME" \
		--image-uri=$IMAGE_NAME \
		--region=$REGION \
		--query 'LastModified' \
		--output text)

echo "*** $LAMBDA_NAME lambda deployed @ $MOD"