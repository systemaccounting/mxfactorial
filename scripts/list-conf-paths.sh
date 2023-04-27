#!/bin/bash

if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/list-conf-paths.sh --type all OR app OR lib
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --type) TYPE="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
CONF_PATHS=($(source scripts/list-dir-paths.sh --type $TYPE))

declare -a QUOTED

for cp in "${CONF_PATHS[@]}"; do

	SPACED=($(printf '%s' "$cp" | sed 's/\//\ /g'))

	declare CONF_PATH

	for s in "${SPACED[@]}"; do
		if [[ $s == *"-"* ]]; then
			CONF_PATH+="[\"$s\"]"
		else
			CONF_PATH+=".$s"
		fi
	done

	QUOTED+=("$CONF_PATH")
	unset CONF_PATH

done

printf '%s\n' "${QUOTED[@]}"