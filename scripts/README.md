<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

##### scripts reused in makefiles and workflows for consistency

add and edit by assigning variables from root `project.yaml` to avoid reconciling variable assignments in terraform and elsewhere, for example:

`project.yaml`
```yaml
infrastructure:
  terraform:
    aws:
      modules:
        project-storage:
          env_var:
            set:
              ARTIFACTS_BUCKET_PREFIX:
                default: mxfactorial-artifacts
```

`infrastructure/terraform/aws/environments/prod/main.tf`
```
ARTIFACTS_BUCKET_PREFIX = jsondecode(file("../../../../../project.yaml")).infrastructure.terraform.aws.modules.project-storage.env_var.set.ARTIFACTS_BUCKET_PREFIX.default
```

`scripts/put-object.sh`
```sh
ARTIFACTS_BUCKET_PREFIX=$(yq ".infrastructure.terraform.aws.modules["project-storage"].env_var.set.ARTIFACTS_BUCKET_PREFIX.default" project.yaml)
```

\*scripts assume **project root** as initial current working directory

---

##### `clean-env.sh`

deletes `.env` files created in app directories

##### `clean-invoke-log.sh`

deletes `invoke.log` files created in app directories by local [aws lambda invoke](https://docs.aws.amazon.com/cli/latest/reference/lambda/invoke.html)

##### `compile-go-linux.sh`

compiles linux binaries for lambda in app directories with `go build` command

##### `create-env-file.sh`

loops through an apps `secrets` in `project.yaml`, gets each secret value with [aws secretsmanager get-secret-value](https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/get-secret-value.html), and creates a `.env` file in the app directory

##### `create-inventory.sh`

reads `project.yaml` and writes list of apps and libraries to project root as `inventory` plain text file

##### `deploy-all.sh`

builds, zips and deploys each app from a loop through directories listed in root `inventory` file

##### `dir-to-conf-path.sh`

prints `services["request-create"]` when passed `services/request-create` for use in `yq`

##### `download-go-mod.sh`

downloads module dependencies

##### `invoke-function.sh`

invokes app lambdas locally from app directories with [aws lambda invoke](https://docs.aws.amazon.com/cli/latest/reference/lambda/invoke.html)

##### `list-conf-paths.sh`

lists yaml paths for apps in libs in `project.yaml` for use in `yq`, e.g. `services["request-create"]`

##### `list-dir-paths.sh`

lists apps and libs in `project.yaml`, e.g. `services/request-create`

##### `list-env-vars.sh`

prints list of environment variables set in `project.yaml`

##### `set-codecov-flags.sh`

sets custom [CODECOV_FLAGS](https://docs.codecov.com/docs/flags) github workflow environment variable to 1) app or package name, and 2) one standard codecov flag listed in `package.json`

example: `CODECOV_FLAGS=tools,unittest`

##### `insert-transactions.sh`

adds a mix of requests and transactions in docker postgres (requires `cd migrations && make run`)

1. `cd migrations && make insert`
1. drops and up migrates postgres in docker
1. inserts requests from `tests/testdata/requests.json` using `services/request-create`
1. converts every other request into a transaction using `services/request-approve`

##### `dump-db.sh`

dumps postgres db to path passed as parameter, e.g. `bash scripts/dump-db.sh --path migrations/dumps/testseed.sql`

##### `restore-db.sh`

restores postgres db from path passed as parameter

##### `shared-error.sh`

script sourced to standardize error handling in other scripts

##### `create-accounts.sh`

creates testseed migration accounts in cognito

##### `delete-accounts.sh`

deletes testseed migration accounts from cognito

##### `sum-value.sh`

sums value in json `transaction_item` list

##### `print-id-token.sh`

prints cognito user id token for convenient testing

##### `create-all-env-files.sh`

loops through `project.yaml` apps and creates `.env` files in each directory requring secrets fetched from systems manager parameter store

##### `manage-rds.sh`

starts and stops an rds instance

##### `build-dev-env.sh`

builds a dev environment in aws

##### `delete-dev-env.sh`

deletes dev environment in aws

##### `configure-aws-build.sh`

configures machine with aws credentials, then builds a dev environment in aws

##### `manage-gitpod-iam.sh`

creates and deletes an aws iam user for gitpod

##### `terraform-init-dev.sh`

inits terraform state for dev envs

##### `set-custom-env-id.sh`

creates then sets custom env id to enable access to dev env from multiple workspaces

##### `delete-dev-storage.sh`

deletes storage for cloud dev environment with aws cli instead of terraform when state file not found, e.g. cloud dev env storage was created on different machine

##### `list-lambdas.sh`

lists lambdas created by terraform

##### `compose.sh`

creates systemaccounting services with docker compose

##### `invoke-function-url.sh`

invokes [lambda function urls](https://docs.aws.amazon.com/lambda/latest/dg/urls-invocation.html)

##### `rebuild-service.sh`

rebuilds image and container for docker compose service

##### `bootcamp.sh`

trains user on commands, services and tests

##### `set-uri-vars.sh`

sets `CLIENT_URI`, `GRAPHQL_URI` and `B64_GRAPHQL_URI` vars when sourced in other scripts

##### `rebuild-client-image.sh`

rebuilds client image when the `B64_GRAPHQL_URI` var requires setting by a new devcontainer (gitpod, codespaces)

##### `post-create-cmd.sh`

runs as [postCreateCommand](https://containers.dev/implementors/json_reference/) in devcontainer

##### `post-rules.sh`

sends a `bottled water` transaction item in a POST request to a locally running rule service

##### `print-env-id.sh`

prints env id stored in project root `.env` file

##### `encode-client-env.sh`

base64 encodes client .env file

##### `start-local.sh`

starts transaction related services locally with restarts on file changes. logs written to nohup.out

##### `stop-local.sh`

stops services started by start-local.sh

##### `manage-cde-ports.sh`

sourced in other scripts. declares functions to publish and disable ports in cloud development environments (codespace, gitpod)

##### `restart-local.sh`

restarts services locally if not all services started

##### `list-pids.sh`

print list of pids and apps

##### `print-value.sh`

print the value of an `env-var` in `project.yaml`

##### `post-go-migrate.sh`

send a http request to the internal `migrations/go-migrate` tool

##### `auth-ecr.sh`

authenticate with ecr

##### `push-ecr-image.sh`

push docker image to ecr repo

##### `update-function-image.sh`

update lambda with latest ecr repository image

##### `import-tf-init-env.sh`

imports resources into the `infrastructure/terraform/aws/environments/init-$ENV`terraform configuration files

##### `rust-coverage.sh`

prints rust crate test coverage

##### `print-lambda-policy.sh`

prints policy attached to lambda function

##### `print-ecr-repo-uri.sh`

prints uri of ecr repo

##### `print-image-tag.sh`

prints service image tag with ecr repo uri and current git sha added as tag version

##### `delete-ecr-repos.sh`

convenience script to delete all dev ecr repos

##### `push-dev-image.sh`

pushes local docker image to dev ecr repo (assumes local image already tagged)

##### `deploy-dev-image.sh`

deploys "last" dev ecr image to lambda function. "latest" tag convention not used in ecr image tagging

##### `tag-merge-commit.sh`

1. gets tag from image deployed to lambda
1. gets tag(s) from last image pushed to ecr (ecr images may have multiple tags)
1. tests if currently deployed lambda image tag matches any tag belonging to last imaged pushed to ecr
1. tags last ecr image with merge commit sha if last ecr image tag is NOT matched with currently deployed function image tag, OR
1. exits before tagging last ecr image tag with merge commit sha if last ecr image tag IS matched with currently deployed function image tag (avoids retagging)

##### `deploy-last-image.sh`

1. gets tag from image deployed to lambda
1. gets tags from last image pushed to ecr (ecr images may have multiple tags)
1. tests currently deployed lambda image tag matches any tag belonging to last imaged pushed to ecr
1. deploys last ecr image if last ecr image tag is NOT matched with currently deployed function image tag, OR
1. exits before deploying if last ecr image tag IS matched with currently deployed function image tag (avoids redeploying)

##### `push-prod-image.sh`
used in integration test workflow after cloud integration tests pass
1. tests if current dev image tagged with merge commit
1. adds prod tag if current dev image tagged with merge commit, then pushes to prod ecr
1. exits if current dev image NOT tagged with merge commit (prod image not tagged and pushed)

##### `build-image-job.sh`

used in `.github/workflows/build-all-images.yaml` to copy zipped code from s3, then build, tag and push service images to github container registry

##### `zip-services.sh`

adds services to zip file. used by `scripts/build-all-images.sh` before triggering `.github/workflows/build-all-images.yaml`

##### `build-all-images.sh`
zips and pushes current service code to s3, then triggers `.github/workflows/build-all-images.yaml` to avoid building almost a dozen rust images locally

##### `pull-all-images.sh`
pulls images built and pushed by `.github/workflows/build-all-images.yaml`

##### `deploy-all-images.sh`
zips and pushes current service code to s3, then triggers `.github/workflows/deploy-all-images.yaml` to build and deploy services to lambda

##### `create-env-id.sh`
adds a [$RANDOM](https://tldp.org/LDP/abs/html/randomvar.html) `ENV_ID` variable the `.env` file in project root. the `ENV_ID` variable is used by terraform to provision cloud development environments matched to a developers local machine

##### `delete-env-id.sh`
deletes the `ENV_ID` variable from `.env` in project root

##### `delete-api-log-perms.sh`
deletes the api gateway logging permissions added in `infrastructure/terraform/aws/environments/region/main.tf`

##### `enable-pg-notice.sh`
sets [log_min_messages](https://www.postgresql.org/docs/current/runtime-config-logging.html#RUNTIME-CONFIG-LOGGING-WHEN) to notice in docker postgres

##### `start-stop-redis.sh`
starts and stops redis in docker compose

##### `watch-redis-key.sh`
watches a redis key in docker