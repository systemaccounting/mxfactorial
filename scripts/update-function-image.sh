#!/bin/bash

set -e

if [[ "$#" -ne 6 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/update-function-image.sh \
	        --app-name go-migrate \
			--curr-tag 123456789101.dkr.ecr.us-east-1.amazonaws.com/rule-12345-dev:93496996 \
	        --env dev
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
		--curr-tag) CURR_TAG="$2"; shift ;;
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
ENV_ID=$(source scripts/print-env-id.sh)
ID_ENV="$ENV_ID-$ENV"
LAMBDA_NAME="$APP_NAME-$ID_ENV"
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

LAST_MOD=$(aws lambda update-function-code \
		--function-name="$LAMBDA_NAME" \
		--image-uri=$CURR_TAG \
		--region=$REGION \
		--query 'LastModified' \
		--output text)

echo "*** $LAMBDA_NAME lambda deployed @ $LAST_MOD"