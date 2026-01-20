#!/bin/bash

set -e

YELLOW='\033[0;33m'
RED='\033[0;31m'
RESET='\033[0m'

if [[ "$#" -lt 1 ]]; then
	cat <<- 'EOF'
	use:
	bash scripts/ecr-images.sh --build                       # build + test all
	bash scripts/ecr-images.sh --build --no-test             # build all (skip tests)
	bash scripts/ecr-images.sh --build --push                # build + test + push all
	bash scripts/ecr-images.sh --build --push --deploy       # build + test + push + deploy all
	bash scripts/ecr-images.sh --pull                        # pull all from ecr
	bash scripts/ecr-images.sh --integ                       # run integration tests

	--service <name> works with any flag:
	bash scripts/ecr-images.sh --build --service graphql
	bash scripts/ecr-images.sh --build --push --deploy --service graphql
	bash scripts/ecr-images.sh --pull --service graphql
	EOF
	exit 1
fi

# defaults
BUILD=false
TEST=true
PUSH=false
DEPLOY=false
PULL=false
INTEG=false
SERVICE=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --build) BUILD=true; shift ;;
        --test) TEST=true; shift ;;
        --no-test) TEST=false; shift ;;
        --push) PUSH=true; shift ;;
        --deploy) DEPLOY=true; shift ;;
        --pull) PULL=true; shift ;;
        --integ) INTEG=true; shift ;;
        --service) SERVICE="$2"; shift; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
done

if [[ $(basename $(pwd)) != "mxfactorial" ]]; then
    echo "error: run from project root"
    exit 1
fi

ENV=dev
PROJECT_CONF=project.yaml
ENV_FILE_NAME=$(yq '.env_var.set.ENV_FILE_NAME.default' $PROJECT_CONF)

if [[ ! -f $ENV_FILE_NAME ]]; then
    echo "error: $ENV_FILE_NAME not found. run 'make env-id' first"
    exit 1
fi

if ! grep -q "ENV_ID=" $ENV_FILE_NAME; then
    echo "error: ENV_ID not found in $ENV_FILE_NAME. run 'make env-id' first"
    exit 1
fi

# validate service if provided
if [[ -n "$SERVICE" ]]; then
    if [[ $(bash scripts/list-dir-paths.sh --type all | grep --color=never "$SERVICE$" >/dev/null 2>&1; echo $?) -ne 0 ]]; then
        echo "error: \"$SERVICE\" not in $PROJECT_CONF"
        exit 1
    fi
fi

ENV_ID=$(grep "ENV_ID=" $ENV_FILE_NAME | cut -d'=' -f2)
ID_ENV="$ENV_ID-$ENV"
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ENV_ID/$ENV"

function get_services() {
    if [[ -n "$SERVICE" ]]; then
        echo "$SERVICE"
    else
        yq '.. | select(has("type") and has("deploy") and .type == "app" and .deploy == true) | path | .[-1]' $PROJECT_CONF
    fi
}

