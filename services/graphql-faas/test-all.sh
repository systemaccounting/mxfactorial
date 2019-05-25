#!/bin/bash
if [[ ! $1 ]]; then
  echo 'must pass environment as argument to this script, e.g. dev, qa, prod'
  exit 1
fi
export LOCAL_ENV=$1
(cd ../; . warm-up.sh $ENV)
yarn test