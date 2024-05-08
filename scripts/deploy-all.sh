#!/bin/bash

set -e

if [[ "$#" -lt 2 ]] || [[ "$#" -gt 4 ]]; then
	cat <<-'EOF'
		use:
		bash scripts/deploy-all.sh --env dev

		OPTIONAL ARGS:
		"--initial", prepares for terraform apply
		"--services", deploys services only
		"--transaction-services", deploys transaction services only
	EOF
	exit 1
fi

INVENTORY=($(bash scripts/list-dir-paths.sh --type app))

while [[ "$#" -gt 0 ]]; do
	case $1 in
	--env)
		ENV="$2"
		shift
		;;
	--initial) INITIAL=1 ;;
	--services) INVENTORY=($(bash scripts/list-dir-paths.sh --type app |
		grep --color=never services/)) ;;
		# for convenience, not currently referenced in makefiles
	--transaction-services) INVENTORY=($(bash scripts/list-dir-paths.sh --type app |
		grep --color=never \
			-e transact \
			-e request \
			-e rule \
			-e graphql)) ;;
	*)
		echo "unknown parameter passed: $1"
		exit 1
		;;
	esac
	shift
done

MAKE_CMD=deploy

# options are "deploy", or "initial-deploy" to prep for terraform
if [[ -n $INITIAL ]]; then
	MAKE_CMD="initial-deploy"
fi

INVENTORY_SIZE="${#INVENTORY[@]}"

# store script exec start time
SCRIPT_START_TIME=$(date +%s)

echo "*** starting $MAKE_CMD of $INVENTORY_SIZE apps at $(date)"

if [[ -n $GITHUB_PAT ]]; then
	source scripts/pull-all-images.sh
fi

# loop through app directories and deploy or initial-deploy
for app_dir in "${INVENTORY[@]}"; do
	DEPLOY_START_TIME=$(date +%s)
	DEPLOY_START_LAPSE=$(($DEPLOY_START_TIME - $SCRIPT_START_TIME))
	echo "*** starting $MAKE_CMD of $app_dir after $(printf '%02dh:%02dm:%02ds\n' $(($DEPLOY_START_LAPSE / 3600)) $(($DEPLOY_START_LAPSE % 3600 / 60)) $(($DEPLOY_START_LAPSE % 60)))"
	(
		cd $app_dir
		make --no-print-directory $MAKE_CMD ENV=$ENV
	)
done

# store script exec end time
SCRIPT_END_TIME=$(date +%s)
SCRIPT_DURATION=$(($SCRIPT_END_TIME - $SCRIPT_START_TIME))

# https://stackoverflow.com/a/39452629
echo "*** $MAKE_CMD time duration of $INVENTORY_SIZE apps: $(printf '%02dh:%02dm:%02ds\n' $(($SCRIPT_DURATION / 3600)) $(($SCRIPT_DURATION % 3600 / 60)) $(($SCRIPT_DURATION % 60)))"
