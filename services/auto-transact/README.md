<p align="center">
  <a href="https://www.systemaccounting.org/" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

receives complete transaction payloads from postgres (`execute_transaction_rule_instance` via pg_http) and forwards them through the rule and request-create pipeline. no db queries — postgres builds the payload

exists because pg_http has no retry logic, error handling, or observability. auto-transact receives the payload from pg_http and adds reliability to the pipeline

### todo

- retry logic for rule and request-create calls
- dead letter queue for failed transactions
- metrics and alerting
- extract rule and request-create into shared crates so auto-transact can call them in-process instead of over the network

### flow

1. pg_cron or equilibrium trigger calls `execute_transaction_rule_instance(id)` in postgres
1. pg function builds complete transaction payload from `transaction_rule_instance` and `transaction_item_rule_instance` rows
1. pg function POSTs payload to auto-transact via pg_http
1. auto-transact POSTs transaction to rule service for automation (taxes, approvals)
1. auto-transact sets `auth_account` from `transaction.author`
1. auto-transact POSTs rule-applied transaction to request-create
1. request-create verifies idempotency, then inserts

### request

pg_http POSTs a `Transaction` to `POST /`:

```json5
{
  "rule_instance_id": "1",
  "author": "GroceryStore",
  "author_role": "creditor",
  "sum_value": "0.500",
  "transaction_items": [
    {
      "item_id": "gum",
      "price": "0.500",
      "quantity": "1",
      "debitor": "JoeCarter",
      "creditor": "GroceryStore"
    }
  ]
}
```

transaction items must NOT include `rule_instance_id` — they are user items, not rule-generated items. request-create uses `filter_user_added` to strip items with `rule_instance_id` before sending to rule for idempotency verification

### response

returns `200 OK` on success. auto-transact does not return a body to pg_http

### dependencies

| env var | description |
|---|---|
| `RULE_URL` | rule service url |
| `REQUEST_CREATE_URL` | request-create service url |
| `AUTO_TRANSACT_PORT` | listen port (10011) |
| `HOSTNAME_OR_IP` | bind address (default 0.0.0.0) |
| `READINESS_CHECK_PATH` | health check endpoint path |
| `PGDATABASE` | postgres database name |
| `PGUSER` | postgres user |
| `PGPASSWORD` | postgres password |
| `PGHOST` | postgres host |
| `PGPORT` | postgres port |

### related files

- `migrations/schema/000011_cron.up.sql` — `execute_transaction_rule_instance` pg function, pg_cron and pg_http extensions
- `migrations/testseedcron/000001_cron.up.sql` — test data and `auto_transact.url` GUC
- `docker/bitnami-postgres.Dockerfile` — pg_cron and pg_http compiled in postgres image

### dev
1. install [rust](https://doc.rust-lang.org/book/ch01-01-installation.html#installing-rustup-on-linux-or-macos), [cargo-watch](https://crates.io/crates/cargo-watch) and [docker](https://docs.docker.com/get-docker/)
1. start docker
1. `make dev` to start:
    1. the auto-transact service
    1. postgres in docker
1. cntrl + c && `make -C migrations clean` OR `make stop-dev` in a separate shell to stop dev process

### deploy to lambda
1. `make compile` to build for lambda
1. `make zip-only` to zip lambda binary
1. `make put-object ENV=dev` to put zip in s3
1. `make update-function ENV=dev` to deploy zip to lambda from s3

### deploy to lambda FAST
1. `make deploy ENV=dev`

### testing
1. `make test-lint` for [clippy](https://github.com/rust-lang/rust-clippy)
1. `make test-unit` for unit tests
1. run integration tests from project root:
    * docker:
        1. `make compose-up`
        1. `make test-docker`
    - cloud:
        1. `make test-cloud`

### prepare for terraform
`make initial-deploy ENV=dev` to zip and put source in s3 only
