#!/bin/bash

if [[ "$#" -ne 4 ]]; then
	cat <<-'EOF'
		use:
		bash scripts/build-image.sh --app-name rule --build-ctx .
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
	case $1 in
	--app-name)
		APP_NAME="$2"
		shift
		;;
	--build-ctx)
		BUILD_CTX="$2"
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
IMAGE_TAG="$APP_NAME:$HASH"
DOCKERFILE_PATH=./docker/$APP_NAME.Dockerfile

docker build -f $DOCKERFILE_PATH -t $IMAGE_TAG --provenance=false "$BUILD_CTX"