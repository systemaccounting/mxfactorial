#!/bin/bash

if [[ "$#" -ne 4 ]]; then
	echo "use: bash scripts/print-value.sh --var PGDATABASE --env dev # OR local OR prod"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENV="$2"; shift ;;
        --var) VAR="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
SSM_VERSION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.SSM_VERSION.default' $PROJECT_CONF)
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
CONF_OBJ=$(yq "... | select(has(\"$VAR\")).$VAR" $PROJECT_CONF)

IS_AVAILABLE=$(source scripts/list-env-vars.sh | grep -e "^$VAR$" | wc -l | xargs)
if [[ $IS_AVAILABLE -eq 0 ]]; then
	echo "error: $VAR env_var not set in project.yaml"
	exit 1
fi

# avoid env-id when printing defaults
if [[ $ENV != 'local' ]]; then
	ENV_ID=$(source scripts/print-env-id.sh)
fi

if [[ $ENV != 'local' ]] && [[ $(echo "$CONF_OBJ" | yq .ssm) != 'null' ]]; then
	SSM_SUFFIX=$(yq "... | select(has(\"$VAR\")).$VAR.ssm" $PROJECT_CONF)
	aws ssm get-parameter \
		--name "/$ENV_ID/$SSM_VERSION/$ENV/$SSM_SUFFIX" \
		--query 'Parameter.Value' \
		--region $REGION \
		--with-decryption \
		--output text
else
	echo "$CONF_OBJ" | yq ".default"
fi