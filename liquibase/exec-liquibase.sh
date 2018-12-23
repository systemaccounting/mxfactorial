#!/bin/sh
git clone --single-branch --branch $BRANCH https://github.com/systemaccounting/mxfactorial.git &&
liquibase \
--classpath=/opt/jdbc/mysql-jdbc.jar \
--driver=com.mysql.jdbc.Driver  \
--changeLogFile=/home/mxfactorial/liquibase/changelog.xml \
--username=$USERNAME \
--password=$PASSWORD \
--url=jdbc:mysql://$RDS_ENDPOINT:3306/mxfactorial?createDatabaseIfNotExist=true \
$LIQUIBASE_COMMAND

# https://docs.aws.amazon.com/cli/latest/reference/batch/submit-job.html
# create batch job by replacing SOME_VALUE:
# aws batch submit-job \
# --region SOME_VALUE \
# --job-name SOME_VALUE \
# --job-queue SOME_VALUE \
# --job-definition SOME_VALUE \
# --container-overrides environment='[{name="BRANCH",value="SOME_VALUE"},{name="RDS_ENDPOINT",value="SOME_VALUE"},{name="USERNAME",value="SOME_VALUE"},{name="PASSWORD",value="SOME_VALUE"},{name="LIQUIBASE_COMMAND",value="SOME_VALUE"}]'

# https://docs.aws.amazon.com/cli/latest/reference/batch/describe-jobs.html
# query batch job status by replacing SOME_VALUE:
# aws batch describe-jobs --region SOME_VALUE --jobs SOME_VALUE --query 'jobs[0].{status:status}'