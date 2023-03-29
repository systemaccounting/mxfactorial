#!/bin/bash

set -e

if [[ "$#" -lt 2 ]] || [[ "$#" -gt 3 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/list-changed-pkgs.sh --pkg-name tools

	OPTIONAL ARGS:
	"--debug", prints variable contents
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --pkg-name) PKG_NAME="$2"; shift ;;
        --debug) DEBUG=1 ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json
IS_IN_PROJECT_JSON=$(jq ".pkgs | keys | any(. == \"$PKG_NAME\")" $PROJECT_CONFIG)

if [[ "$IS_IN_PROJECT_JSON" == 'false' ]]; then
	echo "\"$PKG_NAME\" NOT in $PROJECT_CONFIG pkgs. exiting."
	exit 1
fi

# parse module path from go.mod file
GO_MOD_FILE_PATH=.
GO_MOD_FILE_NAME=go.mod
GO_MOD_FILE="$GO_MOD_FILE_PATH/$GO_MOD_FILE_NAME"
GO_MOD=$(head -n 1 $GO_MOD_FILE | awk '{print $2}')
PKG_DIR=$(jq -r ".pkgs.$PKG_NAME.path" $PROJECT_CONFIG)
GO_PKG="$GO_MOD/$PKG_DIR"
MOCK_FILE_SUFFIX=$(jq -r '.gomock.file_name_suffix' "$PROJECT_CONFIG")
MOCK_PACKAGE_PREFIX=$(jq -r '.gomock.package_name_prefix' "$PROJECT_CONFIG")

# create array to store go packages affected by neighboring go package change
# todo: eliminate interpackage dependencies by importing them into main packages
declare -a CHANGED_PKGS
CHANGED_PKGS=("$GO_PKG")

# create array to store files affected by changes to go packages
declare -a IMPORTING_PKG_FILES

# list files importing the initially changed package
for i in $(grep -r \"$GO_PKG\" ./pkg | awk '{print $1}' | sed 's/\.go.*/\.go/'); do
	# exclude files created by mockgen
	if [[ "$i" != *"$MOCK_FILE_SUFFIX" ]]; then
		IMPORTING_PKG_FILES+=("$i")
	fi
done

# create array to store go package directories affected go package changes
declare -a IMPORTING_PKG_DIRS

# list go package directories affected by go package changes
for i in $(printf '%s\n' "${IMPORTING_PKG_FILES[@]}" | grep ./pkg | sed 's/\.\///' | xargs dirname); do

	# loop through already listed go package directories affected by go package changes
	for d in "${IMPORTING_PKG_DIRS[@]}"; do

		# test list for pending duplicate
		if [[ $i == $d ]]; then
			# skip adding duplicate by continuing root loop
			continue 2
		fi

	done

	# add package directory affected by neighboring go package change
	IMPORTING_PKG_DIRS+=("$i")
done

# start while loop count with first go package changed
LOOPS_PENDING="${#CHANGED_PKGS[@]}"

# print progress
function log_changed_pkgs() {
	if [[ -n $DEBUG ]]; then
		echo "IMPORTING_PKG_FILES: ${#IMPORTING_PKG_FILES[@]}"
		printf '%s\n' "${IMPORTING_PKG_FILES[@]}"
		echo "--------"
		echo "IMPORTING_PKG_DIRS: ${#IMPORTING_PKG_DIRS[@]}"
		printf '%s\n' "${IMPORTING_PKG_DIRS[@]}"
		echo "--------"
		echo "CHANGED_PKGS: ${#CHANGED_PKGS[@]}"
		printf '%s\n' "${CHANGED_PKGS[@]}"
		echo "********"
	fi
}

# loop while additional go packages are found
# importing currently changed go package
while [[ $LOOPS_PENDING -gt 0 ]]; do

	# loop through go package directories
	# importing currently changed go package
	for d in "${IMPORTING_PKG_DIRS[@]}"; do

		# prefix project go module path to importing go package directory, for example:
		# "github.com/systemaccounting/mxfactorial" + "/" + "pkg/request"
		IMPORTING_PKG=$GO_MOD/$d

		# loop through listed go packages affected by a go package change
		for p in "${CHANGED_PKGS[@]}"; do
			if [[ $IMPORTING_PKG == $p ]]; then
				# continue parent loop to skip adding already listed packages to CHANGED_PKGS
				continue 2
			fi
		done

		# add newly detected go package affected by neighboring go package change to CHANGED_PKGS
		CHANGED_PKGS+=("$IMPORTING_PKG")

		# add a loop to search other files affected by newly listed
		# go package affected by neighboring go package change
		LOOPS_PENDING=$(($LOOPS_PENDING + 1))

		# list all files importing changed go package
		# for exmaple:
		# 1. "github.com/systemaccounting/mxfactorial/pkg/tools" was changed
		# 2. "github.com/systemaccounting/mxfactorial/pkg/request" imports "github.com/systemaccounting/mxfactorial/pkg/tools"
		# 3. these .go files import "github.com/systemaccounting/mxfactorial/pkg/request"
		ADDED_IMPORTING_PKG_FILES=$(grep -r \"$IMPORTING_PKG\" ./pkg | awk '{print $1}' | sed 's/\.go.*/\.go/')

		# loop through newly detected .go files importing changed go package
		for a in $ADDED_IMPORTING_PKG_FILES; do

			# loop through already listed .go files importing changed go package
			for i in "${IMPORTING_PKG_FILES[@]}"; do
				if [[ $i == $a ]]; then
					# continue parent loop to skip files already
					# listed as affected by change to go package
					continue 2
				fi
			done

			# exclude files created by mockgen
			if [[ "$a" != *"$MOCK_FILE_SUFFIX" ]]; then
				# add .go file affected by go package change to list
				IMPORTING_PKG_FILES+=("$a")
			fi

			# parse path of file in affected go package directory
			ADDED_IMPORTING_PKG_DIRS=$(echo "$a" | grep ./pkg | sed 's/\.\///' | xargs dirname)

			# loop through go package directories referenced in newly added .go files
			for aipd in $ADDED_IMPORTING_PKG_DIRS; do

				# loop through already listed go package directories affected changed go package
				for d2 in "${IMPORTING_PKG_DIRS[@]}"; do
					if [[ $d2 == $aipd ]]; then
						# continue outer loop to skip adding already listed
						# go package directories affected by changed go package
						continue 2
					fi
				done

				# exclude mockgen files
				if [[ "$aipd" != *"/$MOCK_PACKAGE_PREFIX"_* ]]; then
					# add newly detected package directory to list of
					# go package directories affected by changed go package
					IMPORTING_PKG_DIRS+=("$aipd")
				fi
			done
		done
	done

	# remove finished loop
	LOOPS_PENDING=$(($LOOPS_PENDING - 1))
done

log_changed_pkgs