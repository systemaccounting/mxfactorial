#/bin/bash

if [[ ! $1 ]]; then
  echo 'must pass environment as argument to this script, e.g. dev, qa, prod'
  exit 1
fi

ENV=$1
echo 'Beginning warm up of serveral serverless services. Please wait a minute.'
warm_up_db() {
  aws lambda invoke \
  --region us-east-1 \
  --invocation-type RequestResponse \
  --function-name clone-tool-lambda-$1 \
  --payload '{"warmUp":true}' \
  invoke.log
}
# start with aurora serverles
warm_up_db $ENV

# then services in subdirectories
CURRENT_DIR=$(pwd)
for dir in */; do
  cd $CURRENT_DIR/$dir && . warm-up.sh $ENV
done

# WARMING=$'measure-faas/'
# for dir in $DEPLOYING; do
  # cd $WARMING/$dir && . warm-up.sh $ENV
# done