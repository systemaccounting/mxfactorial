#!/bin/bash

set -e

if [[ "$#" -lt 4 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/go-migrate-rds.sh --env dev --subdirs schema,seed,testseed --cmd reset

	possible values:
		subdirs: comma-separated migration subdirectories
		cmd: up, down, drop, reset
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENV="$2"; shift ;;
        --subdirs) SUBDIRS="$2"; shift ;;
        --cmd) CMD="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
ENV_ID=$(source scripts/print-env-id.sh)
SSM_VERSION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.SSM_VERSION.default' $PROJECT_CONF)
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
SSM_PREFIX="$ENV_ID/$SSM_VERSION/$ENV"

echo "*** fetching go-migrate url and passphrase from ssm"

GO_MIGRATE_URL=$(aws ssm get-parameter \
	--name "/$SSM_PREFIX/service/lambda/go_migrate/url" \
	--with-decryption \
	--query 'Parameter.Value' \
	--output text \
	--region $REGION)

PASSPHRASE=$(aws ssm get-parameter \
	--name "/$SSM_PREFIX/tool/lambda/go_migrate/passphrase" \
	--with-decryption \
	--query 'Parameter.Value' \
	--output text \
	--region $REGION)

echo "*** invoking go-migrate lambda"

curl -s -X POST "$GO_MIGRATE_URL" \
	-H 'Content-Type: application/json' \
	-d "{\"subdirs\":\"$SUBDIRS\",\"cmd\":\"$CMD\",\"passphrase\":\"$PASSPHRASE\"}" | yq -o=json
