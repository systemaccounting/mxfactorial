#!/bin/bash

set -e

if [[ "$#" -lt 2 ]] || [[ "$#" -gt 4 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/list-dependent-svcs.sh --app-name graphql

	OPTIONAL ARGS:
	"--recursive", lists dependent services recursively
	"--debug", prints variable contents
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --recursive) RECURSIVE=1 ;;
        --debug) DEBUG=1 ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json
IS_APP_IN_PROJECT_JSON=$(jq ".apps | keys | any(. == \"$APP_NAME\")" $PROJECT_CONFIG)
IS_PKG_IN_PROJECT_JSON=$(jq ".pkgs | keys | any(. == \"$APP_NAME\")" $PROJECT_CONFIG)

if [[ "$IS_APP_IN_PROJECT_JSON" == 'false' ]]; then
	if [[ "$IS_PKG_IN_PROJECT_JSON" == 'true' ]]; then
		echo "\"$APP_NAME\" IS in $PROJECT_CONFIG \"pkgs\" and NOT in \"apps\". exiting."
		exit 1
	fi
	echo "\"$APP_NAME\" NOT in $PROJECT_CONFIG \"apps\". exiting."
	exit 1
fi

# create list of services dependent on app
DEPENDENT_SVCS=($(jq -r ".apps.\"$APP_NAME\".dependents | .[]" $PROJECT_CONFIG))

# store loop count for max threshold
LOOPS=0
# store pending loops to enabling increasing them
PENDING_LOOPS=1

# find recursive dependencies when "--recursive" passed
if [[ -n $RECURSIVE ]]; then

	# avoid more than 10 loops, and test for added loops
	while [[ $LOOPS -lt 10 ]] && [[ $PENDING_LOOPS -gt 0 ]]; do

		# loop over dependent services
		for s in "${DEPENDENT_SVCS[@]}"; do

			# create list of next generation dependent services
			RECURSIVELY_DEPENDENT_SVCS=($(jq -r ".apps.\"$s\".dependents | .[]" $PROJECT_CONFIG))

			# loop over next generation dependent services
			for r in "${RECURSIVELY_DEPENDENT_SVCS[@]}"; do

				# loop over already listed dependent services
				for d in "${DEPENDENT_SVCS[@]}"; do

					# test dependent services list for already
					# listed next generation dependent services
					if [[ $r == $d ]]; then

						# continue parent loop to skip adding already
						# listed next generation dependent services
						continue 2
					fi
				done

				# add next generation dependent services to dependent services list
				DEPENDENT_SVCS+=("$r")
				# add loop to test for next generation
				# dependent of newly added dependent service
				PENDING_LOOPS=$(($PENDING_LOOPS+1))
			done
		done
		# finish loop
		LOOPS=$(($LOOPS+1))
		PENDING_LOOPS=$(($PENDING_LOOPS-1))
	done

	# error when threshold violated
	if [[ $LOOPS -gt 9 ]]; then
		echo "youre stuck in a loop. exiting."
		exit 1
	fi
fi

if [[ -n $DEBUG ]]; then
	echo "DEPENDENT_SVCS: ${#DEPENDENT_SVCS[@]}"
	printf '%s\n' "${DEPENDENT_SVCS[@]}"
fi