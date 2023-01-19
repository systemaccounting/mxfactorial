FROM bitnami/postgresql:latest

USER root

ENV ALLOW_EMPTY_PASSWORD=yes
ENV POSTGRESQL_USERNAME=root
ENV POSTGRESQL_DATABASE=mxfactorial

COPY docker/bitnami-postgres/docker-entrypoint-initdb.d/migrate.sh /docker-entrypoint-initdb.d/migrate.sh
COPY migrations /tmp/migrations

RUN apt update && \
	apt install curl -y && \
	curl -LO https://github.com/golang-migrate/migrate/releases/download/v4.15.2/migrate.linux-amd64.deb && \
	dpkg -i migrate.linux-amd64.deb && \
	rm migrate.linux-amd64.deb && \
	apt clean && \
	rm -rf /var/lib/apt/lists /var/cache/apt/archives && \
	chmod +x /docker-entrypoint-initdb.d/migrate.sh