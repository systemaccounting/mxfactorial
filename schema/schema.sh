#!/bin/bash
set -e
# uncomment and assign for expedient testing
# AWS_REGION=
# AWS_ENVIRONMENT=
# BRANCH=
# SCHEMA_CHANGE_COMMAND=

echo 'Please repeat if FAILED because Aurora Serverless startup time > db timeout ("Communications link failure")'

echo 'AWS region for schema change (e.g. us-east-1)?'
read AWS_REGION_INPUT
# in case vars assigned above and user wishes to quickly [enter] through
if [[ -n $AWS_REGION_INPUT ]]; then AWS_REGION=$AWS_REGION_INPUT; fi
# avoid sending empty values to aws
if [[ -z $AWS_REGION ]]; then echo "value required"; exit 1; fi

echo 'Environment (e.g. dev, qa, prod)?'
read AWS_ENVIRONMENT_INPUT
if [[ -n $AWS_ENVIRONMENT_INPUT ]]; then AWS_ENVIRONMENT=$AWS_ENVIRONMENT_INPUT; fi
if [[ -z $AWS_ENVIRONMENT ]]; then echo "value required"; exit 1; fi

echo 'mxfactorial github project branch name (e.g. develop)?'
read BRANCH_INPUT
if [[ -n $BRANCH_INPUT ]]; then BRANCH=$BRANCH_INPUT; fi
if [[ -z $BRANCH ]]; then echo "value required"; exit 1; fi

echo 'Schema change command to execute (e.g. up, down)?'
read SCHEMA_CHANGE_COMMAND_INPUT
if [[ -n $SCHEMA_CHANGE_COMMAND_INPUT ]]; then SCHEMA_CHANGE_COMMAND=$SCHEMA_CHANGE_COMMAND_INPUT; fi
if [[ -z $SCHEMA_CHANGE_COMMAND ]]; then echo "value required"; exit 1; fi

echo "Warming up..."
export LOCAL_ENV=$AWS_ENVIRONMENT
node ../services/graphql-faas/tests/utils/warmUp.js > /dev/null 2>&1

echo "Executing schema change..."

AWS_LAMBDA_INVOKE=$(aws lambda invoke \
--region $AWS_REGION \
--invocation-type RequestResponse \
--function-name clone-tool-lambda-$AWS_ENVIRONMENT \
--payload '{"branch":"'"$BRANCH"'","command":"'"$SCHEMA_CHANGE_COMMAND"'"}' \
schema.log)

echo "$AWS_LAMBDA_INVOKE"