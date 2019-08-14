#!/bin/bash
ENV=$1
ARTIFACT_TYPE=$2
APP=teardown

if [[ ! $1 ]]; then
  echo 'must pass environment as first argument to this script, e.g. dev, qa, prod'
  exit 1
fi

if [[ ! $2 ]]; then
  echo 'must pass artifact type as second argument to this script, e.g. dev src, dev deps, dev all'
  exit 1
fi

update_layer() {
  # ETAG=$(aws s3api put-object \
  # --bucket=mxfactorial-artifacts-$1 \
  # --key=$APP-layer.zip \
  # --body=$(pwd)/$APP-layer.zip \
  # --region=us-east-1 \
  # --output=text | sed 's/"//g')
  # echo "***Deployed from s3 ETag: $ETAG"
  echo 'integration test data teardown lambda has 0 layers. not building'
}

update_src() {
  ETAG=$(aws s3api put-object \
  --bucket=mxfactorial-artifacts-$1 \
  --key=$APP-src.zip \
  --body=$(pwd)/$APP-src.zip \
  --region=us-east-1 \
  --output=text | sed 's/"//g')
  echo "***Deployed from s3 ETag: $ETAG"
}

deploy() {
  case $2 in
    "all")
      update_layer $1
      update_src $1
      ;;
    "deps")
      update_layer $1
      ;;
    *)
      update_src $1
      ;;
  esac
}

# build src before deploying
. build.sh
deploy $ENV $ARTIFACT_TYPE