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

# extract repo name from deployed image
if [[ $(tr -dc '@' <<< "$DEPLOYED_IMAGE" | wc -c | xargs) -gt 0 ]]; then
	IFS='@' read -ra DEPLOYED_IMAGE_PARTS <<< "$DEPLOYED_IMAGE"
	REPO_NAME=${DEPLOYED_IMAGE_PARTS[0]}
else
	IFS=':' read -ra DEPLOYED_IMAGE_PARTS <<< "$DEPLOYED_IMAGE"
	REPO_NAME=${DEPLOYED_IMAGE_PARTS[0]}
fi

# get deployed image digest from lambda
DEPLOYED_DIGEST=$(aws lambda get-function --function-name $LAMBDA_NAME --region $REGION --query 'Code.ResolvedImageUri' --output text | grep -o 'sha256:[a-f0-9]*')

# get latest ecr image digest and tag
LATEST_ECR_IMAGE=$(aws ecr describe-images --repository-name $IMAGE_NAME --output json --query 'sort_by(imageDetails,& imagePushedAt)[-1]')
LATEST_ECR_DIGEST=$(echo "$LATEST_ECR_IMAGE" | yq -r '.imageDigest')
LATEST_ECR_IMAGE_TAG=$(echo "$LATEST_ECR_IMAGE" | yq -r '.imageTags[0]')

# compare digests
if [[ "$DEPLOYED_DIGEST" == "$LATEST_ECR_DIGEST" ]]; then
	echo "*** $LAMBDA_NAME has latest image digest deployed. skipping deployment"
	exit 0
fi

LATEST_IMAGE="${REPO_NAME}:${LATEST_ECR_IMAGE_TAG}"
LAST_MOD=$(aws lambda update-function-code --function-name $LAMBDA_NAME --image-uri $LATEST_IMAGE --region $REGION --query 'LastModified' --output text)
echo "*** $LATEST_IMAGE deployed to lambda @ $LAST_MOD"