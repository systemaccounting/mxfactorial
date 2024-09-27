<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### request-by-id

1. invoked by `graphql` service after receiving request sent by client
1. queries transaction tables for request* by `id`
1. returns request with `transaction_item`s

\* note: requests and transactions are stored in the same tables. "request" is a "transaction" with an approval timestamp is pending

deploy: `make deploy ENV=dev`

terraform: https://github.com/systemaccounting/mxfactorial/blob/d45b5dcb214eddb531819d2206786fbdd5c9033a/infra/terraform/aws/modules/environment/v001/lambda-services.tf#L96-L106