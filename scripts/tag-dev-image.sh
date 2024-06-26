#!/bin/bash

if [[ "$#" -ne 2 ]]; then
	cat <<-'EOF'
		use:
		bash scripts/tag-dev-image.sh --app-name go-migrate
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
	case $1 in
	--app-name)
		APP_NAME="$2"
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
SHORT_GIT_SHA_LENGTH=$(yq '.scripts.env_var.set.SHORT_GIT_SHA_LENGTH.default' $PROJECT_CONF)
HASH=$(git rev-parse --short=$SHORT_GIT_SHA_LENGTH HEAD)
LOCAL_IMAGE_TAG="$APP_NAME:$HASH"

ENV=dev
ENV_ID=$(source scripts/print-env-id.sh)

DEV_REPO=$(source scripts/print-ecr-repo-uri.sh --app-name $APP_NAME --env dev --env-id $ENV_ID)
DEV_IMAGE_TAG="$DEV_REPO:$HASH"

docker tag $LOCAL_IMAGE_TAG $DEV_IMAGE_TAG

echo "tagged \"$LOCAL_IMAGE_TAG\" as \"$DEV_IMAGE_TAG\""
