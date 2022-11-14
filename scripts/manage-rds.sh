#!/bin/bash

if [[ "$#" -ne 3 ]]; then
	echo "use: bash scripts/manage-rds.sh --env dev --start # OR --stop"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENVIRONMENT="$2"; shift ;;
        --start) START=1;;
        --stop) STOP=1;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONFIG=project.json
REGION=$(jq -r '.region' $PROJECT_CONFIG)
ENV_ID=$(jq -r '.outputs.env_id.value' infrastructure/terraform/env-id/terraform.tfstate)
RDS_INSTANCE_NAME="$ENV_ID-$ENVIRONMENT-$(jq -r '.terraform.aws.rds.instance_name_suffix' $PROJECT_CONFIG)"

if [[ "$START" -eq 1 ]]; then
	aws rds start-db-instance \
		--db-instance-identifier "$RDS_INSTANCE_NAME" \
		--region "$REGION" \
		--query 'DBInstance.DBInstanceStatus' \
		--output text

	# block command prompt until rds instance available
	aws rds wait db-instance-available --db-instance-identifier "$RDS_INSTANCE_NAME" --region "$REGION"
fi

if [[ "$STOP" -eq 1 ]]; then
	aws rds stop-db-instance \
		--db-instance-identifier "$RDS_INSTANCE_NAME" \
		--region "$REGION" \
		--query 'DBInstance.DBInstanceStatus' \
		--output text
fi
