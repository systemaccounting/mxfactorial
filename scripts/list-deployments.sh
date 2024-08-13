#!/bin/bash

PROJECT_CONF=project.yaml

INVENTORY=($(bash scripts/list-dir-paths.sh --type app))

declare -a DEPLOYMENTS

for app_dir in "${INVENTORY[@]}"; do
	APP_CONF_PATH=$(bash scripts/dir-to-conf-path.sh "$app_dir")
	DEPLOY=$(yq "$APP_CONF_PATH.deploy" $PROJECT_CONF)
	# skip apps not set to deploy
	if [[ $DEPLOY == true ]]; then
		DEPLOYMENTS+=("$app_dir")
	fi
done

echo "${DEPLOYMENTS[@]}"