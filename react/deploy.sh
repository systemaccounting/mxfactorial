#!/bin/bash
if [[ ! $1 ]]; then
  echo 'must pass environment as argument to this script, e.g. dev, qa, prod'
  exit 1
fi
ENV=$1
CACHE_ID=$(aws cloudfront list-distributions --output text \
  --query 'DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`mxfactorial-react-'$1'`][].Id')
aws s3 sync build/ s3://mxfactorial-react-$1 --delete
aws configure set preview.cloudfront true
echo 'Terminating cache'
aws cloudfront create-invalidation --distribution-id $CACHE_ID \
  --paths "/*" --query 'Invalidation.{Status:Status,CreateTime:CreateTime}'
if [[ $ENV == 'prod' ]]; then
  WWW_CACHE_ID=$(aws cloudfront list-distributions --output text \
  --query 'DistributionList.Items[?DefaultCacheBehavior.TargetOriginId==`www-mxfactorial-react-prod`][].Id')
  echo 'Terminating www cache'
  aws cloudfront create-invalidation --distribution-id $WWW_CACHE_ID \
  --paths "/*" --query 'Invalidation.{Status:Status,CreateTime:CreateTime}'
fi