<p align="center">
  <a href="https://www.systemaccounting.org/" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

1. invoked by `graphql` after request sent by client, or by `request-create` service to test if all current and expected items are included in client request
1. queries for rules applicable to items and accounts
1. applies transaction_item and approval rules
1. returns current and expected items

### request

1. the `JacobWebb` customer brings a single `bottled water` item priced at `1.000` to the `GroceryStore` cashier
1. the `GroceryStore` cashier sends the following `transaction_item` list to the rule service to apply rules required by a transaction between the `debitor` and `creditor` accounts:

```json
// graphql variable
[
  {
    "item_id": "bottled water",
    "price": "1.000",
    "quantity": "1",
    "debitor_first": false,
    "debitor": "JacobWebb",
    "creditor": "GroceryStore",
    "debitor_approval_time": null,
    "creditor_approval_time": null,
    // ... other properties
  }
]
```

### response

the rule service returns a `transaction` object with `transaction_items` listing:
1. rule added `transaction_items` and `approvals`
1. the initial `bottled water` transaction_item

```json
{
  "auth_account": null,
  "transaction": {
    "id": null,
    "rule_instance_id": null,
    "author": null,
    "author_device_id": null,
    "author_device_latlng": null,
    "author_role": null,
    "equilibrium_time": null,
    "sum_value": "1.090", // 1.000 bottled water + 0.090 california sales tax 
    "transaction_items": [
      {
        "id": null,
        "transaction_id": null,
        "item_id": "bottled water", // initially sent by GroceryStore account
        "price": "1.000",
        "quantity": "1",
        "debitor_first": null,
        "rule_instance_id": null, // created by user, NOT rule service
        "rule_exec_ids": [
          "j_SxScz6"
        ],
        "unit_of_measurement": null,
        "units_measured": null,
        "debitor": "JacobWebb",
        "creditor": "GroceryStore",
        "debitor_profile_id": null,
        "creditor_profile_id": null,
        "debitor_approval_time": null,
        "creditor_approval_time": "2023-03-17T14:06:04.780Z", // added by rule service when all creditor approvals received timestamps
        "debitor_expiration_time": null,
        "creditor_expiration_time": null,
        "debitor_rejection_time": null,
        "creditor_rejection_time": null,
        "approvals": [  // debitor and creditor approvals per transaction_item
          {
            "id": null,
            "rule_instance_id": null, // no rule found, approval_time will be added manually by JacobWebb
            "transaction_id": null,
            "transaction_item_id": null,
            "account_name": "JacobWebb",
            "account_role": "debitor", // JacobWebb balance will decrease
            "device_id": null,
            "device_latlng": null,
            "approval_time": null, // pending
            "rejection_time": null,
            "expiration_time": null
          },
          {
            "id": null,
            "rule_instance_id": "9", // approval_time added by rule service
            "transaction_id": null,
            "transaction_item_id": null,
            "account_name": "MiriamLevy", // GroceryStore account owner
            "account_role": "creditor", // GroceryStore balance will increase
            "device_id": null,
            "device_latlng": null,
            "approval_time": "2023-03-17T14:06:04.780Z", // automated
            "rejection_time": null,
            "expiration_time": null
          }
        ]
      },
      {
        "id": null,
        "transaction_id": null,
        "item_id": "9% state sales tax", // added by rule service
        "price": "0.090",
        "quantity": "1.000",
        "debitor_first": null,
        "rule_instance_id": "1", // tax transaction_item was added by rule
        "rule_exec_ids": [
          "j_SxScz6"
        ],
        "unit_of_measurement": null,
        "units_measured": null,
        "debitor": "JacobWebb",
        "creditor": "StateOfCalifornia",
        "debitor_profile_id": null,
        "creditor_profile_id": null,
        "debitor_approval_time": null,
        "creditor_approval_time": "2023-03-17T14:06:04.780Z", // added by rule service when all *creditor* approvals received timestamps
        "debitor_expiration_time": null,
        "creditor_expiration_time": null,
        "debitor_rejection_time": null,
        "creditor_rejection_time": null,
        "approvals": [
          {
            "id": null,
            "rule_instance_id": null, // no rule found, approval_time will be added manually by JacobWebb
            "transaction_id": null,
            "transaction_item_id": null,
            "account_name": "JacobWebb", // owner of JacobWebb account
            "account_role": "debitor", // JacobWebb balance will decrease
            "device_id": null,
            "device_latlng": null,
            "approval_time": null, // pending
            "rejection_time": null,
            "expiration_time": null
          },
          {
            "id": null,
            "rule_instance_id": "4", // approval_time was added by rule service
            "transaction_id": null,
            "transaction_item_id": null,
            "account_name": "BenRoss", // owner of StateOfCalifornia account
            "account_role": "creditor", // StateOfCalifornia balance will increase
            "device_id": null,
            "device_latlng": null,
            "approval_time": "2023-03-17T14:06:04.780Z", // automated
            "rejection_time": null,
            "expiration_time": null
          },
          {
            "id": null,
            "rule_instance_id": "5",
            "transaction_id": null,
            "transaction_item_id": null,
            "account_name": "DanLee",
            "account_role": "creditor",
            "device_id": null,
            "device_latlng": null,
            "approval_time": "2023-03-17T14:06:04.780Z",
            "rejection_time": null,
            "expiration_time": null
          },
          {
            "id": null,
            "rule_instance_id": "7",
            "transaction_id": null,
            "transaction_item_id": null,
            "account_name": "MiriamLevy",
            "account_role": "creditor",
            "device_id": null,
            "device_latlng": null,
            "approval_time": "2023-03-17T14:06:04.780Z",
            "rejection_time": null,
            "expiration_time": null
          }
        ]
      }
    ]
  }
}
```

### dev
1. install [rust](https://doc.rust-lang.org/book/ch01-01-installation.html#installing-rustup-on-linux-or-macos), [cargo-watch](https://crates.io/crates/cargo-watch) and [docker](https://docs.docker.com/get-docker/)
1. start docker
1. `make dev` to start:
    1. the rule service
    1. postgres in docker
1. cntrl + c && `make -C migrations clean` OR `make stop-dev` in a separate shell to stop dev process

### deploy to lambda
1. `make compile` to build for lambda
1. `make zip-only` to zip lambda binary
1. `make put-object ENV=dev` to put zip in s3
1. `make update-function ENV=dev` to deploy zip to lambda from s3

### deploy to lambda FAST
1. `make deploy ENV=dev`

### invoke lambda
1. set desired values in `TEST_EVENT` makefile variable
1. `make invoke ENV=dev`

### testing
1. `make test-lint` for [clippy](https://github.com/rust-lang/rust-clippy)
1. `make test-unit` for unit tests
1. run integration tests from project root:
    * docker:
        1. `make compose-up`  
        1. `make test-docker`  
    - cloud:
        1. `make test-cloud`  

### run unit & integration tests FAST
`make test ENV=dev`

### prepare for terraform
`make initial-deploy ENV=dev` to zip and put source in s3 only

terraform: https://github.com/systemaccounting/mxfactorial/blob/develop/infrastructure/terraform/aws/modules/environment/v001/lambda-services.tf#L215-L234