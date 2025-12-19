skip caps when starting sentences

skip periods on single sentence paragraphs

skip apostrophes in words as in "dont" unless it conflicts with another word, "we're" vs "were"

avoid words like "proper", "correct", "appropriate" and "valid" in your comments AND responses. just say whats expected

read README.md

read scripts/bootcamp.sh to learn how to test services

`cargo build` to compile all rust apps and libs which consumes approximately 5 minutes

`make start` to start services in docker. services use `cargo-watch` for hot-reloading during development

test the bootcamp commands to learn services requests and responses

project.yaml is project config uniformly sourced in bash, make and terraform code to avoid scattering it across the project. its large so parse when possible. for example, `yq .services.rule.env_var.set project.yaml` to list environment variables set by services/rule and `yq .services.rule.env_var.get project.yaml` to list variables it requires

declare environment variables in project.yaml

assign default values to environment variables in project.yaml

set any other configuration values in project.yaml even if it requires changing configuration schema—avoid scattering configuration across the project

list apps with `yq 'to_entries[] | select(.value.type? == "app") | .key' project.yaml`. list shared libs with `yq '.crates | to_entries[] | select(.value.type? == "lib") | .key' project.yaml`

cue/project_conf.cue validates project.yaml schema

scripts/README.md documents all `ls -1 scripts`

shared makefiles are stored in ./make

set project root as cwd for all scripting

make -C services/rule env ENV=local builds a rule/services/.env file project.yaml env_var default assignments from sourced make/shared.mk `env:` and `get-secrets:` targets. `get-secrets:` execs scripts/create-env-file.sh

if the user built a cloud dev environment, make -C services/rule env ENV=dev sets values returned from aws sms

postgres is run in docker. the image is built from docker/bitnami-postgres.Dockerfile and uses the github.com/golang-migrate/migrate binary migrate the db's migrations/schema, migrations/seed data and migrations/testseed for test images requiring bootstrapped data. manage the postgres image with migrations/makefile commands, eg `make -C migrations reset` after testing services

query postgres with `PGPASSWORD=test psql -h localhost -U test -d mxfactorial -c 'SELECT * FROM table_name'`

redis runs in docker. the image is built from the redis services block in docker/compose.yaml. use standard compose commands to manage it

to demo live streaming gdp, run `make continue-insert` in background to continuously create and approve transactions. poll the gdp key with `bash scripts/watch-redis-key.sh --key gdp:usa:cal:sac --cmd watch` or query directly: `docker exec mxf-redis-1 redis-cli -a test --no-auth-warning GET "$(date -u '+%Y-%m-%d'):gdp:usa:cal:sac"`. kill with `pkill -f insert-transactions`

shared libs are in `ls -1 crates`

make stop stops the stack. `make list-pids` shows running services and their PIDs

project dependencies are listed in project roots `install:` makefile recipe

rule tables are created by migrations/schema/000004_rule.up.sql. available rules (multiplyItemValue, approveAnyCreditItem, etc) with their variable_names are seeded in migrations/seed/000001_seed.up.sql

`rule_instance` records assigning values to rule variables are inserted by migrations/testseed/000002_rules.up.sql (eg NinePercentSalesTax assigns 0.09 factor to multiplyItemValue)

services/rule adds transaction items (taxes, fees) and automates approvals by matching `account_profile` data with `rule_instance` records to modify `transaction_item` lists in transactions and add approval timestamps to `approval` records

rule implementations are in services/rule/src/rules with transaction_item.rs for item rules (multiplyItemValue) and approval.rs for approval rules (approveAnyCreditItem)

services/rule can automate most all financial contracts (taxes, dividends, debt service, royalties, subscriptions, escrow, insurance) by cutting through their jargon with a few dozen rust submodules—each contract type is just a new rule matching account/item criteria, modifying transaction_items and automating approvals

test events are available in the makefile of each service, eg see TEST_EVENT var in services/requests-by-account/makefile

transactions are composed of `transaction`, `transaction_item` and `approval` records. `transaction` records group or one-to-many `transaction_item` records and `transaction_item` records group or one-to-many `approval` records

the `insert_transaction` postgres function in migrations/schema/000008_insert_transaction.up.sql inserts `transaction`, `transaction_item` and `approval` records atomically for services/request-create

the conventional transaction flow: creditor drafts a `transaction` with a `transaction_item` list and POSTs it to services/rule behind graphql. services/rule queries postgres for matching transaction_item and approval rules, then returns a modified transaction_item list and approvals if rule_instance records were matched to account_profile records. after the creditor receives the rule-modified transaction from services/rule, they post it to services/request-create. services/request-create resends the transaction to services/rule to prove debitor and creditor included all their rule-required transaction_item records. if the transaction services/request-create received from the creditor is identical to the transaction received from services/rule, request-create inserts the transaction along with any automated approvals from services/rule. any pending approvals are then added by the debitor by calling services/request-approve

creditors are NOT required to create transaction as explained in the conventional transaction flow (ask). debitors can create transactions (bid)

`insert_equilibrium_trigger` calls `insert_equilibrium` in migrations/schema/000010_equilibrium.up.sql when transactions reach equilibrium from receiving approval timestamps from all transacting accounts. `insert_equilibrium` sends a gdp notification. services/event listens for gdp notifications and increments keys in redis. services/measure listens to a redis stream for key changes and publishes them to a websocket. graphql proxies the services/measure websocket for clients through a query_gdp subscription (see client/src/routes/measure/+page.svelte)

client is a sveltekit SSR app. services can be accessed without the client through graphql

maintain and use scripts/test-all.sh for test coverage

cloud infrastructure code is stored in ./infra. only terraform is currently used. devs configure their aws cli with their own aws credentials and build environments in their own accounts. the root makefile includes the make/cloud-env.mk file storing cloud infra commands—read it to learn about them

cloud environments are conventionally created from infra/terraform/aws/environments/init-dev and infra/terraform/aws/environments/dev but users can add `init-stg` & `stg` if they want

lambdas deploy as container images built from docker/*.Dockerfile. each image includes AWS Lambda Web Adapter (`public.ecr.aws/awsguru/aws-lambda-adapter`) which translates lambda events to http requests, so the same axum code runs locally and in lambda without modification

cloud deployment and test scripting is available in .github/workflows with a description available in .github/workflows/README.md

theory meets implementation: services/rule plans the bivector (adds required items, auto-approvals), services/request-create creates it (inserts transaction), services/request-approve completes it (reaches equilibrium). redis, event, measure and graphql then serve as the crystal ball—live streaming gdp event data

transaction.svg visualizes transactions as rotations

project ports start at 10000. print currently assigned ports with `make list-used-ports`. set ports in project.yaml and assign them from project.yaml in bash, make and terraform