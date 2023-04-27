#!/bin/bash

DIR_PATH="$1"

SPACED=($(printf '%s' "$DIR_PATH" | sed 's/\//\ /g'))

declare CONF_PATH

for s in "${SPACED[@]}"; do
	if [[ $s == *"-"* ]]; then
		CONF_PATH+="[\"$s\"]"
	else
		CONF_PATH+=".$s"
	fi
done

printf '%s' "$CONF_PATH"