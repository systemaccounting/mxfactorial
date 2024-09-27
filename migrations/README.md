<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

todo:
1. add `/.github/workflows/dev-migrations.yaml`
1. add `make run && make testdocker` in workflow

### expedites
1. local development with [postgres in docker](https://hub.docker.com/r/bitnami/postgresql) and [go migrate](https://github.com/golang-migrate/migrate)
1. creates test and prod databases in postgres rds through:
    1. `make uprds DB=test`, OR
    1. lambda maintained in `./go-migrate`

### migration directories
1. `./schema`
1. `./seed` stores seed data common to dev and prod dbs
1. `./testseed` stores seed data for testing dbs only

prod db = `./schema` + `./seed`  
test db = `./schema` + `./seed` + `./testseed`  

### tl;dr start local development
1. `make run` to start postgres in docker
1. `make insert` to up migrate and insert a mix of approximately 40 requests and transactions
1. `make -C './dumps' dump-testseed` to create a sql dump in `./migrations/dumps`
1. `make -C './dumps' restore-testseed` to build a test db in 5 seconds

### work fast
1. add changes to migration directories
1. `make resetdocker` to drop and then up migrate all from `migrations`, `seed` and `testseed` directories
1. `make testdocker` to up & down test `migrations`, `seed` and `testseed` directories

### postgres docker commands
1. `make run` starts a local postgres docker container with `./postgres-data` created and mounted
1. `cntrl+c` in container shell, or `make stop` in other shell stops and removes postgres container
1. `make clean` removes `./postgres-data` directory

### local development
1. complete tl;dr start local development section above
1. `make create NAME=rule DIR=schema` to create up and down rule sql files in `./schema`
1. add statements in new up and down rule sql files
1. `make updir DIR=schema COUNT=1` to apply next remaining sql in `./schema`
1. `make downdir DIR=schema COUNT=1` to remove last applied sql in `./schema`
1. `make downdirall DIR=schema` to remove all applied sqls in `./schema`
1. `make dropdir DIR=schema` to clear database

### other commands
1. `make updir DIR=schema COUNT=all` adds all migrations from the `./schema` directory and records the schema version in the `migration_schema_versions` table
1. `make updir DIR=seed COUNT=all` adds all migrations from the `./seed` directory and records the schema version in the `migration_seed_versions` table
1. `make updir DIR=testseed COUNT=all` adds all migrations from the `./testseed` directory, and records the schema version in the `migration_testseed_versions` table
1. `make downdir DIR=schema COUNT=1` down migrates a single version from the `./schema` directory
1. `make downdirall DIR=schema` down migrates all versions in the `./schema` directory
1. `make updirall DIR=schema` up migrates all versions in the `./schema` directory
1. `make dropdir DIR=schema` drops everything in `./schema` from the db
1. `make force DIR=schema VERSION=3` forces schema version 3 in the `./schema` directory

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
1. provision a terraform stack, e.g. `infra/terraform/aws/environments/dev`
1. set the `MIGRATION_LAMBDA_NAME` variable in `mirations/makefile`
1. `make lambda-up-all DB=test ENV=dev BRANCH=199/db-item-transaction` deploys all migration directories
1. `make lambda-down-all DB=test ENV=dev BRANCH=199/db-item-transaction` removes all migrations
1. `make lambda-drop-all DB=test ENV=dev BRANCH=199/db-item-transaction` drops all migrations

\* ***includes** `./testseed` migrations*

### create a PROD database in postgres rds from lambda
1. provision a terraform stack, e.g. `infra/terraform/aws/environments/prod`
1. set the `MIGRATION_LAMBDA_NAME` variable in `mirations/makefile`
1. `make lambda-up-all DB=prod ENV=prod BRANCH=199/db-item-transaction` up migrates all versions from checked in `./schema` and `./seed` migration directories
1. `make lambda-down-all DB=prod ENV=prod BRANCH=199/db-item-transaction` deploys all down migrations from the checked in `./schema` and `./seed` directories
1. `make lambda-drop-all DB=prod ENV=prod BRANCH=199/db-item-transaction` deploys the drop of all migrations checked into the `./schema` and `./seed` directories

\* ***excludes** `./testseed` migrations*, can still deploy DB=prod to ENV=dev if preferred

### direct rds migrations
deploy migrations to prod rds through lambda, but for faster migrations in lower environment rds, use direct commands:
1. `make resetrds ENV=dev` drops and then up migrates all sqls from `migrations`, `seed` and `testseed` directories
1. `make testrds ENV=dev` tests up & down `migrations`, `seed` and `testseed` directories