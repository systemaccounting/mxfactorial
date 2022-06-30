#!/bin/bash

set -e

# print use
if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/mock-go-ifaces.sh --app-or-pkg-name sqlbuilder

	*note: set mocked_ifaces list in project.json
	EOF
	exit 1
fi

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-or-pkg-name) APP_OR_PKG_NAME="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json
MOCK_PACKAGE_PREFIX=$(jq -r '.gomock.package_name_prefix' "$PROJECT_CONFIG")
MOCK_FILE_SUFFIX=$(jq -r '.gomock.file_name_suffix' "$PROJECT_CONFIG")

# source commonly used functions
source ./scripts/shared-error.sh

# set PROJECT_JSON_PROPERTY variable
source ./scripts/shared-set-property.sh

# set DIR_PATH variable
source ./scripts/shared-set-dir-path.sh

MOCKED_IFACES_PROPERTY='mocked_interfaces'

# test if mocked_ifaces property set in project.json
IS_MOCKED_IFACES_SET=$(jq "$PROJECT_JSON_PROPERTY | keys | any(. == \"$MOCKED_IFACES_PROPERTY\")" $PROJECT_CONFIG)
if [[ "$IS_MOCKED_IFACES_SET" != 'true' ]]; then
	# error when mocked_ifaces property not in project.json for app or pkg
	error_exit "\"$MOCKED_IFACES_PROPERTY\" is NOT set in $PROJECT_CONFIG under $PROJECT_JSON_PROPERTY. exiting."
fi

# get list of packages to mock from project.json
PKGS_TO_MOCK=($(jq -r "$PROJECT_JSON_PROPERTY.$MOCKED_IFACES_PROPERTY | keys | join (\" \")" "$PROJECT_CONFIG"))

for p in "${PKGS_TO_MOCK[@]}"; do

  # e.g. github.com/jackc/pgx/v4
  GO_PKG_IMPORT_PATH="$p"

  # create comma separated list of package interfaces to mock and pass as arg to gomock
  # e.g InsertSQLBuilder,UpdateSQLBuilder,SelectSQLBuilder,DeleteSQLBuilder
  IFACE_LIST=$(jq -r "$PROJECT_JSON_PROPERTY.$MOCKED_IFACES_PROPERTY.\"$p\" | join(\",\")" "$PROJECT_CONFIG")

  MOCK_PACKAGE_NAME="$MOCK_PACKAGE_PREFIX"_"$APP_OR_PKG_NAME"
  MOCK_FILE_PREFIX=$(basename "$GO_PKG_IMPORT_PATH")
  MOCK_FILE_NAME="$MOCK_FILE_PREFIX"_"$MOCK_FILE_SUFFIX"
  MOCK_FILE="./$DIR_PATH/$MOCK_PACKAGE_NAME/$MOCK_FILE_NAME"

  # create mock file of interfaces in subdirectory
  mockgen -package "$MOCK_PACKAGE_NAME" -destination "$MOCK_FILE" "$GO_PKG_IMPORT_PATH" "$IFACE_LIST"
done