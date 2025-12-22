#!/bin/bash

set -e

if [[ "$#" -ne 4 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/go-migrate-rds.sh --env dev --cmd reset

	possible values:
		cmd: up, down, drop, reset
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENV="$2"; shift ;;
        --cmd) CMD="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
ENV_ID=$(source scripts/print-env-id.sh)
SSM_VERSION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.SSM_VERSION.default' $PROJECT_CONF)
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

PASSPHRASE=$(aws ssm get-parameter \
	--name "/$ENV_ID/$SSM_VERSION/$ENV/tool/lambda/go_migrate/passphrase" \
	--query 'Parameter.Value' \
	--region $REGION \
	--with-decryption \
	--output text)

PAYLOAD="{\"db_type\":\"test\",\"cmd\":\"$CMD\",\"passphrase\":\"$PASSPHRASE\"}"

bash scripts/invoke-function-url.sh --app-name go-migrate --payload "$PAYLOAD" --env $ENV
