FROM node:19-buster-slim as builder

# docker build -t rules:v1 -f docker/rules-prod.Dockerfile --progress=plain --no-cache .

WORKDIR /usr/src/app

COPY . .

# unit and integration test
RUN apt update && \
	apt install curl postgresql postgresql-contrib make -y && \
	curl -LO https://github.com/golang-migrate/migrate/releases/download/v4.15.2/migrate.linux-amd64.deb && \
	dpkg -i migrate.linux-amd64.deb && \
	rm migrate.linux-amd64.deb && \
	apt clean && \
	rm -rf /var/lib/apt/lists /var/cache/apt/archives

RUN	pg_ctlcluster 11 main start && \
	runuser -l postgres -c "psql -c \"CREATE USER root SUPERUSER;\"" && \
	runuser -l postgres -c "psql -c \"CREATE DATABASE mxfactorial;\"" && \
	runuser -l postgres -c "psql -c \"CREATE USER test WITH PASSWORD 'test';\"" && \
	runuser -l postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE mxfactorial TO test;\"" && \
	migrate -verbose -path ./migrations/schema -database "postgresql://test:test@localhost:5432/mxfactorial?sslmode=disable&x-migrations-table=migration_schema_version" up && \
	migrate -verbose -path ./migrations/seed -database "postgresql://test:test@localhost:5432/mxfactorial?sslmode=disable&x-migrations-table=migration_seed_version" up && \
	migrate -verbose -path ./migrations/testseed -database "postgresql://test:test@localhost:5432/mxfactorial?sslmode=disable&x-migrations-table=migration_testseed_version" up && \
	(cd services/rules; npm install; make test-unit; npm run test:integ:local)

RUN make -C 'services/rules' compile

# create artifact
FROM node:19-buster-slim

ENV NODE_ENV=production

EXPOSE 8080

WORKDIR /app

COPY --from=builder /usr/src/app/services/rules/dist/rules/src .
COPY --from=builder /usr/src/app/services/rules/package*.json .

RUN npm install --production

CMD [ "node", "server.js" ]