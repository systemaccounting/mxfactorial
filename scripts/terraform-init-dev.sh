#!/bin/bash

set -e

if [[ "$#" -ne 4 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/terraform-init-dev.sh \
		--key env_infra.tfstate \
		--dir infra/terraform/aws/environments/dev
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

ENV=dev
PROJECT_CONF=project.yaml
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
TFSTATE_BUCKET_PREFIX=$(yq '.infra.terraform.aws.modules["project-storage"].env_var.set.TFSTATE_BUCKET_PREFIX.default' $PROJECT_CONF)
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)
ENV_FILE=$ENV_FILE_NAME

if [[ -z $ENV_ID ]]; then
	if [[ -f $ENV_FILE ]] && grep -q "^ENV_ID=" $ENV_FILE; then
		ENV_ID=$(grep "^ENV_ID=" $ENV_FILE | cut -d'=' -f2)
	else
		make env-id
		ENV_ID=$(source scripts/print-env-id.sh)
	fi
fi

ID_ENV="$ENV_ID-$ENV"
TFSTATE_BUCKET="$TFSTATE_BUCKET_PREFIX-$ID_ENV"

pushd "$DIR"

terraform init \
	-backend-config="bucket=$TFSTATE_BUCKET" \
	-backend-config="key=$KEY" \
	-backend-config="region=$REGION"

popd