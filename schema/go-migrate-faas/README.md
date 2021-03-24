<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>


deploys pushed migrations in `/mxfactorial/schema/$DESIRED_MIGRATION_DIRECTORY` to postgres rds through lambda

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
1. see `/mxfactorial/schema/README.md`

### clean
1. `make clean`