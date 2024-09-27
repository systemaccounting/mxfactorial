#!/bin/bash

if [[ "$#" -ne 6 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/print-ecr-repo-uri.sh --app-name go-migrate --env dev --env-id 12345
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --app-name) APP_NAME="$2"; shift ;;
        --env) ENV="$2"; shift ;;
        --env-id) ENV_ID="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
ID_ENV_PREFIX="$ENV_ID/$ENV"
IMAGE_NAME="$ID_ENV_PREFIX/$APP_NAME"
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

aws ecr describe-repositories \
	--query "repositories[?contains(repositoryUri, \`$IMAGE_NAME\`)].repositoryUri" \
	--output text \
	--region $REGION