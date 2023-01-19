#!/bin/bash

if [[ "$#" -ne 4 ]] && [[ "$#" -ne 5 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/list-lambdas.sh --region us-east-1 --env dev # OPTIONAL: --with-urls
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENVIRONMENT="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        --with-urls) WITH_URLS=1; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

if [[ "$ENV" == 'prod' ]]; then # use configured prod env id
	ENV_ID=$(jq -r '.terraform.prod.env_id' $PROJECT_CONFIG)
elif [[ -z "$ENV_ID" ]]; then # use env id from terraform if not in environment
	ENV_ID=$(jq -r '.outputs.env_id.value' infrastructure/terraform/env-id/terraform.tfstate)
fi

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