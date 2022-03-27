<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

#### scripts reused in makefiles and workflows for consistency

add and edit by assigning variables from root `project.json` to avoid reconciling terraform variable assignments

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

##### `create-env.sh`

loops through an apps `secrets` in `project.json`, gets each secret value with [aws secretsmanager get-secret-value](https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/get-secret-value.html), and creates a `.env` file in the app directory

##### `deploy-all.sh`

builds, zips and deploys each app from a loop through directories listed in root `inventory` file

##### `download-go-mod.sh`

downloads module dependencies

##### `invoke-function.sh`

invokes app lambdas locally from app directories with [aws lambda invoke](https://docs.aws.amazon.com/cli/latest/reference/lambda/invoke.html)

##### `list-changed-pkgs.sh`

lists packages requiring test coverage by an internal package code change

1. accepts an internal package name as an argument
1. recursively loops through `services/gopkg` directories finding files importing the internal package
1. creates a bash array of other internal packages importing it

example:
```sh
bash scripts/list-changed-pkgs.sh --pkg-name tools --debug

IMPORTING_PKG_DIRS: 5
services/gopkg/lambdapg
services/gopkg/request
services/gopkg/notify
services/gopkg/websocket
services/gopkg/data
```

go packages were hastily written to import one another initially

list size will decrease as imports are switched to executable command packages

##### `list-changed-svcs.sh`

lists services requiring test coverage by an internal package code change

1. accepts an internal package name as an argument
1. sources `list-changed-pkgs.sh` to create a bash array of other internal packages importing it
1. loops through `package.json` app directories finding files importing all internal packages affected by package code change
1. creates a bash array of services affected by go package change

example:
```sh
bash scripts/list-changed-svcs.sh --pkg-name tools --debug

CHANGED_SVCS: 12
services/request-create
services/request-approve
services/request-by-id
services/requests-by-account
services/transaction-by-id
services/transactions-by-account
services/notifications-send
services/notifications-get
services/notifications-clear
services/balance-by-account
services/wss-connect
services/auto-confirm
```

##### `list-dependent-svcs.sh`

lists services requiring test coverage by service code change

1. accepts a service (app) name as an argument
1. recursively loops through `package.json` app `dependents`
1. creates a bash array of other services affected by service change

example:
```sh
bash scripts/list-dependent-svcs.sh --app-name graphql --recursive --debug

DEPENDENT_SVCS: 9
request-create
request-approve
rules
request-by-id
requests-by-account
transaction-by-id
transactions-by-account
balance-by-account
client
```

##### `put-object.sh`

puts artifact created in app directory in s3 bucket

##### `remove-pending-test.sh`

removes a package from `PendingTests` dynamodb item after test (see `set-pending-tests.sh`)

example:

1. `PendingTests` before
```json
[
  "data",
  "lambdapg",
  "notify",
  "request",
  "websocket"
]
```


2. 

```sh
bash scripts/remove-pending-test.sh \
		--app-or-pkg-name lambdapg \
		--sha 386e152bfb3d98830864775f43c08ed95f5e2ad9 \
		--region us-east-1 \
		--env dev
```

3. `PendingTests` after
```json
[
  "data",
  "notify",
  "request",
  "websocket"
]
```

##### `set-codecov-flags.sh`

sets custom [CODECOV_FLAGS](https://docs.codecov.com/docs/flags) github workflow environment variable to 1) app or package name, and 2) one standard codecov flag listed in `package.json`

example: `CODECOV_FLAGS=tools,unittest`

##### `set-intra-pkg-deps.sh`

sets package dependents in `package.json`

1. accepts an internal package name as an argument
1. sources `list-changed-pkgs.sh` to create a bash array of other internal packages importing it
1. sets package `dependents` in `package.json`

example:

1. `package.json` before:
```
"lambdapg": {
            "runtime": "go1.x",
            "path": "services/gopkg/lambdapg",
            "dependents": []
        }
```
2. `bash scripts/set-intra-pkg-deps.sh --pkg-name lambdapg`
3. `package.json` after:
```
"lambdapg": {
            "runtime": "go1.x",
            "path": "services/gopkg/lambdapg",
            "dependents": [
                "notify",
                "websocket",
                "request",
                "data"
            ]
        }
```

##### `set-pending-tests.sh`

automates detecting the absence of test coverage by creating `PendingTests` from `list-changed-pkgs.sh` or `list-changed-svcs.sh`, and replaces verbose [job outputs](https://docs.github.com/en/actions/using-jobs/defining-outputs-for-jobs) feature with dynamodb table

1. accepts as arguments:
    1. name of app or internal package
    1. git sha
    1. aws region
    1. environment
1. sources `list-changed-pkgs.sh` or `list-changed-svcs.sh` to create a bash array of affected directories
1. adds a `PendingTests` [string set](https://github.com/awsdocs/amazon-dynamodb-developer-guide/blob/master/doc_source/HowItWorks.NamingRulesDataTypes.md#sets) to `github-workflows-$ENV` dynamodb table with [aws dynamodb put-item](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/put-item.html)

example:
```sh
bash scripts/set-pending-tests.sh \
    --app-or-pkg-name tools \
    --sha 386e152bfb3d98830864775f43c08ed95f5e2ad9 \
    --region us-east-1 \
    --env dev
```

<img width="519" alt="dynamodb-ss" src="https://user-images.githubusercontent.com/12200465/160259978-27b2dfa4-f88d-459d-a48d-25407af3600e.png">

##### `test-zero-pending-tests.sh`

avoids assuming comprehensive test coverage by github workflows

tests 0 script-generated `PendingTests` in `github-workflows-$ENV` dynamodb table item (see `set-pending-tests.sh`) after parallel workflows finish

example:
```sh
bash scripts/test-zero-pending-tests.sh \
		--sha 386e152bfb3d98830864775f43c08ed95f5e2ad9 \
		--region us-east-1 \
		--env dev
```

<img width="1131" alt="go-pkg-workflow" src="https://user-images.githubusercontent.com/12200465/160260920-5b94809a-5240-4f69-a1a3-097074163975.png">

##### `update-function.sh`

deploys lambda function from s3 object created by `put-object.sh`

##### `zip-executable.sh`

adds binaries and shell scripts to `*.zip` files for deployment in app directories