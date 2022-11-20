# adapted from https://mattdevdba.medium.com/aws-lambda-postgresql-client-69206ff0c439
FROM golang:1.19-alpine3.16 AS builder1
ENV GO111MODULE=on
RUN apk add --no-cache git gcc musl-dev make
RUN mkdir -p /go/src/github.com/golang-migrate
WORKDIR /go/src/github.com/golang-migrate
RUN git clone --single-branch --branch master https://github.com/golang-migrate/migrate.git
WORKDIR /go/src/github.com/golang-migrate/migrate
RUN mkdir ./cli/build
RUN VERSION=$(git describe --tags 2>/dev/null | cut -c 2-); \
	cd ./cmd/migrate && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -o ../../cli/build/migrate.linux-amd64 -ldflags='-X main.Version=$(VERSION) -extldflags "-static"' -tags 'postgres mysql redshift cassandra spanner cockroachdb yugabytedb clickhouse mongodb sqlserver firebird neo4j pgx file go_bindata github github_ee bitbucket aws_s3 google_cloud_storage godoc_vfs gitlab' .


FROM centos:7 AS builder2
WORKDIR /tmp
RUN yum -y install yum-utils rpmdevtools
RUN	yum -y install https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-42.0-28.noarch.rpm
RUN	yumdownloader -y postgresql11
RUN	yumdownloader -y postgresql11-libs
RUN	rpmdev-extract *rpm
RUN	mkdir -p /tmp/bin
# todo: set LD_LIBRARY_PATH in lambda to avoid bundling lib/*.so* with bin
RUN	cp -r /tmp/postgresql11-libs-11.18-1PGDG.rhel7.x86_64/usr/pgsql-11/lib/*.so* /tmp/bin
RUN	cp -r /tmp/postgresql11-11.18-1PGDG.rhel7.x86_64/usr/pgsql-11/bin/* /tmp/bin
COPY --from=builder1 /go/src/github.com/golang-migrate/migrate/cli/build/migrate.linux-amd64 /tmp/bin
RUN zip -r9 /tmp/go-migrate-layer.zip bin


FROM centos:7
COPY --from=builder2 /tmp/go-migrate-layer.zip /tmp