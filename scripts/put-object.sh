#!/bin/bash

set -e

if [[ "$#" -ne 6 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/put-object.sh \
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

ARTIFACTS_BUCKET_PREFIX=$(yq '.infrastructure.terraform.aws.modules["project-storage"].env_var.set.ARTIFACTS_BUCKET_PREFIX.default' $PROJECT_CONF)

APP_DIR_PATH=$(source scripts/list-dir-paths.sh --type app | grep --color=never "$APP_NAME")

ENV_ID=$(source scripts/print-env-id.sh)

REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

ETAG=$(aws s3api put-object \
	--bucket="$ARTIFACTS_BUCKET_PREFIX-$ENV_ID-$ENV" \
	--key=$ARTIFACT_NAME \
	--body="$PWD/$APP_DIR_PATH/$ARTIFACT_NAME" \
	--region=$REGION \
	--query='ETag' \
	--output=text \
	| xargs)

echo "*** pushed $ARTIFACT_NAME artifact with ETag: $ETAG"