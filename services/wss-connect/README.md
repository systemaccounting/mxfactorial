<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### wss-connect

1. invoked by apigwateway v2 after creating or deleting websocket for client
1. adds or deletes websocket `connection_id` in `websocket` table so other services can notify users through websockets

deploy: `make deploy ENV=dev`

terraform: https://github.com/systemaccounting/mxfactorial/blob/develop/infrastructure/terraform/aws/modules/environment/v001/lambda-services.tf#L116-L123