#!/bin/bash

if [[ "$#" -ne 2 ]]; then
	echo "use: bash scripts/create-all-env-files.sh --env dev"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json

# https://stackoverflow.com/a/28617380
DIRS_WITH_SECRETS=($(jq -r '.apps | with_entries(select(.value.secrets | length > 0)) | to_entries | .[].value.path' $PROJECT_CONFIG))

for d in ${DIRS_WITH_SECRETS[@]}; do
	echo "creating .env file in $d"
	(cd $d; make get-secrets ENV=$ENV)
done