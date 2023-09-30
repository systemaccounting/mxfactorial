<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### request-create

1. invoked by `graphql` service after it receives request sent by client
1. tests request received from client for all current and expected items returned by rules
1. adds request in db
1. adds approval timestamp from requester
1. notifies approvers of pending and completed approvals

### request

the `GroceryStore` cashier sends a `transaction_item` list to the request-create service:

```json5
// graphql variable
{
  "transaction_items": [
    {
      "item_id": "9% state sales tax",
      "price": "0.090",
      "quantity": "1.000",
      "debitor_first": false,
      "rule_instance_id": "1",
      "debitor": "JacobWebb",
      "creditor": "StateOfCalifornia",
      "debitor_approval_time": null,
      "creditor_approval_time": "2023-03-17T14:06:04.780Z",
      // .. other
    },
    {
      "item_id": "bottled water",
      "price": "1.000",
      "quantity": "1",
      "debitor_first": false,
      "debitor": "JacobWebb",
      "creditor": "GroceryStore",
      "debitor_approval_time": null,
      "creditor_approval_time": "2023-03-17T14:06:04.780Z",
      // .. other
    }
  ]
}
```

### response

the `request-create` service:
1. repeats the `transaction_items` list to the `rule` service to test for any missing items required by `rule`
1. creates the `transaction` request IF 0 missing `transaction_items` found
1. returns a `transaction` object with approvals **pending** from the debitor

```json5
{
  "data": {
    "createRequest": {
      "id": "3",
      "rule_instance_id": null,
      "author": "GroceryStore",
      "author_device_id": null,
      "author_device_latlng": null,
      "author_role": "creditor",
      "sum_value": "1.09",
      "transaction_items": [
        {
          "id": "13",
          "transaction_id": "3",
          "item_id": "bottled water",
          "price": "1",
          "quantity": "1",
          "debitor_first": false,
          "rule_instance_id": null,
          "unit_of_measurement": null,
          "units_measured": null,
          "debitor": "JacobWebb",
          "creditor": "GroceryStore",
          "debitor_profile_id": "7",
          "creditor_profile_id": "11",
          "debitor_approval_time": null, // manual approval *pending* from debitor
          "creditor_approval_time": "2023-03-20T04:58:27.771Z", // approved by creditor
          "debitor_expiration_time": null,
          "creditor_expiration_time": null,
          "debitor_rejection_time": null,
          "creditor_rejection_time": null
        },
        {
          "id": "14",
          "transaction_id": "3",
          "item_id": "9% state sales tax",
          "price": "0.09",
          "quantity": "1",
          "debitor_first": false,
          "rule_instance_id": "1",
          "unit_of_measurement": null,
          "units_measured": null,
          "debitor": "JacobWebb",
          "creditor": "StateOfCalifornia",
          "debitor_profile_id": "7",
          "creditor_profile_id": "27",
          "debitor_approval_time": null, // manual approval *pending* from debitor
          "creditor_approval_time": "2023-03-20T04:58:27.771Z", // approved by creditor
          "debitor_expiration_time": null,
          "creditor_expiration_time": null,
          "debitor_rejection_time": null,
          "creditor_rejection_time": null
        }
      ]
    }
  }
}
```

### deploy lambda

`make deploy ENV=dev`

### infra

terraform: https://github.com/systemaccounting/mxfactorial/blob/8c92e48e04af73ed700b2471a05f6b0ee76c0912/infrastructure/terraform/aws/modules/environment/v001/lambda-services.tf#L3-L14