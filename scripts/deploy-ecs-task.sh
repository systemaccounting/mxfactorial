#!/bin/bash

set -e

if [[ "$#" -ne 4 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/deploy-ecs-task.sh --service event --env dev
	bash scripts/deploy-ecs-task.sh --service measure --env dev
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --service) SERVICE="$2"; shift ;;
        --env) ENV="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
ENV_ID=$(source scripts/print-env-id.sh)
ID_ENV="$ENV_ID-$ENV"
CLUSTER="$ID_ENV"
ECS_SERVICE="$SERVICE-$ID_ENV"
REPO_NAME="$ENV_ID/$ENV/$SERVICE"

REPO_URI=$(aws ecr describe-repositories \
	--repository-names "$REPO_NAME" \
	--query 'repositories[0].repositoryUri' \
	--output text \
	--region $REGION)

LATEST_TAG=$(aws ecr describe-images \
	--repository-name "$REPO_NAME" \
	--query 'sort_by(imageDetails[?imageTags],& imagePushedAt)[-1].imageTags[0]' \
	--output text \
	--region $REGION)

CURRENT_TASK_DEF_ARN=$(aws ecs describe-services \
	--cluster "$CLUSTER" \
	--services "$ECS_SERVICE" \
	--query 'services[0].taskDefinition' \
	--output text \
	--region $REGION)

TASK_DEF=$(aws ecs describe-task-definition \
	--task-definition "$CURRENT_TASK_DEF_ARN" \
	--query 'taskDefinition.{family:family,taskRoleArn:taskRoleArn,executionRoleArn:executionRoleArn,cpu:cpu,memory:memory,containerDefinitions:containerDefinitions}' \
	--output json \
	--region $REGION)

NEW_CONTAINER_DEFS=$(echo "$TASK_DEF" | yq -o=json ".containerDefinitions[0].image = \"$REPO_URI:$LATEST_TAG\" | .containerDefinitions")

NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
	--family "$(echo "$TASK_DEF" | yq -r '.family')" \
	--task-role-arn "$(echo "$TASK_DEF" | yq -r '.taskRoleArn')" \
	--execution-role-arn "$(echo "$TASK_DEF" | yq -r '.executionRoleArn')" \
	--network-mode awsvpc \
	--requires-compatibilities FARGATE \
	--cpu "$(echo "$TASK_DEF" | yq -r '.cpu')" \
	--memory "$(echo "$TASK_DEF" | yq -r '.memory')" \
	--container-definitions "$NEW_CONTAINER_DEFS" \
	--query 'taskDefinition.taskDefinitionArn' \
	--output text \
	--region $REGION)

aws ecs update-service \
	--cluster "$CLUSTER" \
	--service "$ECS_SERVICE" \
	--task-definition "$NEW_TASK_DEF_ARN" \
	--force-new-deployment \
	--region $REGION > /dev/null

echo "*** $ECS_SERVICE deployed with $REPO_URI:$LATEST_TAG"
