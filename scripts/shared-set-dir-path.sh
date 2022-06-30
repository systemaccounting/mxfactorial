#!/bin/bash

set -e

# source commonly used functions
source ./scripts/shared-error.sh

if [[ -z "$PROJECT_CONFIG" ]]; then
	error_exit 'PROJECT_CONFIG not set'
fi

if [[ -z "$PROJECT_JSON_PROPERTY" ]]; then
	error_exit 'PROJECT_JSON_PROPERTY not set. source shared-set-property.sh first'
fi

# finish variable assignment
PATH_PROPERTY="$PROJECT_JSON_PROPERTY.path"

# set DIR_PATH for sourcing scripts
DIR_PATH=$(jq -r "$PATH_PROPERTY" "$PROJECT_CONFIG")