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

# get IMPORTING_PKG_DIRS
source ./scripts/list-changed-pkgs.sh --pkg-name "$PKG_NAME"

# create PACKAGE_NAMES array
declare -a PACKAGE_NAMES

# loop over IMPORTING_PKG_DIRS
for d in "${IMPORTING_PKG_DIRS[@]}"; do
	# add package names to PACKAGE_NAMES array
	PACKAGE_NAMES+=($(basename $d))
done

# prior art https://stackoverflow.com/a/67489301
# create json array of packages importing $PKG_NAME
NEW_DEPENDENTS=$(jq --compact-output --null-input '$ARGS.positional' --args "${PACKAGE_NAMES[@]}")

# copy package.json with new dependents into memory
CONTENTS=$(jq --indent 4 ".pkgs.$PKG_NAME.dependents = $NEW_DEPENDENTS" $PROJECT_CONFIG)

# overwrite package.json with new dependents added
echo -E "${CONTENTS}" > $PROJECT_CONFIG