<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### request-create

1. invoked by `graphql` service after request sent by client
1. tests request received from client for all current and expected items returned by rules
1. adds request in db
1. adds approval timestamp from requester
1. copies timestamps to records in `transaction_item` and `transaction` tables
1. notifies approvers of pending and completed approvals

deploy: `make deploy ENV=dev`

terraform: https://github.com/systemaccounting/mxfactorial/blob/8c92e48e04af73ed700b2471a05f6b0ee76c0912/infrastructure/terraform/aws/modules/environment/v001/lambda-services.tf#L3-L14