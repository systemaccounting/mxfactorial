#!/bin/bash

set -e

# print use
if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/mock-go-ifaces.sh --app-or-pkg-name sqls

	*note: set mocked_ifaces list in project.yaml
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

PROJECT_CONF=project.yaml
GO_MOCK_PACKAGE_NAME_PREFIX=$(yq '.scripts.env_var.set.GO_MOCK_PACKAGE_NAME_PREFIX.default' "$PROJECT_CONF")
GO_MOCK_FILE_NAME_SUFFIX=$(yq '.scripts.env_var.set.GO_MOCK_FILE_NAME_SUFFIX.default' "$PROJECT_CONF")

# source commonly used functions
source ./scripts/shared-error.sh

if [[ $(bash scripts/list-dir-paths.sh --type all | grep --color=never "$APP_OR_PKG_NAME$" >/dev/null 2>&1; echo $?) -ne 0 ]]; then
  error_exit "\"$APP_OR_PKG_NAME\" NOT in $PROJECT_CONF. exiting."
fi

APP_DIR_PATH=$(source scripts/list-dir-paths.sh --type all | grep --color=never "$APP_OR_PKG_NAME$")

CONF_PATH=$(source scripts/dir-to-conf-path.sh $APP_DIR_PATH)

MOCKED_IFACES_PROPERTY='mocked_interfaces'

if [[ $(yq "$CONF_PATH | has(\"$MOCKED_IFACES_PROPERTY\")" $PROJECT_CONF) == 'false' ]]; then
  # error when mocked_ifaces property not in project.yaml for app or pkg
  error_exit "\"$MOCKED_IFACES_PROPERTY\" is NOT set in $PROJECT_CONF under $CONF_PATH. exiting."
fi

# get list of packages to mock from project.yaml
PKGS_TO_MOCK=($(yq "$CONF_PATH.$MOCKED_IFACES_PROPERTY | keys | join (\" \")" $PROJECT_CONF))

for p in "${PKGS_TO_MOCK[@]}"; do

  # e.g. github.com/jackc/pgx/v4
  GO_PKG_IMPORT_PATH="$p"

  # create comma separated list of package interfaces to mock and pass as arg to gomock
  # e.g InsertSQLBuilder,UpdateSQLBuilder,SelectSQLBuilder,DeleteSQLBuilder
  IFACE_LIST=$(yq "$CONF_PATH.$MOCKED_IFACES_PROPERTY[\"$p\"] | join(\",\")" $PROJECT_CONF)

  MOCK_PACKAGE_NAME="$GO_MOCK_PACKAGE_NAME_PREFIX"_"$APP_OR_PKG_NAME"
  MOCK_FILE_PREFIX=$(basename "$GO_PKG_IMPORT_PATH")
  MOCK_FILE_NAME="$MOCK_FILE_PREFIX"_"$GO_MOCK_FILE_NAME_SUFFIX"
  MOCK_FILE="./$APP_DIR_PATH/$MOCK_PACKAGE_NAME/$MOCK_FILE_NAME"

  # create mock file of interfaces in subdirectory
  mockgen -package "$MOCK_PACKAGE_NAME" -destination "$MOCK_FILE" "$GO_PKG_IMPORT_PATH" "$IFACE_LIST"
done