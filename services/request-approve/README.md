<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### request-approve

1. invoked by `graphql` service after receiving request sent by client
1. queries request by `id`
1. adds timestamps to records in `approval` table
1. copies timestamps to records in `transaction_item` and `transaction` tables
1. notifies approvers of request approval

### request

the `JacobWebb` customer approves all `transaction_items` in the `transaction` by sending the following `transaction_id` to the request-approve service:

```json
// graphql variable
{
    "transaction_id": "3",
    "account_name": "JacobWebb",
    "account_role": "debitor",
}
```

### response

the `request-approve` service returns a `transaction` object with an `equilibrium_time` value  

all account balances referenced in `transaction_items` are changed when a `transaction` has an `equilibrium_time` value  

```json
{
  "data": {
    "approveRequest": {
      "id": "3",
      "rule_instance_id": null,
      "author": "GroceryStore",
      "author_device_id": null,
      "author_device_latlng": null,
      "author_role": "creditor",
      "equilibrium_time": "2023-03-20T05:24:13.465Z", // all items approved
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
          "debitor_approval_time": "2023-03-20T05:24:13.465Z", // approved by debitor
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
          "debitor_approval_time": "2023-03-20T05:24:13.465Z", // approved by debitor
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

terraform: https://github.com/systemaccounting/mxfactorial/blob/8c92e48e04af73ed700b2471a05f6b0ee76c0912/infrastructure/terraform/aws/modules/environment/v001/lambda-services.tf#L44-L54