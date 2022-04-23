#!/bin/bash

set -e

# print use
if [[ "$#" -ne 2 ]] && [[ "$#" -ne 3 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/test-dependents.sh --app-or-pkg-name tools

	OPTIONAL ARGS:
	"--debug", prints variable contents
	EOF
	exit 1
fi

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-or-pkg-name) APP_OR_PKG_NAME="$2"; shift ;;
        --debug) DEBUG=1;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json
# test if in project.json apps
IS_PKG_IN_PROJECT_JSON=$(jq ".pkgs | keys | any(. == \"$APP_OR_PKG_NAME\")" $PROJECT_CONFIG)
# test if in project.json apps
IS_APP_IN_PROJECT_JSON=$(jq ".apps | keys | any(. == \"$APP_OR_PKG_NAME\")" $PROJECT_CONFIG)

# test if jq any found app or pkg
if [[ "$IS_APP_IN_PROJECT_JSON" == 'false' ]] && [[ "$IS_PKG_IN_PROJECT_JSON" == 'false' ]]; then
	echo "\"$APP_OR_PKG_NAME\" NOT in $PROJECT_CONFIG \"apps\" OR \"pkgs\". exiting."
	exit 1
fi

declare -a FROM_PROJECT_JSON
declare -a FROM_SCRIPT

# assign FROM_PROJECT_JSON and FROM_SCRIPT arrays
# from "pkgs" scripts and  project.json properties
if [[ "$IS_PKG_IN_PROJECT_JSON" == 'true' ]]; then
	UNSORTED_FROM_PROJECT_JSON=($(jq -r ".pkgs.\"$APP_OR_PKG_NAME\".dependents | join(\" \")" $PROJECT_CONFIG))
	FROM_PROJECT_JSON=($(printf '%s\n' ${UNSORTED_FROM_PROJECT_JSON[@]} | sort))
	# IMPORTING_PKG_DIRS variable assigned from list-changed-pkgs.sh
	source scripts/list-changed-pkgs.sh --pkg-name "$APP_OR_PKG_NAME"
	for p in "${IMPORTING_PKG_DIRS[@]}"; do
		UNSORTED_FROM_SCRIPT+=($(basename "$p"))
	done
	FROM_SCRIPT=($(printf '%s\n' ${UNSORTED_FROM_SCRIPT[@]} | sort))
fi

# assign FROM_PROJECT_JSON and FROM_SCRIPT arrays
# from "apps" scripts and project.json properties
if [[ "$IS_APP_IN_PROJECT_JSON" == 'true' ]]; then
	UNSORTED_FROM_PROJECT_JSON=($(jq -r ".apps.\"$APP_OR_PKG_NAME\".dependents | join(\" \")" $PROJECT_CONFIG))
	FROM_PROJECT_JSON=($(printf '%s\n' ${UNSORTED_FROM_PROJECT_JSON[@]} | sort))
	# DEPENDENT_SVCS variable assigned from list-dependent-svcs.sh
	source scripts/list-dependent-svcs.sh --app-name "$APP_OR_PKG_NAME"
	for p in "${DEPENDENT_SVCS[@]}"; do
		UNSORTED_FROM_SCRIPT+=($(basename "$p"))
	done
	FROM_SCRIPT=($(printf '%s\n' ${UNSORTED_FROM_SCRIPT[@]} | sort))
fi

# list unnecessary dependents in project.json
declare -a UNNECESSARY
for i in "${FROM_PROJECT_JSON[@]}"; do
	for j in "${FROM_SCRIPT[@]}"; do
		if [[ "$i" == "$j" ]]; then
			continue 2
		fi
	done
	UNNECESSARY+=("$i")
done

# list missing dependents in project.json
declare -a MISSING
for k in "${FROM_SCRIPT[@]}"; do
	for l in "${FROM_PROJECT_JSON[@]}"; do
		if [[ "$k" == "$l" ]]; then
			continue 2
		fi
	done
	MISSING+=("$k")
done

if [[ -n $DEBUG ]]; then
	echo ""
	echo "APP_OR_PKG_NAME: $APP_OR_PKG_NAME"
	echo ""
	echo "FROM_SCRIPT:"
	printf '%s\n' ${FROM_SCRIPT[@]}
	echo ""
	echo "FROM_PROJECT_JSON:"
	printf '%s\n' ${FROM_PROJECT_JSON[@]}
	echo ""
fi

# error when unnecessary or missing dependents found in project.json
if [[ "${#UNNECESSARY[@]}" -gt 0 ]] || [[ "${#MISSING}" -gt 0 ]]; then
	echo "ERROR: outdated \"$APP_OR_PKG_NAME\" project.json dependents and github workflow" >&2
	echo "" >&2
	echo "1. remove unnecessary dependents from project.json:" >&2
	if [[ "${#UNNECESSARY[@]}" -eq 0 ]]; then
		printf "(none)" >&2
	fi
	printf '%s\n' ${UNNECESSARY[@]} >&2
	echo "" >&2
	echo "2. add missing dependents to project.json:" >&2
	if [[ "${#MISSING[@]}" -eq 0 ]]; then
		printf "(none)" >&2
	fi
	printf '%s\n' ${MISSING[@]} >&2
	echo "" >&2
	echo "3. change github workflow to cover current project.json dependents" >&2
	exit 1
fi

echo "*** $0: 0 missing and unnecessary project.json dependents for $APP_OR_PKG_NAME"