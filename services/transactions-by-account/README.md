<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### transactions-by-account

1. invoked by `graphql` service after request sent by client
1. queries transaction tables for last 20 transactions by account name
1. returns transactions

deploy: `make deploy ENV=dev`

terraform: https://github.com/systemaccounting/mxfactorial/blob/develop/infrastructure/terraform/aws/modules/environment/v001/lambda-services.tf#L76-L85