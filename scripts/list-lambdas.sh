#!/bin/bash

if [[ "$#" -ne 2 ]] && [[ "$#" -ne 3 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/list-lambdas.sh --env dev # OPTIONAL: --with-urls
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENV="$2"; shift ;;
        --with-urls) WITH_URLS=1; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
ENV_ID=$(source scripts/print-env-id.sh)
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

UNSORTED_FUNCTIONS=($(aws lambda list-functions \
	--region $REGION \
	--query "Functions[?contains(FunctionName, \`\"$ENV_ID\"\`) == \`true\`].[FunctionName]" \
	--output text))

FUNCTIONS=($(for f in "${UNSORTED_FUNCTIONS[@]}"; do echo "$f"; done | sort))

if [[ -n "$WITH_URLS" ]]; then

	for f in ${FUNCTIONS[@]}; do
		printf '%s: %s\n' "$f" $(aws lambda list-function-url-configs \
		--function-name $f \
		--region $REGION \
		--output text \
		--query "FunctionUrlConfigs[?contains(FunctionArn, \`$f\`) == \`true\`].FunctionUrl")
	done

else

	printf '%s\n' "${FUNCTIONS[@]}"

fi