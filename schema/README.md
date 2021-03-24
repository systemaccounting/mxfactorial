<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

convenient local development with [postgres in docker](https://hub.docker.com/r/bitnami/postgresql) and [go migrate](https://github.com/golang-migrate/migrate)

### tl;dr start local development
1. `brew install golang-migrate`
1. `make run` to start postgres in docker
1. `make up-all` to add all migrations

### postgres docker commands
1. `make run` starts a local postgres docker container with `./postgres-data` created and mounted
1. `cntrl+c` in container shell, or `make stop` in other shell stops and removes postgres container
1. `make clean` removes `./postgres-data` directory

### local development
1. complete tl;dr start local development
1. `make create NAME=rule` to create up and down rule sql files in `./migrations`
1. add statements in new up and down rule sql files
1. `make up COUNT=1` to apply next remaining sql in `./migrations`
1. `make down COUNT=1` to remove last applied sql in `./migrations`
1. `make down-all` to remove all applied sqls in `./migrations`
1. `make drop` to clear database

### deploy migrations
1. open `makefile`
1. set `MIGRATION_BRANCH` variable to branch name
1. set values expected by [go migrate cli](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate#usage) to variables:
    1. `MIGRATION_COMMAND`, possible values `up`, `down`, `force`, `drop`. dropping db required manually creating after
    1. `MIGRATION_COUNT`, must be number or `all`
    1. `MIGRATION_VERSION`, used only by `force` command to [fix](https://github.com/golang-migrate/migrate/issues/282#issuecomment-530743258) `error: Dirty database version`
1. `make deploy-migrations ENV=dev` to deploy migration from git through lambda, code available in `/mxfactorial/schema/go-migrate-faas`
1. open `invoke.log` to view lambda response
1. navigate to `/aws/lambda/go-migrate-faas-dev` log group in cloudwatch to view lambda logs