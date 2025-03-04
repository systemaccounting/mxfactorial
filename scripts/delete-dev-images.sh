#!/bin/bash

set -e

if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/delete-dev-images.sh --app-name client
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
ENV=dev
ENV_ID=$(source ./scripts/print-env-id.sh)
ID_ENV_PREFIX="$ENV_ID/$ENV"
REPO_NAME="$ID_ENV_PREFIX/$APP_NAME"
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

# returns: sha256:a9be998dcb5479d44b471381b79cb26a3b864d0fe996943c7abaf42c99638c9d	sha256:ae20a55d89d8cece6f38dad19806637b400888fc6375bc167d6cf252e34dcb93	sha256:67dcb4b0a3bbc0bafb16cc163178f3b6c0a0d103694c26f085197c7015c33914
IMAGE_DIGESTS=($(aws ecr list-images --repository-name $REPO_NAME --registry-id $AWS_ACCOUNT_ID --region $REGION --query 'imageIds[*].imageDigest' --output text))

declare IMAGE_IDS
# add imageDigest assignments to IMAGE_IDS
for i in "${IMAGE_DIGESTS[@]}"; do
  IMAGE_IDS+="imageDigest=$i "
done

# remove trailing whitespace
IMAGE_IDS=$(echo $IMAGE_IDS | xargs)

aws ecr batch-delete-image --repository-name $REPO_NAME --registry-id $AWS_ACCOUNT_ID --region $REGION --image-ids $IMAGE_IDS