function start_builds() {
    local RUN_TESTS=$1
    local PUSH_IMAGE=$2
    local DO_DEPLOY=$3

    ARTIFACTS_BUCKET_PREFIX=$(yq '.infra.terraform.aws.modules["project-storage"].env_var.set.ARTIFACTS_BUCKET_PREFIX.default' $PROJECT_CONF)
    ARTIFACTS_BUCKET="$ARTIFACTS_BUCKET_PREFIX-$ID_ENV"
    SERVICES_ZIP=$(yq '.scripts.env_var.set.SERVICES_ZIP.default' $PROJECT_CONF)
    BUILD_OBJECT_KEY_PATH=$(yq '.infra.terraform.aws.modules.codepipeline.env_var.set.BUILD_OBJECT_KEY_PATH.default' $PROJECT_CONF)

    source scripts/zip-services.sh

    echo '*** uploading archive to s3'
    aws s3 cp $SERVICES_ZIP s3://$ARTIFACTS_BUCKET/$BUILD_OBJECT_KEY_PATH/ --region $REGION
    rm $SERVICES_ZIP

    echo "*** starting builds (RUN_TESTS=$RUN_TESTS, PUSH_IMAGE=$PUSH_IMAGE, DEPLOY=$DO_DEPLOY)"
    echo ""

    BUILD_IDS=""
    for SVC in $(get_services); do
        PROJECT_NAME="mxfactorial-$SVC-$ID_ENV"
        echo -e "${YELLOW}starting $PROJECT_NAME...${RESET}"
        BUILD_ID=$(aws codebuild start-build \
            --project-name $PROJECT_NAME \
            --region $REGION \
            --source-type-override S3 \
            --source-location-override "$ARTIFACTS_BUCKET/$BUILD_OBJECT_KEY_PATH/$SERVICES_ZIP" \
            --artifacts-override type=NO_ARTIFACTS \
            --environment-variables-override \
                name=RUN_TESTS,value=$RUN_TESTS \
                name=PUSH_IMAGE,value=$PUSH_IMAGE \
                name=DEPLOY,value=$DO_DEPLOY \
            --query 'build.id' \
            --output text)
        BUILD_IDS="$BUILD_IDS $BUILD_ID"
        # URL encode the build ID (replace : with %3A)
        BUILD_ID_ENCODED=$(printf '%s' "$BUILD_ID" | sed 's/:/%3A/g')
        printf 'https://%s.console.aws.amazon.com/codesuite/codebuild/%s/projects/%s/build/%s/?region=%s\n' "$REGION" "$AWS_ACCOUNT_ID" "$PROJECT_NAME" "$BUILD_ID_ENCODED" "$REGION"
        echo ""
    done

    echo "*** waiting for builds to complete"
    echo -e "${YELLOW}(ctrl+c to exit - builds will continue in background)${RESET}"
    echo ""

    for BUILD_ID in $BUILD_IDS; do
        while true; do
            STATUS=$(aws codebuild batch-get-builds \
                --ids $BUILD_ID \
                --region $REGION \
                --query 'builds[0].buildStatus' \
                --output text)
            if [[ $STATUS != "IN_PROGRESS" ]]; then
                echo "$BUILD_ID: $STATUS"
                break
            fi
            sleep 10
            printf '%s' '.'
        done
    done
}

function trigger_pipeline() {
    ARTIFACTS_BUCKET_PREFIX=$(yq '.infra.terraform.aws.modules["project-storage"].env_var.set.ARTIFACTS_BUCKET_PREFIX.default' $PROJECT_CONF)
    ARTIFACTS_BUCKET="$ARTIFACTS_BUCKET_PREFIX-$ID_ENV"
    SERVICES_ZIP=$(yq '.scripts.env_var.set.SERVICES_ZIP.default' $PROJECT_CONF)
    PIPELINE_NAME="mxfactorial-build-$ID_ENV"

    source scripts/zip-services.sh

    echo '*** uploading archive to s3'
    aws s3 cp $SERVICES_ZIP s3://$ARTIFACTS_BUCKET/build/ --region $REGION
    rm $SERVICES_ZIP

    echo "*** codepipeline $PIPELINE_NAME triggered via eventbridge"
    echo "https://$REGION.console.aws.amazon.com/codesuite/codepipeline/pipelines/$PIPELINE_NAME/view/?region=$REGION"

    sleep 5

    echo "*** waiting for codepipeline to complete"
    echo -e "${YELLOW}(ctrl+c to exit - pipeline will continue in background)${RESET}"

    function get_pipeline_state() {
        PIPELINE_STATE=$(aws codepipeline get-pipeline-state \
            --name $PIPELINE_NAME \
            --region $REGION \
            --query 'stageStates[?stageName==`Build`].latestExecution.status' \
            --output text)
    }

    if [[ $(uname) == "Darwin" ]]; then
        TIMEOUT_MAX=$(date -u -v+20M "+%s")
    else
        TIMEOUT_MAX=$(date -u -d "$(date -u +'%Y-%m-%dT%H:%M:%S') 20 minutes" +'%s')
    fi

    PIPELINE_STATE='InProgress'

    while [[ $PIPELINE_STATE == 'InProgress' && $(date +%s) -lt $TIMEOUT_MAX ]]; do
        sleep 10
        get_pipeline_state
        printf '%s' '.'
    done

    echo ""

    if [[ $PIPELINE_STATE == 'Succeeded' ]]; then
        echo "*** build succeeded"
    else
        echo "*** build status: $PIPELINE_STATE"
        exit 1
    fi
}

