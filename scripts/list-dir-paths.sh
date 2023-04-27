#!/bin/bash

if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/list-dir-paths.sh --type all OR app OR lib
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

if [[ $TYPE == 'all' ]]; then
	yq '.. | select(has("type")) | path | join("/")' $PROJECT_CONF | sort
elif [[ $TYPE == 'app' ]] || [[ $TYPE == 'lib' ]]; then
	yq ".. | select(has(\"type\") and .type == \"$TYPE\") | path | join(\"/\")" $PROJECT_CONF | sort
else
	echo "\"$TYPE\" argument not an \"app\" or \"lib\" type in project.yaml"
	exit 1
fi
