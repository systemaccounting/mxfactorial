<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### notifications-send

1. invoked by `request-create` or `request-approve` services through sns with `id` of `transaction_notification` records
1. queries `transaction_notification` records by `id`
1. queries open websockets, or `connection_id`, for each recipient account in `websocket` table
1. sends `transaction_notification` records to account recipients with open websockets
1. deletes websocket record in `websocket` table IF websockets proves stale

deploy: `make deploy ENV=dev`

terraform: https://github.com/systemaccounting/mxfactorial/blob/8c92e48e04af73ed700b2471a05f6b0ee76c0912/infrastructure/terraform/aws/modules/environment/v001/lambda-services.tf#L126-L136