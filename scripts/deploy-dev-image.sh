#!/bin/bash

set -e

if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/deploy-dev-image.sh --app-name go-migrate
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
ENV=dev
ENV_ID=$(source scripts/print-env-id.sh)
ID_ENV="$ENV_ID/$ENV"
REPO_NAME="$ID_ENV/$APP_NAME"

REPO_URI=$(aws ecr describe-repositories \
	--query "repositories[?contains(repositoryUri, \`$REPO_NAME\`)].repositoryUri" \
	--output text \
	--region $REGION)

LATEST_ECR_IMAGE_TAG_VERSIONS=($(aws ecr describe-images --repository-name $IMAGE_NAME --output text --query 'sort_by(imageDetails,& imagePushedAt)[-1].imageTags' | xargs))
LATEST_ECR_IMAGE_TAG_VERSION="${LATEST_ECR_IMAGE_TAG_VERSIONS[0]}"

IMAGE_TAG=$REPO_URI:$LATEST_ECR_IMAGE_TAG_VERSION

source scripts/update-function-image.sh \
	--app-name $APP_NAME \
	--curr-tag $IMAGE_TAG \
	--env dev