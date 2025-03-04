#!/bin/bash

if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/test-image-name.sh --curr-tag 123456789101.dkr.ecr.us-east-1.amazonaws.com/12345/dev/rule:93496996
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

IFS=':' read -r -a CURR_TAG_ARR <<< "$CURR_TAG"

if [[ ${#CURR_TAG_ARR[@]} -ne 2 ]]; then
	echo "tag must be in the format app-name:hash"
	exit 1
fi

declare TESTED_APP_NAME
# parse app-name from image-repo
for d in $(source scripts/list-deployments.sh); do
	# remove directory path
	APP_NAME=$(basename $d)
	# test for substring match
	if [[ $CURR_TAG == *$APP_NAME* ]]; then
		TESTED_APP_NAME=$APP_NAME
	fi
done

if [[ -z $TESTED_APP_NAME ]]; then
	echo "error: failed to match service name with $CURR_TAG"
	source scripts/list-deployments.sh | xargs basename
	exit 1
fi