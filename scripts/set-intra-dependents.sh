#!/bin/bash

set -e

# print use
if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/set-intra-pkg-deps.sh --pkg-name lambdapg
	EOF
	exit 1
fi

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --pkg-name) PKG_NAME="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json

# get IMPORTING_PKG_DIRS and CHANGED_SVCS
source scripts/list-changed-svcs.sh --pkg-name "$PKG_NAME"

# create DEPENDENTS array
declare -a DEPENDENTS

# loop over IMPORTING_PKG_DIRS
for d in "${IMPORTING_PKG_DIRS[@]}"; do
	# add package names to DEPENDENTS array
	DEPENDENTS+=($(basename $d))
done

# loop over CHANGED_SVCS
for s in "${CHANGED_SVCS[@]}"; do
	# add service names to DEPENDENTS array
	DEPENDENTS+=($(basename $s))
done

# prior art https://stackoverflow.com/a/67489301
# create json array of packages importing $PKG_NAME
NEW_DEPENDENTS=$(jq --compact-output --null-input '$ARGS.positional' --args "${DEPENDENTS[@]}")

# copy package.json with new dependents into memory
CONTENTS=$(jq --indent 4 ".pkgs.$PKG_NAME.dependents = $NEW_DEPENDENTS" $PROJECT_CONFIG)

# overwrite package.json with new dependents added
echo -E "${CONTENTS}" > $PROJECT_CONFIG