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

cd infrastructure/terraform/aws/environments/init-$ENV

terraform init

# workflow data storage
terraform import module.project_storage_$ENV.aws_dynamodb_table.github_workflows github-workflows-$ID_ENV

# tf state storage
terraform import module.project_storage_$ENV.aws_s3_bucket.tfstate mxfactorial-tfstate-$ID_ENV

# artifact storage
terraform import module.project_storage_$ENV.aws_s3_bucket.artifacts mxfactorial-artifacts-$ID_ENV

# docker image storage
terraform import module.project_storage_$ENV.aws_ecr_repository.go_migrate go-migrate-$ID_ENV

# client hosting
terraform import module.project_storage_$ENV.aws_s3_bucket.client_origin mxfactorial-client-$ID_ENV
terraform import module.project_storage_$ENV.aws_s3_bucket_website_configuration.client_origin mxfactorial-client-$ID_ENV
terraform import module.project_storage_$ENV.aws_s3_bucket_public_access_block.client_origin mxfactorial-client-$ID_ENV