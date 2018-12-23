# stripped down kilna/liquibase-docker

# docker build -t mxfactorial/liquibase-rds:1.0.0 .
# docker push mxfactorial/liquibase-rds:1.0.0
# docker run \
# --env BRANCH= \
# --env RDS_ENDPOINT= \
# --env USERNAME= \
# --env PASSWORD= \
# --env LIQUIBASE_COMMAND= \
# mxfactorial/liquibase-rds:1.0.0

FROM anapsix/alpine-java:8
ARG liquibase_version=3.5.3
ARG liquibase_download_url=https://github.com/liquibase/liquibase/releases/download/liquibase-parent-${liquibase_version}
ARG jdbc_driver_version
ENV jdbc_driver_version=${jdbc_driver_version:-5.1.45}\
  jdbc_driver_download_url=https://dev.mysql.com/get/Downloads/Connector-J
RUN set -e -o pipefail;\
  apk update;\
  apk --no-cache add curl ca-certificates git;\
  tarfile=liquibase-${liquibase_version}-bin.tar.gz;\
  mkdir /opt/liquibase;\
  cd /opt/liquibase;\
  curl -SOLs ${liquibase_download_url}/${tarfile};\
  tar -xzf ${tarfile};\
  rm ${tarfile};\
  chmod +x liquibase;\
  ln -s /opt/liquibase/liquibase /usr/local/bin/liquibase;\
  mkdir /opt/jdbc;\
  echo "JDBC DRIVER VERSION: $jdbc_driver_version";\
  cd /opt/jdbc;\
  tarfile=mysql-connector-java-${jdbc_driver_version}.tar.gz;\
  curl -SOLs ${jdbc_driver_download_url}/${tarfile};\
  tar -x -f ${tarfile};\
  jarfile=mysql-connector-java-${jdbc_driver_version}-bin.jar;\
  mv mysql-connector-java-${jdbc_driver_version}/${jarfile} ./;\
  rm -rf ${tarfile} mysql-connector-java-${jdbc_driver_version};\
  ln -s ${jarfile} mysql-jdbc.jar;
COPY exec-liquibase.sh /usr/local/bin/exec-liquibase.sh
RUN chmod +x /usr/local/bin/exec-liquibase.sh
WORKDIR /home
ENTRYPOINT ["exec-liquibase.sh"]