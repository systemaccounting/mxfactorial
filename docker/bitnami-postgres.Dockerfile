FROM public.ecr.aws/bitnami/postgresql:15 AS builder

USER root

RUN apt update && \
	apt install -y build-essential postgresql-server-dev-15 libcurl4-openssl-dev git curl && \
	curl -LO https://github.com/golang-migrate/migrate/releases/download/v4.16.2/migrate.linux-amd64.deb && \
	dpkg -i migrate.linux-amd64.deb && \
	rm migrate.linux-amd64.deb && \
	git clone https://github.com/citusdata/pg_cron.git /tmp/pg_cron && \
	cd /tmp/pg_cron && \
	make && make install && \
	cd / && rm -rf /tmp/pg_cron && \
	git clone https://github.com/pramsey/pgsql-http.git /tmp/pgsql-http && \
	cd /tmp/pgsql-http && \
	make && make install && \
	cd / && rm -rf /tmp/pgsql-http

FROM public.ecr.aws/bitnami/postgresql:15

USER root

ENV ALLOW_EMPTY_PASSWORD=yes
ENV POSTGRESQL_USERNAME=root
ENV POSTGRESQL_DATABASE=mxfactorial
ENV POSTGRESQL_SHARED_PRELOAD_LIBRARIES=pg_cron

COPY docker/bitnami-postgres/docker-entrypoint-initdb.d/up-migrate.sh /docker-entrypoint-initdb.d/up-migrate.sh
COPY migrations /tmp/migrations

COPY --from=builder /opt/bitnami/postgresql/lib/pg_cron.so /opt/bitnami/postgresql/lib/pg_cron.so
COPY --from=builder /opt/bitnami/postgresql/share/extension/pg_cron* /opt/bitnami/postgresql/share/extension/
COPY --from=builder /opt/bitnami/postgresql/lib/http.so /opt/bitnami/postgresql/lib/http.so
COPY --from=builder /opt/bitnami/postgresql/share/extension/http* /opt/bitnami/postgresql/share/extension/
COPY --from=builder /usr/bin/migrate /usr/bin/migrate

RUN apt update && \
	apt install -y --no-install-recommends libcurl4 && \
	apt clean && \
	rm -rf /var/lib/apt/lists /var/cache/apt/archives && \
	chmod +x /docker-entrypoint-initdb.d/up-migrate.sh && \
	echo "cron.database_name = 'mxfactorial'" >> /opt/bitnami/postgresql/conf/conf.d/pg_cron.conf
