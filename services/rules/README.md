<p align="center">
  <a href="https://www.systemaccounting.org/" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

1. invoked by `graphql` after request sent by client, or by `request-create` service testing if client request includes all current and expected items
1. queries for rules applicable to items and accounts
1. applies transaction_item and approval rules
1. returns current and expected items

\* *notes*
* rule endpoint passes transaction, transaction_item, rule_instance_id primary keys to accommodate testing by transaction approval endpoint

### requirements
1. debitor approval rules condition setting approval time stamps on sufficient account balances

### dev
1. follow steps in `schema/README.md` to start postgres in docker
1. `make install` to install prod + dev deps
1. set desired values in `TEST_EVENT` makefile variable
1. `make run` to locally test lambda handler against postgres in docker

### deploy to lambda
1. `make install-prod` to install prod only deps
1. `make zip-only` to zip source files
1. `make put-object ENV=dev` to put zip in s3
1. `make update-function ENV=dev` to deploy zip to lambda from s3

### deploy to lambda FAST
1. `make deploy ENV=dev`

### invoke lambda
1. set desired values in `TEST_EVENT` makefile variable
1. `make invoke ENV=dev`

### testing
1. `make install` to install prod + dev deps
1. `make test-unit` runs unit tests
1. integration tests:
    1. `make deploy ENV=dev` zips & deploys code to aws lambda
    1. `make get-secrets ENV=dev` creates a local `.env` file from aws secrets manager
    1. `make test-integration ENV=dev` runs integration tests against aws resources from local using `.env` file

### run unit & integration tests FAST
1. `make test ENV=dev`

### prepare for terraform
1. `make initial-deploy ENV=dev` to zip and put source in s3 only

terraform: https://github.com/systemaccounting/mxfactorial/blob/develop/infrastructure/terraform/aws/modules/environment/v001/rules.tf