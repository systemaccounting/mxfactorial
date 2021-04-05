<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>


deploys pushed migrations in `/mxfactorial/schema/$DESIRED_MIGRATION_DIRECTORY` to postgres rds through lambda

### prepare for terraform
1. `make initial-deploy ENV=dev` to store lambda layer and function code in s3
1. `terraform apply`

### build & deploy
1. `make build-layer` to build lambda layer storing `psql` and `go-migrate` dependencies as `go-migrate-layer.zip`
1. put lambda layer in s3 with `make put-layer ENV=dev`
1. publish layer in s3 with `make publish-layer ENV=dev`
1. `make zip` to zip `index.sh` as `go-migrate-src.zip`
1. put zip in s3 with `make put-object ENV=dev`
1. update function from zip in s3 with `make update-function ENV=dev`

### build & deploy FAST
1. `make deploy-all ENV=dev` to build and deploy lambda layer and function code

### deploy migrations
1. see `/mxfactorial/schema/README.md`

### clean
1. `make clean`