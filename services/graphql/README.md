<p align="center">
  <a href="https://www.systemaccounting.org/" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

### graphql

1. invoked by api gateway v2
1. routes request to service
1. responds on behalf of service to client

##### local development
1. `make deps` to install deps
1. `make get-secrets ENV=dev` to create `./env` file from secrets manager
1. `make reflex` to:
    1. generate graphql code from schema config
    1. set `LOCAL_ENV=1` env var
    1. run graphql lambda in local webserver
    1. auto-restart on file changes
1. add graphql schema changes in `./graph/*.graphqls`
1. `make gen` to generate code from schema

##### build
1. `make deps` to to install deps
1. `make compile` to create go binary for lambda linux
1. `make zip` to create zip
1. `make clean` to clean binary and zip file

##### build FAST
1. `make build` to clean, install deps, compile and zip

##### deploy
1. `make build` to create artifact
1. `make put-object ENV=dev` to put artifact in s3
1. `make update-function ENV` to update function with artifact in s3

##### deploy FAST
1. `make deploy ENV=dev` to build artifact and deploy to dev lambda
1. OR `make now`

terraform: https://github.com/systemaccounting/mxfactorial/blob/8c92e48e04af73ed700b2471a05f6b0ee76c0912/infrastructure/terraform/aws/modules/environment/v001/graphql.tf