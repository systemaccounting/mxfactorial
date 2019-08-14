#!/bin/bash
if [[ ! $1 ]]; then
  echo 'must pass environment as first argument to this script, e.g. dev, qa, prod'
  exit 1
fi
ENV=$1
# build and store all artifacts in s3 before terraform apply
(cd ../../schema/clone-faas; . deploy.sh $ENV all)
(cd ../../schema/update-faas; . deploy.sh $ENV all)
(cd ../../services; . deploy.sh $ENV all)
(cd ./aws/modules/environment/common-bin/cognito/auto-confirm; . deploy.sh $ENV all)
(cd ./aws/modules/environment/common-bin/cognito/delete-faker-accounts; . deploy.sh $ENV all)
(cd ./aws/modules/environment/common-bin/rds; . deploy.sh $ENV all)
(cd ./aws/modules/environment/common-bin/deploy-lambda; . deploy.sh $ENV all)