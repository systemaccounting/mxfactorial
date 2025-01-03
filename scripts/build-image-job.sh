#!/bin/bash

set -e

# set in .github/workflows/build-all-images.yaml
if [[ -z $ENV_ID ]]; then
    echo "ENV_ID is not set"
    exit 1
fi

if [[ "$#" -ne 4 ]]; then
    echo "use: bash scripts/build-image-job.sh --service-name request-create --build-ctx ."
    exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --service-name) SERVICE_NAME="$2"; shift ;;
        --build-ctx) BUILD_CTX="$2"; shift ;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
ENV=dev
ID_ENV="$ENV_ID-$ENV"
ARTIFACTS_BUCKET_PREFIX=$(yq '.infra.terraform.aws.modules["project-storage"].env_var.set.ARTIFACTS_BUCKET_PREFIX.default' $PROJECT_CONF)
ARTIFACTS_BUCKET="$ARTIFACTS_BUCKET_PREFIX-$ID_ENV"
SERVICES_ZIP=$(yq '.scripts.env_var.set.SERVICES_ZIP.default' $PROJECT_CONF)
SERVICES_DIR=$(echo $SERVICES_ZIP | sed 's/.zip//')

aws s3 cp s3://$ARTIFACTS_BUCKET/$SERVICES_ZIP . --region $REGION

unzip $SERVICES_ZIP -d $SERVICES_DIR

cd $SERVICES_DIR

docker build -t $SERVICE_NAME:latest -f ./docker/$SERVICE_NAME.Dockerfile --provenance=false $BUILD_CTX