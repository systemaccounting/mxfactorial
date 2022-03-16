<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### db-reset

1. invoked by apigwateway v2 after receiving an http request
1. invokes `go-migrate` to reset rds

deploy: `make deploy ENV=dev`

lambda terraform: https://github.com/systemaccounting/mxfactorial/blob/develop/infrastructure/terraform/aws/modules/environment/v001/db-reset.tf
api terraform: https://github.com/systemaccounting/mxfactorial/blob/develop/infrastructure/terraform/aws/modules/environment/v001/db-reset-api.tf