#!/bin/bash

if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/push-ecr-image.sh --app-name rule
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
ENV_ID=$(source scripts/print-env-id.sh)
IMAGE_TAG=$(source scripts/print-image-tag.sh --app-name $APP_NAME --env $ENV --env-id $ENV_ID)

source scripts/push-ecr-image.sh --curr-tag $IMAGE_TAG