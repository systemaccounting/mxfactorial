#!/bin/bash
if [[ ! $1 ]]; then
  echo 'must pass environment as argument to this script, e.g. dev, qa, prod'
  exit 1
fi
ENV=$1
if [[ $CI ]]; then
  echo "Building for ${ENV} on CI..."
  UPPERCASE_ENV=$(echo "${ENV}" | awk '{print toupper($0)}')
  ENV_FILE=$(echo "${UPPERCASE_ENV}"_REACT_VARS | base64 --decode --ignore-garbage | tr -d '\0')
  if [[ $ENV == 'dev' ]]; then
    ENV_FILE="${ENV_FILE} REACT_APP_HOST_ENV=dev"
    ENV_FILE="${ENV_FILE} REACT_APP_TEST_VERSION=$(jq -r '.version' package.json)"
    ENV_FILE="${ENV_FILE} REACT_APP_TEST_BRANCH=${CIRCLE_BRANCH}"
    ENV_FILE="${ENV_FILE} REACT_APP_TEST_BUILD_NUMBER=${CIRCLE_BUILD_NUM}"
    ENV_FILE="${ENV_FILE} REACT_APP_BUILD_URL=${CIRCLE_BUILD_URL}"
    ENV_FILE="${ENV_FILE} REACT_APP_TEST_DEVELOPER=${CIRCLE_USERNAME}"
  fi
  echo "${ENV_FILE}" > .env.current
  chmod u+r .env.current
  yarn run build:env
  rm .env.current
else
  if [[ ! -f .env."${ENV}" ]]; then
    echo "env file of name .env.${ENV} must exist"
    exit 1
  fi
  echo "Building for ${ENV} on local..."
  cp .env."${ENV}" .env.current
  chmod u+r .env.current
  yarn run build:env
  rm .env.current
fi