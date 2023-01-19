#!/bin/bash

psql -U postgres -d mxfactorial -c "CREATE USER test WITH PASSWORD 'test';"

psql -U postgres -d mxfactorial -c "GRANT ALL PRIVILEGES ON DATABASE mxfactorial TO test;"

psql -U postgres -d mxfactorial -c "GRANT USAGE, CREATE ON SCHEMA public TO test;"

migrate -verbose -path /tmp/migrations/schema -database "postgresql://test:test@localhost:5432/mxfactorial?sslmode=disable&x-migrations-table=migration_schema_version" up

migrate -verbose -path /tmp/migrations/seed -database "postgresql://test:test@localhost:5432/mxfactorial?sslmode=disable&x-migrations-table=migration_seed_version" up

migrate -verbose -path /tmp/migrations/testseed -database "postgresql://test:test@localhost:5432/mxfactorial?sslmode=disable&x-migrations-table=migration_testseed_version" up