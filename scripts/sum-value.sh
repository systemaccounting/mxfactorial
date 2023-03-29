#!/bin/bash

set -e

# print use
if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/sum-value.sh --file-path pkg/testdata/transMultipleRules.json
	EOF
	exit 1
fi

# assign vars to script args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --file-path) FILE_PATH="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

# filter prices from transaction_item list
PRICES=($(jq \
	-c \
	'.transaction.transaction_items[].price | tonumber' \
	$FILE_PATH))

# filter quantities from transaction_item list
QUANTITIES=($(jq \
	-c \
	'.transaction.transaction_items[].quantity | tonumber' \
	$FILE_PATH))

# sum
SUM=0
for i in "${!PRICES[@]}"; do
	REVENUE=$(echo "${PRICES[$i]}"\*"${QUANTITIES[$i]}" |bc)
	SUM=$(echo "$SUM"\+"$REVENUE" |bc)
done

echo "$SUM"