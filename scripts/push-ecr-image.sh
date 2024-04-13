#!/bin/bash

if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/push-ecr-image.sh \
		--curr-tag 123456789101.dkr.ecr.us-east-1.amazonaws.com/rule-12345-dev:93496996
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --curr-tag) CURR_TAG="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

source scripts/test-image-name.sh --curr-tag "$CURR_TAG"

source scripts/auth-ecr.sh

docker push $CURR_TAG