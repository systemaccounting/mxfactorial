#!/bin/bash

set -e

# source commonly used functions
source ./scripts/shared-error.sh

# require sourcing script to set vars
if [[ -z "$APP_OR_PKG_NAME" ]]; then
	error_exit 'APP_OR_PKG_NAME not set'
fi

if [[ -z "$PROJECT_CONFIG" ]]; then
	error_exit 'PROJECT_CONFIG not set'
fi

# test if in project.json apps
IS_APP_IN_PROJECT_JSON=$(jq ".apps | keys | any(. == \"$APP_OR_PKG_NAME\")" $PROJECT_CONFIG)

# test if in project.json pkgs
IS_PKG_IN_PROJECT_JSON=$(jq ".pkgs | keys | any(. == \"$APP_OR_PKG_NAME\")" $PROJECT_CONFIG)

# assign PROJECT_JSON_PROPERTY variable

# test if jq found $APP_OR_PKG_NAME in apps
if [[ "$IS_APP_IN_PROJECT_JSON" == 'true' ]]; then

	# init project.json path property assignment with apps
	PROJECT_JSON_PROPERTY=".apps"

# test if jq found $APP_OR_PKG_NAME in pkgs
elif [[ "$IS_PKG_IN_PROJECT_JSON" == 'true' ]]; then

	# init project.json path property assignment with pkgs
	PROJECT_JSON_PROPERTY=".pkgs"

else

	# error when script arg not found in project.json apps or pkgs
	error_exit "error: \"$APP_OR_PKG_NAME\" is NOT in $PROJECT_CONFIG. exiting."

fi

# add app or pkg name found by jq
PROJECT_JSON_PROPERTY+=".\"$APP_OR_PKG_NAME\""