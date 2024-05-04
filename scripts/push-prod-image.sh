#!/bin/bash

if [[ "$#" -ne 6 ]]; then
	cat <<-'EOF'
		use:
		bash scripts/push-prod-image.sh --app-name rule --env dev --env-id 12345
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
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
REPO_NAME="$ID_ENV_PREFIX/$APP_NAME"
PROD_ENV_ID=$(yq '.infrastructure.terraform.env-id.prod.env_var.set.PROD_ENV_ID.default' $PROJECT_CONF)
SHORT_GIT_SHA_LENGTH=$(yq '.scripts.env_var.set.SHORT_GIT_SHA_LENGTH.default' $PROJECT_CONF)

MERGE_COMMIT_HASH=$(git rev-parse --short=$SHORT_GIT_SHA_LENGTH HEAD)

TAG_COUNT=$(aws ecr batch-get-image \
	--repository-name=$REPO_NAME \
	--image-ids=imageTag=$MERGE_COMMIT_HASH \
	--region $REGION \
	--query 'length(images[*])' \
	--output text)

if [[ $TAG_COUNT -gt 0 ]]; then
	DEV_TAG=$(source scripts/print-ecr-repo-uri.sh --app-name $APP_NAME --env $ENV --env-id $ENV_ID):$MERGE_COMMIT_HASH
	PROD_TAG=$(source scripts/print-ecr-repo-uri.sh --app-name $APP_NAME --env prod --env-id $PROD_ENV_ID):$MERGE_COMMIT_HASH

	# auth
	source scripts/auth-ecr.sh

	# pull dev image
	docker pull $DEV_TAG

	# tag dev image as prod image
	docker tag $DEV_TAG $PROD_TAG
	echo "\"$DEV_TAG\" tagged as \"$PROD_TAG\""

	# push prod image
	source scripts/push-ecr-image.sh --curr-tag $PROD_TAG
fi
