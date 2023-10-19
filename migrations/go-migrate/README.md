<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>


### go-migrate

deploys pushed migrations in `/mxfactorial/migrations/$DESIRED_MIGRATION_DIRECTORY` to postgres rds through lambda

#### build & deploy FAST
* `make deploy ENV=dev` to build and deploy lambda

#### deploy migrations
1. see `/mxfactorial/migrations/README.md`

#### clean
1. `make clean`

terraform: https://github.com/systemaccounting/mxfactorial/blob/develop/infrastructure/terraform/aws/modules/environment/v001/go-migrate.tf