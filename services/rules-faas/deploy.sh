#!/bin/bash
if [[ ! $1 ]]; then
  echo 'must pass environment as argument to this script, e.g. dev, qa, prod'
  exit 1
fi

ENV=$1

update_lambda() {
  DEPLOY_TIME=$(aws lambda update-function-code \
  --function-name rules-lambda-$1 \
  --zip-file fileb://$(pwd)/rules-src.zip \
  --region us-east-1 \
  --query 'LastModified')
  echo "***Deployment completed at $DEPLOY_TIME"
}

# build src before deploying
. build.sh
update_lambda $ENV