<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### expedites
1. local development with [postgres in docker](https://hub.docker.com/r/bitnami/postgresql) and [go migrate](https://github.com/golang-migrate/migrate)
1. creating test and prod databases in postgres rds through lambda maintained in `./go-migrate-faas`

### migration directories
1. `./migrations` stores schema
1. `./seed` stores seed data common to dev and prod dbs
1. `./testseed` stores seed data for development db only

create a test database by deploying all directories
create a production database by deploying the `./migrations` and `./seed` directories only

### tl;dr start local development
1. `brew install golang-migrate`
1. `make run` to start postgres in docker
1. `make up-all DIR=migrations` to add all migrations from `./migrations` and record schema version in `schema_versions_migrations` table
1. `make up-all DIR=seed` to add all migrations from `./seed` and record schema version in `schema_versions_seed` table
1. `make up-all DIR=testseed` to add all migrations from `./testseed` and record schema version in `schema_versions_testseed` table

### work fast
1. add changes to migration directories
1. `make redev` to add all from `migrations`, `seed` and `testseed` directories
1. `make devtest` to up & down test `migrations`, `seed` and `testseed` directories

### postgres docker commands
1. `make run` starts a local postgres docker container with `./postgres-data` created and mounted
1. `cntrl+c` in container shell, or `make stop` in other shell stops and removes postgres container
1. `make clean` removes `./postgres-data` directory

### local development
1. complete tl;dr start local development section above
1. `make create NAME=rule DIR=migrations` to create up and down rule sql files in `./migrations`
1. add statements in new up and down rule sql files
1. `make up DIR=migrations COUNT=1` to apply next remaining sql in `./migrations`
1. `make down DIR=migrations COUNT=1` to remove last applied sql in `./migrations`
1. `make down-all DIR=migrations` to remove all applied sqls in `./migrations`
1. `make drop DIR=migrations` to clear database

### deploy single migration versions from lambda to postgres rds
1. deploy single migration versions with `make deploy-migrations ENV=dev DIR=seed BRANCH=199/db-item-transaction CMD=down COUNT=all`, inline variable definitions:
    1. `ENV` assigns the environment of the lambda and database to deploy the migrations
    1. `DIR`assigns the desired migration directory, eg `migrations`, `test-data` etc
    1. `BRANCH` assigns the branch name where migrations are pushed
    1. `CMD` assigns [go migrate cli](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate#usage) commands, eg `up`, `down`, `force`, `drop`. **warning**: dropping a db currently requires manually creating after
    1. `COUNT` assigns a number or `all` for the `up` and `down` commands
1. other commands such as `force` to fix [error: Dirty database version](https://github.com/golang-migrate/migrate/issues/282#issuecomment-530743258) will error if missing required inline assignments, follow output instructions to eliminate
1. open `invoke.log` to view lambda response
1. navigate to `/aws/lambda/go-migrate-faas-dev` log group in cloudwatch to view lambda logs

### create a TEST database in postgres rds from lambda
1. provision a terraform stack, e.g. `infrastructure/terraform/aws/environments/dev`
1. set the `MIGRATION_LAMBDA_NAME` variable in `schema/makefile`
1. `make deploy-all-testdb-up ENV=dev BRANCH=199/db-item-transaction` deploys all migration directories
1. `make deploy-all-testdb-down ENV=dev BRANCH=199/db-item-transaction` removes all migrations
1. `make deploy-all-testdb-drop ENV=dev BRANCH=199/db-item-transaction` drops all migrations

\* ***includes** `./testseed` migrations*

### create a PROD database in postgres rds from lambda
1. provision a terraform stack, e.g. `infrastructure/terraform/aws/environments/prod`
1. set the `MIGRATION_LAMBDA_NAME` variable in `schema/makefile`
1. `make deploy-all-prod-up ENV=dev BRANCH=199/db-item-transaction` deploys all migration directories
1. `make deploy-all-prod-down ENV=dev BRANCH=199/db-item-transaction` removes all migrations
1. `make deploy-all-prod-drop ENV=dev BRANCH=199/db-item-transaction` drops all migrations

\* ***excludes** `./testseed` migrations*