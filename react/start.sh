#!/bin/bash
if [[ ! $1 ]]; then
  echo 'must pass environment as argument to this script, e.g. dev, qa, prod'
  exit 1
fi
ENV=$1
if [[ $CI ]]; then
  echo "Starting ${ENV} web server on CI..."
  UPPERCASE_ENV=$(echo $ENV | awk '{print toupper($0)}')
  CI_VAR_FILE_NAME="${UPPERCASE_ENV}"_REACT_VARS
  ENV_FILE=$(echo "${!CI_VAR_FILE_NAME//[[:space:]]/}" | base64 --decode --ignore-garbage | tr -d '\0')
  echo "${ENV_FILE}" > .env.current
  chmod u+r .env.current
  yarn run start:env
  rm .env.current
else
  if [[ ! -f .env."${ENV}" ]]; then
    echo "env file of name .env.${ENV} must exist"
    exit 1
  fi
  echo "Starting ${ENV} web server on local..."
  cp .env."${ENV}" .env.current
  chmod u+r .env.current
  yarn run start:env
  # rm .env.current
fi
