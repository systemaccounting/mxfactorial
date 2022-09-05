<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### request-by-id

1. invoked by `graphql` service after receiving request sent by client
1. queries transaction tables for request* by `id`
1. returns request with `transaction_item`s

\* note: requests and transactions are stored in the same tables. "request" is a "transaction" with an approval timestamp is pending

deploy: `make deploy ENV=dev`

terraform: https://github.com/systemaccounting/mxfactorial/blob/8c92e48e04af73ed700b2471a05f6b0ee76c0912/infrastructure/terraform/aws/modules/environment/v001/lambda-services.tf#L67-L74