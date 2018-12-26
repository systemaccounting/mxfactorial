#!/bin/sh

# uncomment and assign for expedient testing
# AWS_REGION=
# AWS_JOB_NAME=
AWS_JOB_QUEUE=liquibase
AWS_JOB_DEFINITION=liquibase
# BRANCH=
# RDS_ENDPOINT=
# DB_USERNAME=
# DB_PASSWORD=
# LIQUIBASE_COMMAND=

echo 'Please repeat if FAILED because Aurora Serverless startup time > Liquibase timeout ("Communications link failure")'

echo 'AWS region for the Batch job (e.g. us-east-2)?'
read AWS_REGION_INPUT
# in case vars assigned above and user wishes to quickly [enter] through
if [[ -n $AWS_REGION_INPUT ]]; then AWS_REGION=$AWS_REGION_INPUT; fi
# avoid sending empty values to batch
if [[ -z $AWS_REGION ]]; then echo "value required"; exit 1; fi

echo 'Brief name for Liquibase Batch job (e.g. commit-08e6725)?'
read AWS_JOB_NAME_INPUT
if [[ -n $AWS_JOB_NAME_INPUT ]]; then AWS_JOB_NAME=$AWS_JOB_NAME_INPUT; fi
if [[ -z $AWS_JOB_NAME ]]; then echo "value required"; exit 1; fi

# comment in for customizing
# echo 'Existing Batch job queue (e.g. liquibase)?'
# read AWS_JOB_QUEUE_INPUT
# if [[ -n $AWS_JOB_QUEUE_INPUT ]]; then AWS_JOB_QUEUE=$AWS_JOB_QUEUE_INPUT; fi
# if [[ -z $AWS_JOB_QUEUE ]]; then echo "value required"; exit 1; fi

# echo 'Existing Batch job definition (e.g. liquibase)?'
# read AWS_JOB_DEFINITION_INPUT
# if [[ -n $AWS_JOB_DEFINITION_INPUT ]]; then AWS_JOB_DEFINITION=$AWS_JOB_DEFINITION_INPUT; fi
# if [[ -z $AWS_JOB_DEFINITION ]]; then echo "value required"; exit 1; fi

echo 'mxfactorial github project branch name (e.g. develop)?'
read BRANCH_INPUT
if [[ -n $BRANCH_INPUT ]]; then BRANCH=$BRANCH_INPUT; fi
if [[ -z $BRANCH ]]; then echo "value required"; exit 1; fi

echo 'RDS endpoint (e.g. some-db.cluster-12345678910.us-east-2.rds.amanonaws.com)?'
read RDS_ENDPOINT_INPUT
if [[ -n $RDS_ENDPOINT_INPUT ]]; then RDS_ENDPOINT=$RDS_ENDPOINT_INPUT; fi
if [[ -z $RDS_ENDPOINT ]]; then echo "value required"; exit 1; fi

echo 'Database username (e.g. someadmin)?'
read DB_USERNAME_INPUT
if [[ -n $DB_USERNAME_INPUT ]]; then DB_USERNAME=$DB_USERNAME_INPUT; fi
if [[ -z $DB_USERNAME ]]; then echo "value required"; exit 1; fi

echo 'Database password (e.g. somepassword)?'
read -s DB_PASSWORD_INPUT
if [[ -n $DB_PASSWORD_INPUT ]]; then DB_PASSWORD=$DB_PASSWORD_INPUT; fi
if [[ -z $DB_PASSWORD ]]; then echo "value required"; exit 1; fi

echo 'Liquibase command to execute (e.g. updateTestingRollback)?'
read LIQUIBASE_COMMAND_INPUT
if [[ -n $LIQUIBASE_COMMAND_INPUT ]]; then LIQUIBASE_COMMAND=$LIQUIBASE_COMMAND_INPUT; fi
if [[ -z $LIQUIBASE_COMMAND ]]; then echo "value required"; exit 1; fi

echo "Sending Batch Job..."

AWS_BATCH_JOB_ID=$(aws batch submit-job \
--region $AWS_REGION \
--job-name $AWS_JOB_NAME \
--job-queue $AWS_JOB_QUEUE \
--job-definition $AWS_JOB_DEFINITION \
--container-overrides environment='[{name="BRANCH",value='"$BRANCH"'},{name="RDS_ENDPOINT",value='"$RDS_ENDPOINT"'},{name="USERNAME",value='"$DB_USERNAME"'},{name="PASSWORD",value='"$DB_PASSWORD"'},{name="LIQUIBASE_COMMAND",value='"$LIQUIBASE_COMMAND"'}]' \
--query 'jobId' \
--output text)

JOB_STATUS=$(aws batch describe-jobs --region $AWS_REGION --jobs $AWS_BATCH_JOB_ID --query 'jobs[0].{status:status}' --output text)

echo "Batch Job with $AWS_BATCH_JOB_ID ID created with status of $JOB_STATUS"
echo 'Polling status on 5 second intervals...'

START_TIME=$(date +%s)

while [[ $JOB_STATUS != "SUCCEEDED" && $JOB_STATUS != "FAILED" ]]
do
  JOB_STATUS=$(aws batch describe-jobs --region $AWS_REGION --jobs $AWS_BATCH_JOB_ID --query 'jobs[0].{status:status}' --output text)
  sleep 5
  CURRENT_TIME=$(date +%s)
  TIME_PASSED=$(($CURRENT_TIME - $START_TIME))
  echo 'Status after '"$TIME_PASSED"' seconds: '"$JOB_STATUS"
done

FINISHED_TIME=$(date +%s)
TIME_PASSED=$(($FINISHED_TIME - $START_TIME))
echo 'Job completed after '"$TIME_PASSED"' seconds with status: '"$JOB_STATUS"
