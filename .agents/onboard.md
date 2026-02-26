skip caps when starting sentences

skip periods on single sentence paragraphs

skip apostrophes in words as in "dont" unless it conflicts with another word, "we're" vs "were"

avoid words like "proper", "correct", "appropriate" and "valid" in your comments AND responses. just say whats expected

read README.md

read scripts/bootcamp.sh to learn how to test services

`cargo build` to compile all rust apps and libs which consumes approximately 5 minutes

`make start` to start services in docker. it stops any running services first. always run in background unless instructed otherwise since it exits when finished and will cause a timeout. services use `cargo-watch` for hot-reloading during development

test the bootcamp commands to learn services requests and responses. the primary transaction bootcamp commands are `make rule`, `make request-create`, `make request-approve` and `make balance-by-account`

project.yaml is project config uniformly sourced in bash, make and terraform code to avoid scattering it across the project. its large so parse when possible. for example, `yq .services.rule.env_var.set project.yaml` to list environment variables set by services/rule and `yq .services.rule.env_var.get project.yaml` to list variables it requires

declare environment variables in project.yaml

assign default values to environment variables in project.yaml

set any other configuration values in project.yaml even if it requires changing configuration schema—avoid scattering configuration across the project

list apps with `yq 'to_entries[] | select(.value.type? == "app") | .key' project.yaml`. list shared libs with `yq '.crates | to_entries[] | select(.value.type? == "lib") | .key' project.yaml`

cue/project_conf.cue validates project.yaml schema

scripts/README.md documents all `ls -1 scripts`

shared makefiles are stored in ./make

set project root as cwd for all scripting

`bash scripts/create-all-env-files.sh --env local` regenerates all service .env files from project.yaml defaults. run this after changing env var configuration in project.yaml

make -C services/rule env ENV=local builds a rule/services/.env file project.yaml env_var default assignments from sourced make/shared.mk `env:` and `get-secrets:` targets. `get-secrets:` execs scripts/create-env-file.sh

if the user built a cloud dev environment, make -C services/rule env ENV=dev sets values returned from aws sms

postgres is run in docker. the image is built from docker/bitnami-postgres.Dockerfile and uses the github.com/golang-migrate/migrate binary migrate the db's migrations/schema, migrations/seed data and migrations/testseed for test images requiring bootstrapped data. manage the postgres image with migrations/makefile commands, eg `make -C migrations reset` after testing services

to test migration changes without rebuilding the postgres image, run migrations/go-migrate/migrate.sh directly: `SQL_TYPE=postgresql PGUSER=test PGPASSWORD=test PGHOST=localhost PGPORT=5432 PGDATABASE=mxfactorial bash migrations/go-migrate/migrate.sh --dir migrations --subdirs schema,seed,testseed --cmd reset`

query postgres with `PGPASSWORD=test psql -h localhost -U test -d mxfactorial -c 'SELECT * FROM table_name'`

redis runs in docker. the image is built from the redis services block in docker/storage.yaml. use standard compose commands to manage it

to demo live streaming gdp, run `make insert` in background to continuously create and approve transactions. poll the gdp key with `bash scripts/watch-redis-key.sh --key gdp:usa:cal:sac --cmd watch` or query directly: `docker exec mxf-redis-1 redis-cli -a test --no-auth-warning GET "$(date -u '+%Y-%m-%d'):gdp:usa:cal:sac"`. kill with `pkill -f insert-transactions`

shared libs are in `ls -1 crates`

make stop stops the stack. `make list-pids` shows running services and their PIDs

rust services use `tracing` for logging. log level is controlled by `RUST_LOG` env var sourced from the `rust_log` field in project.yaml per service (eg `yq '.services.auto-transact.rust_log' project.yaml`). most services default to `off`. set to `info` to enable logging then regenerate the .env with `make -C services/auto-transact env ENV=local` and restart the cargo-watch process. all service logs write to nohup.out at project root via make/rust.mk. read nohup.out with `grep` to check service output instead of tailing a terminal

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

