#!/bin/bash

set -e

if [[ -z $GITHUB_PAT ]]; then
    echo "set GITHUB_PAT variable in shell to continue"
    exit 1
fi

ENV=dev
PROJECT_CONF=project.yaml
ENV_ID=$(source ./scripts/print-env-id.sh)
ID_ENV="$ENV_ID-$ENV"
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
ARTIFACTS_BUCKET_PREFIX=$(yq '.infra.terraform.aws.modules["project-storage"].env_var.set.ARTIFACTS_BUCKET_PREFIX.default' $PROJECT_CONF)
ARTIFACTS_BUCKET="$ARTIFACTS_BUCKET_PREFIX-$ID_ENV"
DEPLOY_IMAGE_WORKFLOW=$(yq '.[".github"].workflows.env_var.set.DEPLOY_IMAGE_WORKFLOW.default' $PROJECT_CONF)
WORKFLOW_ID=$DEPLOY_IMAGE_WORKFLOW
GITHUB_ORG=$(yq '.[".github"].env_var.set.GITHUB_ORG.default' $PROJECT_CONF)
GITHUB_REPO_NAME=$(yq '.[".github"].env_var.set.GITHUB_REPO_NAME.default' $PROJECT_CONF)
SERVICES_ZIP=$(yq '.scripts.env_var.set.SERVICES_ZIP.default' $PROJECT_CONF)

source scripts/zip-services.sh

echo '*** uploading archive to s3'
aws s3 cp $SERVICES_ZIP s3://$ARTIFACTS_BUCKET --region $REGION
rm $SERVICES_ZIP

echo "*** triggering .github/workflows/$WORKFLOW_ID"

curl -L \
    -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_PAT" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    https://api.github.com/repos/$GITHUB_ORG/$GITHUB_REPO_NAME/actions/workflows/$WORKFLOW_ID/dispatches \
    -d "{\"ref\":\"develop\"}"

if [[ $(uname) == "Darwin" ]]; then
    # store utc time in iso8601 format minus 10 seconds
    CREATED=$(date -u -v-10S "+%Y-%m-%dT%H:%M:%SZ")
    # store utc time in unix timestamp format plus 10 minutes
    TEN_MIN_MAX=$(date -u -v+10M "+%s")
else
    CREATED=$(date -u -d "$(date -u +'%Y-%m-%dT%H:%M:%S') 10 seconds ago" +'%Y-%m-%dT%H:%M:%SZ')
    TEN_MIN_MAX=$(date -u -d "$(date -u +'%Y-%m-%dT%H:%M:%S') 10 minutes" +'%s')
fi

# wait 5 seconds
sleep 5

RUN_ID=$(curl -sL \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_PAT" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/$GITHUB_ORG/$GITHUB_REPO_NAME/actions/workflows/$WORKFLOW_ID/runs?created=>$CREATED" | yq '.workflow_runs[0].id')

echo "*** waiting for $WORKFLOW_ID github workflow to complete"

function get_run() {
    RUN=$(curl -sL \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_PAT" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    https://api.github.com/repos/$GITHUB_ORG/$GITHUB_REPO_NAME/actions/runs/$RUN_ID)

    STATUS=$(echo "$RUN" | yq '.status')
    CONCLUSION=$(echo "$RUN" | yq '.conclusion')
}

STATUS='queued'
CONCLUSION=null

while [[ $STATUS != 'completed' && $(date +%s) -lt $TEN_MIN_MAX ]]; do
  sleep 5
  get_run
  printf '%s' '.'
done

echo ""

if [[ $CONCLUSION != 'success' ]]; then
  echo "build failed"
  exit 1
fi