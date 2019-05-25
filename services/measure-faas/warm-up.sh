#/bin/bash
if [[ ! $1 ]]; then
  echo 'must pass environment as argument to this script, e.g. dev, qa, prod'
  exit 1
fi

ENV=$1

warm_up() {
  aws lambda invoke \
  --region us-east-1 \
  --invocation-type RequestResponse \
  --function-name measure-lambda-$1 \
  --payload '{}' \
  invoke.log
}

warm_up $ENV