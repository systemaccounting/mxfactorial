# adapted from https://mattdevdba.medium.com/aws-lambda-postgresql-client-69206ff0c439
FROM centos:7
RUN yum -y install yum-utils rpmdevtools
RUN yum -y install https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm
WORKDIR /tmp
RUN yumdownloader postgresql11
RUN yumdownloader postgresql11-libs
RUN rpmdev-extract *rpm
RUN mkdir -p /var/task
RUN cp -r /tmp/postgresql11-libs-11.11-1PGDG.rhel7.x86_64/usr/pgsql-11/lib/* /var/task
RUN cp -r /tmp/postgresql11-11.11-1PGDG.rhel7.x86_64/usr/pgsql-11/bin/* /var/task
WORKDIR /var/task
RUN zip -r9 /tmp/psql11-lambda.zip *