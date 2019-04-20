#!/bin/bash
ENV=$1

update_lambda() {
  DEPLOY_TIME=$(aws lambda update-function-code \
  --function-name mxfactorial-graphql-server-$1 \
  --zip-file fileb://$(pwd)/graphql-src.zip \
  --region us-east-1 \
  --query 'LastModified')
  echo "Deployment completed at $DEPLOY_TIME"
}

# build src before deploying
. build.sh
update_lambda $ENV