#/bin/bash
if [[ ! $1 ]]; then
  echo 'must pass environment as argument to this script, e.g. dev, qa, prod'
  exit 1
fi

ENV=$1

OBJ='{"transactions":[{"name":"bread","price":"5",'\
'"quantity":"2","author":"Joe Smith",'\
'"debitor":"Joe Smith","creditor":"Mary"}]}'

warm_up() {
  aws lambda invoke \
  --region us-east-1 \
  --invocation-type RequestResponse \
  --function-name rules-lambda-$1 \
  --payload "${OBJ}" \
  invoke.log
}

warm_up $ENV