`notify_equilibrium_trigger` calls `notify_equilibrium` in migrations/schema/000010_equilibrium.up.sql when transactions reach equilibrium from receiving approval timestamps from all transacting accounts. `notify_equilibrium` sends a pg_notify on the equilibrium channel. services/event listens for equilibrium notifications, claims pending transactions by setting `event_time` on rows where `equilibrium_time IS NOT NULL AND event_time IS NULL`, and increments gdp keys in redis, and accumulates threshold profit for auto-transact dividends. services/measure listens to a redis stream for key changes and publishes them to a websocket. graphql proxies the services/measure websocket for clients through a query_gdp subscription (see client/src/routes/measure/+page.svelte)

services/event also handles cron-scheduled transactions. when pg_cron fires a `notify_cron(id)` call, it sends a pg_notify on the `event` channel with `{event: 'cron', id}`. the event service queries `transaction_rule_instance` for the author and role, builds a minimal transaction envelope (`rule_instance_id`, author, author_role, empty `transaction_items`), and queues it to auto-transact. auto-transact forwards to the rule service (which builds transaction items from templates) then to request-create (which persists and settles the transaction with automated approvals)

cron rule instances are seeded by migrations/testseedcron/ (000001_interest for EnergyCo debt, 000002_dividend for EnergyCo equity — both pay 10.000 to JoeCarter every 10 seconds). `make -C migrations cron-up` migrates the cron seed data then runs warm-cache. `make -C migrations cron-down` migrates down

local cron test: `make start` in background for fresh services, then `make -C migrations env ENV=local && make -C migrations cron-up && make -C migrations wait-cron`. verify: `PGPASSWORD=test psql -h localhost -U test -d mxfactorial -c "SELECT t.id, ti.item_id, ti.price, ti.debitor, ti.creditor, t.equilibrium_time FROM transaction t JOIN transaction_item ti ON ti.transaction_id = t.id WHERE ti.item_id IN ('1,000 x 1% monthly interest', 'monthly 10.000 dividend') ORDER BY t.id"`. teardown: `make -C migrations cron-down`

services/event also handles threshold profit accumulation on equilibrium. when a transaction reaches equilibrium, handle_threshold_profit in services/event/src/events/threshold_profit.rs checks if any accounts accumulated profit has reached a configured threshold. flow: postgres equilibrium notification → event service queries accounts in the transaction → checks cache for threshold rules (redis SET key `transaction_rule_instance:threshold:profit:{account}` with members `{rule_instance_id}|{threshold}`) → computes net contribution per account → increments accumulator (redis key `transaction_rule_instance:{id}:accumulator`) → when accumulated >= threshold, builds a transaction payload from transaction_rule_instance and transaction_item_rule_instance tables and sends to auto-transact queue → auto-transact dequeues, forwards to rule service then request-create → dividend transaction reaches equilibrium with all approvals automated by approval_rule_instances

threshold rule instances are seeded by migrations/testseedthresh/000001_dividend.up.sql (GroceryCo, threshold=1000, pays "1% dividend" to JoeCarter). `make -C migrations thresh-up` migrates the seed data then runs warm-cache to SADD the threshold cache key. `make -C migrations thresh-down` migrates down

local threshold test: `make start` in background for fresh services, then `make -C migrations env ENV=local && make -C migrations thresh-up`. start streaming transactions: `make -C migrations insert &`. poll the accumulator: `make -C migrations wait-thresh`. verify dividend transaction: `PGPASSWORD=test psql -h localhost -U test -d mxfactorial -c "SELECT t.id, t.author, ti.item_id, ti.price, ti.debitor, ti.creditor, t.equilibrium_time FROM transaction t JOIN transaction_item ti ON ti.transaction_id = t.id WHERE ti.item_id = '1% dividend'"`. teardown: `pkill -f insert-transactions && make -C migrations thresh-down`

cloud threshold test: requires the ecs-hosted event stack. uncomment `ecs_instance_size` in infra/terraform/aws/environments/dev/main.tf and `terraform apply` from that directory to create the fargate cluster with event and measure services. then: 1) `ENV=dev bash scripts/go-migrate-rds.sh --subdirs schema,seed,testseed,testseedthresh --cmd reset` to reset rds with threshold seed data. 2) invoke warm-cache lambda to populate ddb cache including threshold rules. 3) `bash scripts/insert-transactions.sh --env dev --continue` to insert transactions. 4) poll ddb accumulator: `aws dynamodb get-item --table-name transact-ENVID-dev --key '{"pk":{"S":"transaction_rule_instance:1:accumulator"},"sk":{"S":"_"}}' --region us-east-1 --query 'Item.acc.N' --output text`. 5) after accumulator resets (threshold fired), verify exactly 1 dividend: query rds for `item_id = '1% dividend'`. teardown: `pkill -f insert-transactions`

