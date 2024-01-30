<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>


### integration tests

commands assume project root as current working directory

local:
1. `make start`
1. `make test-local` in a separate shell

docker-compose:
1. `make compose-up`
1. `make test-docker` in a separate shell

cloud:
1. OPTIONAL: `make all CMD=deploy ENV=dev` to deploy all services
1. `make test-cloud ENV=dev`