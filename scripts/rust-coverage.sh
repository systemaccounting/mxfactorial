#!/bin/bash

PROJECT_CONF=project.yaml

CRATE_PATHS=($(yq "... | select(has(\"min_code_cov\") and .min_code_cov != null and .runtime == \"rust1.x\") | path | join(\"/\")" $PROJECT_CONF))

for cp in "${CRATE_PATHS[@]}"; do
	CRATE_NAME=$(echo $cp | awk -F'/' '{print $2}')
	CONF_PATH=$(echo $cp | awk -F'/' '{print $1"."$2}')
	MIN_CODE_COV=$(yq ".$CONF_PATH.min_code_cov" $PROJECT_CONF)
	COV=$(make rust-coverage-percent RUST_PKG=$CRATE_NAME)

	# github runners produce lower coverage than local
	GITHUB_RUNNER_ERROR=1
	GITHUB_RUNNER_ADJUSTED=$(($COV - $GITHUB_RUNNER_ERROR))

	if [[ $GITHUB_RUNNER_ADJUSTED -lt $MIN_CODE_COV ]]; then
		echo "error: $GITHUB_RUNNER_ADJUSTED% $cp code coverage is less than configured $MIN_CODE_COV% min_code_cov in project.yaml"
		exit 1
	fi
done