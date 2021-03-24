<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>


deploys pushed migrations in `/mxfactorial/schema/migrations` to postgres rds through lambda

### build
1. `make build` to:
    1. clone go migrate repo
    1. build go migrate binary for lambda
1. `make zip`to zip `migrate.linux-amd64` and `index.sh`

### deploy code
1. `make deploy-only ENV=dev` to:
    1. put `go-migrate-src.zip` in `mxfactorial-artifacts-dev` bucket
    1. update `go-migrate-faas-dev` lambda code from new artifact in bucket

### build & deploy code
1. `make deploy ENV=dev`

### deploy migrations
1. open `makefile`
1. set `MIGRATION_BRANCH` variable to branch name
1. set values expected by [go migrate cli](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate#usage) to variables:
    1. `MIGRATION_COMMAND`, possible values `up`, `down`, `force`, `drop`. dropping db required manually creating after
    1. `MIGRATION_COUNT`, must be number or `all`
    1. `MIGRATION_VERSION`, used only by `force` command to [fix](https://github.com/golang-migrate/migrate/issues/282#issuecomment-530743258) `error: Dirty database version`
1. `make deploy-migrations ENV=dev` to deploy migrations from git through lambda
1. open `invoke.log` to view lambda response
1. navigate to `/aws/lambda/go-migrate-faas-dev` log group in cloudwatch to view lambda logs

### clean
1. `make clean`