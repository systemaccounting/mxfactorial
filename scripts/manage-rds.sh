#!/bin/bash

if [[ "$#" -ne 3 ]]; then
	echo "use: bash scripts/manage-rds.sh --env dev --start # OR --stop"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENV="$2"; shift ;;
        --start) START=1;;
        --stop) STOP=1;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)

ENV_ID=$(source scripts/print-env-id.sh)
RDS_INSTANCE_NAME_PREFIX=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.RDS_INSTANCE_NAME_PREFIX.default' $PROJECT_CONF)
RDS_INSTANCE_NAME="$RDS_INSTANCE_NAME_PREFIX-$ENV_ID-$ENV"

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
