#!/bin/bash

if [[ "$#" -ne 4 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/print-lambda-policy.sh --app-name rule --env dev
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
ENV_ID=$(source scripts/print-env-id.sh)
ID_ENV="$ENV_ID-$ENV"
LAMBDA_NAME=$APP_NAME-$ID_ENV
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

aws lambda get-policy \
	--function-name "$LAMBDA_NAME" \
	--region $REGION \
	--query "Policy" \
	| yq '. | from_json' -P -o=json