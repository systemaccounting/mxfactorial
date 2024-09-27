#!/bin/bash

if [[ "$#" -ne 6 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/deploy-last-image.sh --app-name go-migrate --env dev --env-id 12345
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --env) ENV="$2"; shift ;;
		--env-id) ENV_ID="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
ID_ENV="$ENV_ID-$ENV"
ID_ENV_PREFIX="$ENV_ID/$ENV"
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

IMAGE_NAME="$ID_ENV_PREFIX/$APP_NAME"
LAMBDA_NAME="$APP_NAME-$ID_ENV"

DEPLOYED_IMAGE=$(aws lambda get-function --function-name $LAMBDA_NAME --region $REGION --query 'Code.ImageUri' --output text)

# test for image manifest sha tag
if [[ $(tr -dc '@' <<< "$DEPLOYED_IMAGE" | wc -c | xargs) -gt 0 ]]; then
	IFS='@' read -ra DEPLOYED_IMAGE <<< "$DEPLOYED_IMAGE"
	REPO_NAME=${DEPLOYED_IMAGE[0]}
	DEPLOYED_IMAGE_TAG_VERSION=${DEPLOYED_IMAGE[1]}
else # assume git sha image tag
	IFS=':' read -ra DEPLOYED_IMAGE <<< "$DEPLOYED_IMAGE"
	REPO_NAME=${DEPLOYED_IMAGE[0]}
	DEPLOYED_IMAGE_TAG_VERSION=${DEPLOYED_IMAGE[1]}
fi

LATEST_ECR_IMAGE_TAG_VERSIONS=($(aws ecr describe-images --repository-name $IMAGE_NAME --output text --query 'sort_by(imageDetails,& imagePushedAt)[-1].imageTags' | xargs))

for TAG_VERSION in "${LATEST_ECR_IMAGE_TAG_VERSIONS[@]}"; do
	if [[ "$TAG_VERSION" == "$DEPLOYED_IMAGE_TAG_VERSION" ]]; then
		echo "*** $LAMBDA_NAME has latest image tag $DEPLOYED_IMAGE_TAG_VERSION deployed. skipping deployment"
		exit 0
	fi
done

LATEST_ECR_IMAGE_TAG_VERSION="${LATEST_ECR_IMAGE_TAG_VERSIONS[0]}"

LATEST_ECR_IMAGE="${REPO_NAME}:${LATEST_ECR_IMAGE_TAG_VERSION}"
LAST_MOD=$(aws lambda update-function-code --function-name $LAMBDA_NAME --image-uri $LATEST_ECR_IMAGE --region $REGION --query 'LastModified' --output text)
echo "*** $LATEST_ECR_IMAGE image deployed to lambda @ $LAST_MOD"