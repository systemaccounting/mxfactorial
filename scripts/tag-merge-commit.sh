#!/bin/bash

if [[ "$#" -ne 6 ]]; then
	cat <<-'EOF'
		use:
		bash scripts/tag-merge-commit.sh --app-name go-migrate --env dev --env-id 12345
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
	case $1 in
	--app-name)
		APP_NAME="$2"
		shift
		;;
	--env)
		ENV="$2"
		shift
		;;
	--env-id)
		ENV_ID="$2"
		shift
		;;
	*)
		echo "unknown parameter passed: $1"
		exit 1
		;;
	esac
	shift
done

PROJECT_CONF=project.yaml
ID_ENV="$ENV_ID-$ENV"
ID_ENV_PREFIX="$ENV_ID/$ENV"
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
SHORT_GIT_SHA_LENGTH=$(yq '.scripts.env_var.set.SHORT_GIT_SHA_LENGTH.default' $PROJECT_CONF)

IMAGE_NAME="$ID_ENV_PREFIX/$APP_NAME"
LAMBDA_NAME="$APP_NAME-$ID_ENV"

DEPLOYED_IMAGE=$(aws lambda get-function --function-name $LAMBDA_NAME --region $REGION --query 'Code.ImageUri' --output text)

# test for image manifest sha tag
if [[ $(tr -dc '@' <<<"$DEPLOYED_IMAGE" | wc -c | xargs) -gt 0 ]]; then
	IFS='@' read -ra DEPLOYED_IMAGE <<<"$DEPLOYED_IMAGE"
	REPO_NAME=${DEPLOYED_IMAGE[0]}
	DEPLOYED_IMAGE_TAG_VERSION=${DEPLOYED_IMAGE[1]}
else # assume git sha image tag
	IFS=':' read -ra DEPLOYED_IMAGE <<<"$DEPLOYED_IMAGE"
	REPO_NAME=${DEPLOYED_IMAGE[0]}
	DEPLOYED_IMAGE_TAG_VERSION=${DEPLOYED_IMAGE[1]}
fi

LATEST_ECR_IMAGE_TAG_VERSIONS=($(aws ecr describe-images --repository-name $IMAGE_NAME --output text --query 'sort_by(imageDetails,& imagePushedAt)[-1].imageTags' | xargs))

# get the commit hash after merge
MERGE_COMMIT_HASH=$(git rev-parse --short=$SHORT_GIT_SHA_LENGTH HEAD)

for TAG_VERSION in "${LATEST_ECR_IMAGE_TAG_VERSIONS[@]}"; do
	if [[ "$TAG_VERSION" == "$DEPLOYED_IMAGE_TAG_VERSION" ]]; then
		echo "*** $LAMBDA_NAME has latest image tag $DEPLOYED_IMAGE_TAG_VERSION deployed. skipping $MERGE_COMMIT_HASH retag"
		exit 0
	fi

	if [[ "$TAG_VERSION" == "$MERGE_COMMIT_HASH" ]]; then
		echo "*** $IMAGE_NAME has latest image tag $MERGE_COMMIT_HASH. skipping $MERGE_COMMIT_HASH retag"
		exit 0
	fi
done

# pick first image tag version
LATEST_ECR_IMAGE_TAG_VERSION="${LATEST_ECR_IMAGE_TAG_VERSIONS[0]}"

# https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-retag.html
MANIFEST=$(aws ecr batch-get-image \
	--repository-name $IMAGE_NAME \
	--region $REGION \
	--image-ids imageTag=$LATEST_ECR_IMAGE_TAG_VERSION \
	--output text \
	--query 'images[].imageManifest')

# retag image with merge commit hash
aws ecr put-image --repository-name $IMAGE_NAME --image-tag $MERGE_COMMIT_HASH --region $REGION --image-manifest "$MANIFEST" 1>/dev/null

echo "*** $REPO_NAME image retagged with $MERGE_COMMIT_HASH merge commit hash"
