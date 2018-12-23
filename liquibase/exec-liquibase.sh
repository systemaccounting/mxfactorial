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

# batch job status by replacing REGION and ID:
# aws batch describe-jobs --region REGION --jobs ID --query 'jobs[0].{status:status}'