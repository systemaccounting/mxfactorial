<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>


### go-migrate

deploys migrations in `/mxfactorial/migrations/$DESIRED_MIGRATION_DIRECTORY` to local or rds postgres

#### build & deploy FAST
* `make deploy ENV=dev` to build image and deploy to lambda

#### deploy migrations
1. see `/mxfactorial/migrations/README.md`

terraform: https://github.com/systemaccounting/mxfactorial/blob/develop/infrastructure/terraform/aws/modules/environment/v001/go-migrate.tf