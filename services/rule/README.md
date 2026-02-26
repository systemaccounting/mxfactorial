<p align="center">
  <a href="https://www.systemaccounting.org/" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

axum service that applies transaction item and approval rules to a transaction

### how it works

1. receives a `transaction` from `graphql` (client request) or `request-create` (testing current vs expected items)
1. when `rule_instance_id` is set and `transaction_items` is empty, builds items from `transaction_item_rule_instance` templates in the database (used by auto-transact services like cron and threshold)
1. queries for `transaction_item_rule_instance` rules matching the state and account of each debitor and creditor
1. applies transaction item rules per user-defined role sequence (`debitor_first` or creditor first)
1. queries for `approval_rule_instance` rules matching each account owner (approver)
1. applies approval rules, automating `approval_time` when a rule matches
1. labels each `transaction_item` with `debitor_approval_time` or `creditor_approval_time` when all approvals for that role have timestamps
1. returns the transaction with rule-added items, approvals, and updated `sum_value`

### transaction item rules

defined in `src/rules/transaction_item.rs`:

- **multiplyItemValue**: computes `price * factor` and returns only the computed item (e.g. a dividend). `variable_values = [DEBITOR, CREDITOR, ITEM_NAME, FACTOR]`
- **appendMultipliedItemValue**: computes `price * factor` and returns both the original item (with `rule_exec_id` added) and the computed item (e.g. a sales tax). same variable_values

the `ANY` token in debitor or creditor position matches the corresponding account from the original transaction item

### approval rules

defined in `src/rules/approval.rs`:

- **approveAnyCreditItem**: automates approval for a creditor approver on any credit item. `variable_values = [CREDITOR, APPROVER_ROLE, APPROVER_NAME]`
- **approveItemBetweenAccounts**: automates approval for a specific debitor/creditor/item_id match. `variable_values = [DEBITOR, CREDITOR, ITEM_ID, APPROVER_ROLE, APPROVER_NAME]`

### request

1. the `JacobWebb` customer brings a single `bottled water` item priced at `1.000` to the `GroceryStore` cashier
1. the `GroceryStore` cashier sends the following `transaction` to the rule service to apply rules required by a transaction between the `debitor` and `creditor` accounts:

```json5
// graphql variable
{
  "author": "GroceryStore",
  "author_device_id": null,
  "author_device_latlng": null,
  "author_role": "creditor",
  "debitor_first": null,
  "sum_value": "1.000",
  "transaction_items": [
    {
      "item_id": "bottled water",
      "price": "1.000",
      "quantity": "1",
      "debitor": "JacobWebb",
      "creditor": "GroceryStore",
      "debitor_approval_time": null,
      "creditor_approval_time": null,
      // ... other properties
    }
  ]
}
```

### response

the rule service returns a `transaction` object with `transaction_items` listing:
1. rule added `transaction_items` and `approvals`
1. the initial `bottled water` transaction_item

```json5
{
  "auth_account": null,
  "transaction": {
    "id": null,
    "rule_instance_id": null,
    "author": "GroceryStore",
    "author_device_id": null,
    "author_device_latlng": null,
    "author_role": "creditor",
    "equilibrium_time": null,
    "debitor_first": null,
    "sum_value": "1.090", // 1.000 bottled water + 0.090 california sales tax
    "transaction_items": [
      {
        "id": null,
        "transaction_id": null,
        "item_id": "bottled water", // initially sent by GroceryStore account
        "price": "1.000",
        "quantity": "1",
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
1. `make dev` to start the rule service and postgres in docker
1. cntrl + c to stop, then `make -C migrations clean` to clean up

### testing
1. `make test-lint` for [clippy](https://github.com/rust-lang/rust-clippy)
1. `make test-unit` for unit tests
1. `make water` to curl a bottled water request to a running local rule service
1. run integration tests from project root:
    * docker: `make compose-up && make test-docker`
    * cloud: `make -C tests test-cloud ENV=dev`

### deploy
`make deploy ENV=dev` to build, push to ecr, and deploy lambda
