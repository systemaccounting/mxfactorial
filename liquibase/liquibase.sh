#!/bin/sh

# add parameter for debugging
# --logLevel=debug \

git clone --single-branch --branch $BRANCH https://github.com/systemaccounting/mxfactorial.git &&
liquibase \
--classpath=/opt/jdbc/mysql-jdbc.jar \
--driver=com.mysql.jdbc.Driver  \
--changeLogFile=/home/mxfactorial/liquibase/changelog.xml \
--username=$USERNAME \
--password=$PASSWORD \
--url=jdbc:mysql://$RDS_ENDPOINT:3306/mxfactorial?createDatabaseIfNotExist=true \
$LIQUIBASE_COMMAND
