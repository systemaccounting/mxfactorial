#!/bin/bash

PROJECT_CONF=project.yaml

INVENTORY=($(bash scripts/list-dir-paths.sh --type app))

declare -a DEPLOYMENTS

for app_dir in "${INVENTORY[@]}"; do
	APP_CONF_PATH=$(bash scripts/dir-to-conf-path.sh "$app_dir")
	DEPLOY_TARGET=$(yq "$APP_CONF_PATH.deploy_target" $PROJECT_CONF)
	# skip apps without a deploy target
	if [[ $DEPLOY_TARGET != "null" && -n "$DEPLOY_TARGET" ]]; then
		DEPLOYMENTS+=("$app_dir")
	fi
done

printf '%s\n' "${DEPLOYMENTS[@]}"