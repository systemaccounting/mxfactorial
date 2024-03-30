#!/bin/bash

if [[ "$#" -ne 4 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/push-ecr-image.sh --image-prefix go-migrate --env dev
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --image-prefix) IMAGE_PREFIX="$2"; shift ;;
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

source scripts/auth-ecr-repo.sh --image-prefix $IMAGE_PREFIX --env $ENV

REPO=$(source scripts/print-ecr-repo-name.sh --image-prefix $IMAGE_PREFIX --env $ENV)

PROJECT_CONF=project.yaml
ENV=dev
ENV_ID=$(source scripts/print-env-id.sh)
ID_ENV="$ENV_ID-$ENV"
TAG_VERSION=latest

IMAGE_NAME=$REPO:$TAG_VERSION

docker tag $IMAGE_PREFIX $REPO

docker push $REPO