#!/bin/bash

PATTERNS=(
	'cargo-watch'
	'npm run dev --open'
	'.bin/vite dev'
	'tail -F'
)

function stop() {
	for pid in $(ps aux | grep -e "$1" | grep -v 'grep' | awk '{print $2}'); do
		kill "$pid" > /dev/null 2>&1 || true;
	done
}

for p in "${PATTERNS[@]}"; do
	stop "$p"
done

make --no-print-directory -C migrations clean