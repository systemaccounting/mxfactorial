<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### notifications-get

1. invoked by apigateway v2 with `getnotifications` websocket message received from client
1. sets `account_name` in `websocket` table if not set
1. queries `transaction_notification` by `account_name`
1. returns `transaction_notification` records
1. deletes websocket record in `websocket` table IF websockets proves stale

deploy: `make deploy ENV=dev`

terraform: https://github.com/systemaccounting/mxfactorial/blob/8c92e48e04af73ed700b2471a05f6b0ee76c0912/infrastructure/terraform/aws/modules/environment/v001/lambda-services.tf#L145-L157