#!/bin/bash

if [[ "$#" -ne 4 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/print-ecr-repo-name.sh --image-prefix go-migrate --env dev
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --image-prefix) IMAGE_PREFIX="$2"; shift ;;
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
ENV_ID=$(source scripts/print-env-id.sh)
ID_ENV="$ENV_ID-$ENV"
IMAGE_NAME=$IMAGE_PREFIX-$ID_ENV
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

aws ecr describe-repositories \
	--query "repositories[?contains(repositoryUri, \`$IMAGE_NAME\`)].repositoryUri" \
	--output text \
	--region $REGION