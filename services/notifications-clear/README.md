<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### notifications-clear

1. invoked by apigateway v2 with `clearnotifications` websocket message from client
1. sets `account_name` in `websocket` table if not set
1. deletes `transaction_notification` records
1. returns `id`s of deleted `transaction_notification` records

deploy: `make deploy ENV=dev`

terraform: https://github.com/systemaccounting/mxfactorial/blob/8c92e48e04af73ed700b2471a05f6b0ee76c0912/infrastructure/terraform/aws/modules/environment/v001/lambda-services.tf#L160-L171

wscat: local development instructions for api gateway websockets available from services/internal-tools/wss-demo-client/README.md
