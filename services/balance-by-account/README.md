<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### balance-by-account

1. invoked by `graphql` after receiving request sent by client
1. queries `account_balance` table by `account_name`
1. returns `current_balance`

deploy: `make deploy ENV=dev`

terraform: https://github.com/systemaccounting/mxfactorial/blob/d45b5dcb214eddb531819d2206786fbdd5c9033a/infra/terraform/aws/modules/environment/v001/lambda-services.tf#L70-L80
