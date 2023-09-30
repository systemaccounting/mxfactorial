<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

#### scripts reused in makefiles and workflows for consistency

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

##### `clean-artifact.sh`

deletes `*.zip` files created in app directories

##### `clean-binary.sh`

deletes binaries created in app directories

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

##### `put-object.sh`

puts artifact created in app directory in s3 bucket

##### `set-codecov-flags.sh`

sets custom [CODECOV_FLAGS](https://docs.codecov.com/docs/flags) github workflow environment variable to 1) app or package name, and 2) one standard codecov flag listed in `package.json`

example: `CODECOV_FLAGS=tools,unittest`

##### `update-function.sh`

deploys lambda function from s3 object created by `put-object.sh`

##### `zip-executable.sh`

adds binaries and shell scripts to `*.zip` files for deployment in app directories

##### `insert-transactions.sh`

adds a mix of requests and transactions in docker postgres (requires `cd migrations && make run`)

1. `cd migrations && make insert`
1. drops and up migrates postgres in docker
1. inserts requests from `pkg/testdata/requests.json` using `services/request-create`
1. converts every other request into a transaction using `services/request-approve`


##### `dump-db.sh`

dumps postgres db to path passed as parameter, e.g. `bash scripts/dump-db.sh --path migrations/dumps/testseed.sql`

##### `restore-db.sh`

restores postgres db from path passed as parameter

##### `shared-error.sh`

script sourced to standardize error handling in other scripts

##### `mock-go-ifaces.sh`

creates go mocks from list of interfaces inside `mock` subdirectory using [gomock](https://github.com/golang/mock) and `project.yaml` assignments

`//go:generate mockgen...` not used, script and `project.yaml` preferred for convenient interface use and mock coverage audit

1. set `.pkgs.lambdapg.mocked_interfaces` property under package or service in `project.yaml` to map of go package import paths and desired list of interfaces:

    ```json5
    "mocked_interfaces": {
        "github.com/systemaccounting/mxfactorial/pkg/lambdapg": [
            "Connector",
            "SQLDB"
        ],
        "github.com/jackc/pgx/v4": [
            "Rows"
        ]
    }
    ```
1. `make -C './pkg/lambdapg' mock`

creates:
```
pkg/lambdapg/lambdapg_mock/lambdapg_mock.go
pkg/lambdapg/lambdapg_mock/v4_mock.go
```

##### `create-accounts.sh`

creates testseed migration accounts in cognito

##### `delete-accounts.sh`

deletes testseed migration accounts from cognito

##### `sum-value.sh`

sums value in json `transaction_item` list

##### `save-id-token.sh`

references a manually entered `USERNAME` and `PASSWWORD` assignment in a `.env` file, requests an id token from cognito, then saves the `ID_TOKEN` in the `.env` file

##### `print-id-token.sh`

prints cognito user id token for convenient testing

##### `get-notifications.sh`

gets pending notifications from websocket endpoint

##### `clear-notifications.sh`

clears (deletes) pending notifications through websocket endpoint

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

##### `delete-lambda-layers.sh`

deletes lambda layer versions created by `build-dev-env.sh`

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

prints env id stored in `infrastructure/terraform/env-id/terraform.tfstate`

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