# handle pull separately
if [[ $PULL == true ]]; then
    echo "*** logging into ecr"
    source scripts/auth-ecr.sh

    echo "*** pulling images from ecr"
    for SVC in $(get_services); do
        echo "pulling $SVC..."
        docker pull $ECR_URI/$SVC:latest || echo "skipping $SVC (not found)"
        docker tag $ECR_URI/$SVC:latest $SVC:latest 2>/dev/null || true
    done

    echo "*** done"
    exit 0
fi

# handle integ tests
if [[ $INTEG == true ]]; then
    ARTIFACTS_BUCKET_PREFIX=$(yq '.infra.terraform.aws.modules["project-storage"].env_var.set.ARTIFACTS_BUCKET_PREFIX.default' $PROJECT_CONF)
    ARTIFACTS_BUCKET="$ARTIFACTS_BUCKET_PREFIX-$ID_ENV"
    SERVICES_ZIP=$(yq '.scripts.env_var.set.SERVICES_ZIP.default' $PROJECT_CONF)
    INTEG_TEST_OBJECT_KEY_PATH=$(yq '.infra.terraform.aws.modules["project-storage"].env_var.set.INTEG_TEST_OBJECT_KEY_PATH.default' $PROJECT_CONF)

    source scripts/zip-services.sh

    echo '*** uploading archive to s3'
    aws s3 cp $SERVICES_ZIP s3://$ARTIFACTS_BUCKET/$INTEG_TEST_OBJECT_KEY_PATH/ --region $REGION
    rm $SERVICES_ZIP

    PROJECT_NAME="mxfactorial-integ-$ID_ENV"
    echo -e "${YELLOW}*** starting integration tests ($PROJECT_NAME)${RESET}"
    echo ""

    BUILD_ID=$(aws codebuild start-build \
        --project-name $PROJECT_NAME \
        --region $REGION \
        --query 'build.id' \
        --output text)

    # URL encode the build ID (replace : with %3A)
    BUILD_ID_ENCODED=$(printf '%s' "$BUILD_ID" | sed 's/:/%3A/g')
    printf 'https://%s.console.aws.amazon.com/codesuite/codebuild/%s/projects/%s/build/%s/?region=%s\n' "$REGION" "$AWS_ACCOUNT_ID" "$PROJECT_NAME" "$BUILD_ID_ENCODED" "$REGION"
    echo ""

    echo "*** waiting for integ tests to complete"
    echo -e "${YELLOW}(ctrl+c to exit - build will continue in background)${RESET}"
    echo ""

    while true; do
        STATUS=$(aws codebuild batch-get-builds \
            --ids $BUILD_ID \
            --region $REGION \
            --query 'builds[0].buildStatus' \
            --output text)
        if [[ $STATUS != "IN_PROGRESS" ]]; then
            echo "$BUILD_ID: $STATUS"
            break
        fi
        sleep 10
        printf '%s' '.'
    done

    if [[ $STATUS == "SUCCEEDED" ]]; then
        echo "*** integration tests passed"
    else
        echo "*** integration tests failed"
        exit 1
    fi

    exit 0
fi

# handle build
if [[ $BUILD == true ]]; then
    RUN_TESTS=$TEST
    PUSH_IMAGE=$PUSH
    DO_DEPLOY=$DEPLOY

    # warn if deploying without pushing
    if [[ $DEPLOY == true && $PUSH == false ]]; then
        echo -e "${RED}warning: deploying without pushing (will use existing ecr images)${RESET}"
        echo ""
    fi

    # use pipeline for full builds (all services + push + no deploy), otherwise direct codebuild
    if [[ -z "$SERVICE" && $PUSH == true && $TEST == true && $DEPLOY == false ]]; then
        trigger_pipeline
    else
        start_builds "$RUN_TESTS" "$PUSH_IMAGE" "$DO_DEPLOY"
    fi
fi
