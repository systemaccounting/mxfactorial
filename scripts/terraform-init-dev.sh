#!/bin/bash

set -e

if [[ "$#" -ne 4 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/terraform-init-dev.sh \
		--key env_infra.tfstate \
		--dir infrastructure/terraform/aws/environments/dev
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --key) KEY="$2"; shift ;;
		--dir) DIR="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

ENVIRONMENT=dev
PROJECT_CONFIG=project.json
REGION=$(jq -r '.region' $PROJECT_CONFIG)
TFSTATE_BUCKET_PREFIX=$(jq -r '.tfstate_bucket_name_prefix' $PROJECT_CONFIG)

if [[ "$ENV" == 'prod' ]]; then # use configured prod env id
	ENV_ID=$(jq -r '.terraform.prod.env_id' $PROJECT_CONFIG)
elif [[ -z "$ENV_ID" ]]; then # use env id from terraform if not in environment
	ENV_ID=$(jq -r '.outputs.env_id.value' infrastructure/terraform/env-id/terraform.tfstate)
fi

ID_ENV="$ENV_ID-$ENVIRONMENT"
TFSTATE_BUCKET="$TFSTATE_BUCKET_PREFIX-$ID_ENV"

pushd "$DIR"

terraform init \
	-backend-config="bucket=$TFSTATE_BUCKET" \
	-backend-config="key=$KEY" \
	-backend-config="region=$REGION"

popd