key files: services/event/src/events/threshold_profit.rs (accumulator + queue.send), services/auto-transact/src/main.rs (queue_worker dequeues and processes), crates/queue/ (redis BRPOP locally, SQS in lambda), crates/cache/src/lib.rs (CacheKey::TransactionRuleInstanceThresholdProfit and TransactionRuleInstanceAccumulator)

client is a sveltekit SSR app. services can be accessed without the client through graphql

maintain and use scripts/test-all.sh for test coverage

`bash scripts/test-reset.sh --set` caches max IDs and initial balance in redis as the test initial db state. `bash scripts/test-reset.sh` restores the db to that initial db state. each make test target calls `--set` before running. if tests fail with wrong IDs, the initial db state was set on a dirty db. fix: `make start` then retest

dont send requests to services while tests are running. services cache postgres prepared statements on pooled connections. `resetdocker` drops and recreates the schema which assigns new OIDs to tables. stale prepared statements on previously used connections then cause services to return incomplete http responses. if services received any requests before a test-triggered DB reset, integration tests will fail with `IncompleteMessage`. fix: `make start` before rerunning tests

cloud infrastructure code is stored in ./infra. only terraform is currently used. devs configure their aws cli with their own aws credentials and build environments in their own accounts. the root makefile includes the make/cloud-env.mk file storing cloud infra commands—read it to learn about them

cloud environments are conventionally created from infra/terraform/aws/environments/init-dev and infra/terraform/aws/environments/dev but users can add `init-stg` & `stg` if they want

lambdas deploy as container images built from docker/*.Dockerfile. each image includes AWS Lambda Web Adapter (`public.ecr.aws/awsguru/aws-lambda-adapter`) which translates lambda events to http requests, so the same axum code runs locally and in lambda without modification

cloud deployment and test scripting is available in .github/workflows with a description available in .github/workflows/README.md

theory meets implementation: services/rule plans the bivector (adds required items, auto-approvals), services/request-create creates it (inserts transaction), services/request-approve completes it (reaches equilibrium). redis, event, measure and graphql then serve as the crystal ball—live streaming gdp event data

transaction.svg visualizes transactions as rotations

project ports start at 10000. print currently assigned ports with `make list-used-ports`. set ports in project.yaml and assign them from project.yaml in bash, make and terraform

use yq -i ... to replace env var get and set blocks in project.yaml for temporary, convenient scripting, eg .github/workflows/warm-cache.yaml temporarily sets dynamodb table env var dependencies to locally test caching

graphql tests can fail while http tests pass when backend lambdas are cold since graphql proxies to them. run `bash scripts/test-availability.sh` first

lambda function URLs need IAM signing. use `scripts/invoke-function-url.sh` or `awscurl` instead of curl

check cloudwatch logs: `aws logs tail /aws/lambda/SERVICE-ENVID-ENV --since 5m --format short`

image tags use `SHORT_GIT_SHA_LENGTH` from project.yaml (default: 7) for git hash length

use yq instead of jq for local json/yaml scripting

`bash scripts/ecr-images.sh --build` triggers codebuild to build+test images remotely. add `--push` to push to ECR, `--deploy` to update lambdas or ecs services (based on `deploy_target` in project.yaml), `--no-test` to skip tests, `--service graphql` to target one service

`bash scripts/ecr-images.sh --integ` runs integration tests in codebuild using pre-built ECR images (test-db, test-cache, test-local, client e2e). requires `--build --push` first

`bash scripts/ecr-images.sh --pull` pulls images from ECR and retags locally

codebuild projects are in infra/terraform/aws/modules/ci/v001. per-service builds in main.tf (sources codebuild module), integ tests in integ.tf (buildspec inlined). ci module is only used by init-dev

buildspecs use runtime config via env vars (RUN_TESTS, PUSH_IMAGE, DEPLOY_LAMBDA, DEPLOY_ECS) set by `--environment-variables-override` in ecr-images.sh

s3 upload to artifacts bucket auto-triggers codepipeline via eventbridge when using `--build --push` without `--service`

say "design" instead of "approach"