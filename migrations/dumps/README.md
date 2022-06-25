<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

dumps created for expedient development

replaces 2 minute running time to create test db using migrations and service calls with 5 seconds using `psql` restore

\**note: commands assume project root as current working directory*

#### tl;dr
1. `make -C './migrations' run` to start postgres in docker
1. `make -C './migrations/dumps' restore-testseed` to build a test db in 5 seconds

#### running times

`make -C './migrations' insert` - **2 minutes**:
  1. drops test db
  1. up migrates postgres with `./migrations/schema`, `./migrations/seed` and `./migrations/testseed` directories
  1. inserts mix of approximately 40 requests and transactions from `./services/gopkg/testdata/requests.json` by calling `services/request-create` and `services/request-approve`

`make -C './migrations/dumps' restore-testseed` - **5 seconds**:
  1. down migrates test db to drop functions
  1. drops test db to discard migration tool tables
  1. restores db with `./migrations/dumps/testseed.sql`

  #### use
  1. change schema and test data in:
      1. `./migrations/schema`
      1. `./migrations/seed`
      1. `./migrations/testseed`
      1. `./services/gopkg/testdata/requests.json`
  1. rebuild test db with `make -C './migrations' insert`
  1. `make -C './migrations/dumps' dump-testseed` to create new `./migrations/dumps/testseed.sql`
  1. commit & push `./migrations/dumps/testseed.sql` change
  1. enjoy a 5 second `make -C './migrations/dumps' restore-testseed` test db rebuild