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

HASH=$(git rev-parse --short=7 HEAD)
IMAGE_TAG="$APP_NAME:$HASH"
DOCKERFILE_PATH=./docker/$APP_NAME.Dockerfile

COUNT=$(docker image ls | grep --color=never -E "^$APP_NAME.*latest" | wc -l | xargs)

if [[ $COUNT -gt 0 ]]; then
	docker tag $APP_NAME:latest $IMAGE_TAG
else
	docker build -f $DOCKERFILE_PATH -t $IMAGE_TAG "$BUILD_CTX"
fi
