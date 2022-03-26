#!/bin/bash

set -e

if [[ "$#" -ne 2 ]] || [[ "$#" -ne 3 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/list-changed-svcs.sh --pkg-name tools

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

# get list of CHANGED_PKGS
source ./scripts/list-changed-pkgs.sh --pkg-name "$PKG_NAME"

# list service directories
SERVICE_DIR_LIST=$(jq -r '.apps | with_entries(select(.value.path | contains( "services/"))) | .[] | .path' project.json)

# create array to store services affected by changed go packages
declare -a CHANGED_SVCS

# loop through service directories
for s in $SERVICE_DIR_LIST; do

	# loop through list of changed go packages
	for pkg in "${CHANGED_PKGS[@]}"; do

		# count service directory files importing changed go package
		COUNT=$(grep -r \"$pkg\" $s | wc -l | awk '{print $1}')

		# test for at least one file in service directory importing changed go package
		if [[ $COUNT -gt 0 ]]; then

			# loop through services already listed as affected by changed go package
			for sa in "${CHANGED_SVCS[@]}"; do

				# test current service already listed
				if [[ $s == $sa ]]; then
					# continue root loop to skip adding current service to list
					continue 3
				fi
			done

			# add current service to list affected by changed go package
			CHANGED_SVCS+=("$s")
		fi
	done
done

if [[ -n $DEBUG ]]; then
	echo "CHANGED_SVCS: ${#CHANGED_SVCS[@]}"
	printf '%s\n' "${CHANGED_SVCS[@]}"
	echo "********"
fi