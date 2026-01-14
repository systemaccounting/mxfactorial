#!/bin/bash

if [[ "$#" -ne 2 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/import-tf-init-env.sh --env dev
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

ID_ENV="$ENV_ID-$ENV"

cd infra/terraform/aws/environments/init-$ENV

terraform init

# tf state storage
terraform import module.project_storage_$ENV.aws_s3_bucket.tfstate mxfactorial-tfstate-$ID_ENV

# artifact storage
terraform import module.project_storage_$ENV.aws_s3_bucket.artifacts mxfactorial-artifacts-$ID_ENV

# docker image storage
terraform import module.project_storage_$ENV.aws_ecr_repository.go_migrate go-migrate-$ID_ENV