<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>


### app name

trans-query-account-faas

### description

1. receives lambda invoke from graphql resolver
1. queries transactions in postgres by account
1. responds with transactions to graphql resolver

### development

1. save creds in `~/.aws/credentials` to access lambda and postgres
1. set desired values for `TEST_ACCOUNT`, `TEST_TRANSACTION_ID`, `TEST_EVENT` and `TEST_SENDER_ACCOUNT` variables in `./makefile`
1. `make test-local` to get postgres creds from secrets manager, then run code locally

### testing

1. `make test-unit` for unit tests
1. `make test-cover` to measure unit test coverage
1.  complete steps 1 & 2 in `development` section above to prep for integration tests
1. `make deploy ENV=dev` to manually deploy to dev env
1. `make test-integration ENV=dev` to set up data in postgres, test lambda, then tear down data in dev env

### deploy

push commit OR `make deploy ENV=dev` to manually deploy to dev env

### prod config
see `infrastructure/terraform/aws/modules/environment/trans-query-account-faas.tf` lambda environment variables