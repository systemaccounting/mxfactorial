#!/bin/bash

PROJECT_CONF=project.yaml
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
GITHUB_REPO_NAME=$(yq '.[".github"].env_var.set.GITHUB_REPO_NAME.default' $PROJECT_CONF)
PROJECT_NAME=$GITHUB_REPO_NAME

ROLE_NAME="$PROJECT_NAME-apigw-logging"
POLICY_NAME="$PROJECT_NAME-apigw-logging"

POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text --region "$REGION")

aws iam detach-role-policy --role-name "$ROLE_NAME" --policy-arn "$POLICY_ARN" --region "$REGION"

aws iam delete-policy --policy-arn "$POLICY_ARN" --region "$REGION"

aws iam delete-role --role-name "$ROLE_NAME" --region "$REGION"