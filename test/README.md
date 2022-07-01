<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>


### integration tests

integration tests

plain javascript keeps configuration cost low

1. OPTIONAL: `make resetrds` to reset dev rds database
1. `make get-secrets ENV=dev` to create `.env` file with `GRAPHQL_URI` variable assignment
1. `make test`

#### 1. rules, request & approve
1. sends `services/gopkg/testdata/intRules.json` as `getRules` graphql query
1. sends `createRequest` graphql mutation
1. sends `approveRequest` graphql mutation
1. expects transaction with `equilibrium_time`
1. expects transaction_item(s) with `creditor_approval_time` and `deditor_approval_time`