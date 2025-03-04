#!/bin/bash

set -e

PROJECT_CONF=project.yaml
GITHUB_REGISTRY=$(yq '.[".github"].workflows.env_var.set.GITHUB_REGISTRY.default' $PROJECT_CONF)
GITHUB_ORG=$(yq '.[".github"].env_var.set.GITHUB_ORG.default' $PROJECT_CONF)
GITHUB_REPO_NAME=$(yq '.[".github"].env_var.set.GITHUB_REPO_NAME.default' $PROJECT_CONF)
LOCAL_TAG_VERSION=$(yq '.docker.env_var.set.LOCAL_TAG_VERSION.default' $PROJECT_CONF)

NAMESPACE=$GITHUB_ORG/$GITHUB_REPO_NAME
REGISTRY_URI=$GITHUB_REGISTRY/$NAMESPACE

SERVICES=($(bash scripts/list-deployments.sh | xargs basename -a))

for SERVICE in "${SERVICES[@]}"; do
    IMAGE_NAME=$SERVICE:$LOCAL_TAG_VERSION
    docker pull $REGISTRY_URI/$IMAGE_NAME
    docker tag $REGISTRY_URI/$IMAGE_NAME $IMAGE_NAME
done

echo ""
echo '*** "make compose-up" to start services in docker'