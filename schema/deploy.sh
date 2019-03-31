#!/bin/bash

update_lambda() {
  aws lambda update-function-code \
  --function-name $1 \
  --zip-file fileb://$(pwd)/git-src.zip \
  --region us-east-1 \
  --query 'LastModified'
}

# build src before deploying
. build.sh
update_lambda $1