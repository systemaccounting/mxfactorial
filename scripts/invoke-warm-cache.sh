#!/bin/bash

set -e

if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/invoke-warm-cache.sh --env dev
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
ENV_ID=$(source scripts/print-env-id.sh)
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
SSM_VERSION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.SSM_VERSION.default' $PROJECT_CONF)
SSM_PREFIX="$ENV_ID/$SSM_VERSION/$ENV"

echo "*** fetching warm-cache url and passphrase from ssm"

WARM_CACHE_URL=$(aws ssm get-parameter \
	--name "/$SSM_PREFIX/service/lambda/warm_cache/url" \
	--with-decryption \
	--query 'Parameter.Value' \
	--output text \
	--region $REGION)

WARM_CACHE_PASSPHRASE=$(aws ssm get-parameter \
	--name "/$SSM_PREFIX/service/lambda/warm_cache/passphrase" \
	--with-decryption \
	--query 'Parameter.Value' \
	--output text \
	--region $REGION)

echo "*** invoking warm-cache lambda"

RESPONSE=$(curl -s -X POST "$WARM_CACHE_URL" \
	-H 'Content-Type: application/json' \
	-d "{\"passphrase\":\"$WARM_CACHE_PASSPHRASE\"}")

echo "$RESPONSE" | yq -o=json -P

if [[ $(echo "$RESPONSE" | yq -r '.status') == "cache warmed" ]]; then
	echo "*** cache warmed successfully"
else
	echo "*** cache warming failed"
	exit 1
fi
