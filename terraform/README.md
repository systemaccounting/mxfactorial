# build a new environment
1. `cd terraform/global`
1. add, for example, `stg` to `environments` list in `terraform/global/variables.tf`
1. `terraform init` which retrieves state for a single-workspace conifguration
1. `terraform apply`, and if ["diffs didn't match during apply"](https://github.com/hashicorp/terraform/issues/19331) error occurs for the `aws_route53_record` resource, `terraform apply` again per [comment 19331](https://github.com/hashicorp/terraform/issues/19331#issue-379115920) and wait approximately 5-10 minutes to complete
1. `cd terraform/workspaces`
1. `terraform init` because this directory stores a separate, multi-workspace configuration
1. `terraform workspace new stg` to create state and switch to new `stg` workspace
1. add, for example, `stg = "us-west-2"` to `region` map in `variables.tf` to isolate resources per region; avoid naming conflicts (e.g. `transactions` dynamo db table may be duplicated between regions)
1. pass new ssl cert for example `stg` client:  in `terraform/workspaces/variables.tf`, add `stg  = "${data.terraform_remote_state.global.client_certs[2]}"` to `triggers` property of `null_resource.client_cert_arns` resource. example `stg` requires occupying `[2]` index since it's listed as 3rd environment in `terraform/global/variables.tf`
1. pass new ssl cert for example `stg` api:  in `terraform/workspaces/variables.tf`, add `stg  = "${data.terraform_remote_state.global.api_certs[2]}"` to `triggers` property of `null_resource.client_cert_arns` resource. again, example `stg` requires occupying `[2]` index since it's listed as 3rd environment in `terraform/global/variables.tf`
1. `terraform apply` and wait until complete
1. supply new outputted values for `pool_id`, `pool_client_id`, etc., to application developers requiring their reference in environement variables and configuration objects (DNS for new sites require approximately 30 minutes for propagation)
1. `terraform workspace select prod`
1. `terraform apply` to achieve state parity with new example `stg` workspace
1. repeat previous 2 steps for any other environments

# deploy react to new environment
1. `cd react`
1. add new environment values outputted from terraform into `react/.env.development.local`
1. `yarn start`
1. navigate to the react client on http://localhost:3000 in a browser, and create a `JoeSmith` account with password of `password` to avoid end-to-end test failure. OR, create the `JoeSmith` account using an automated test by temporarily changing the following lines in `react/e2e/public/createAccount.test.js`: `await accountNameInput.type(account)` to `await accountNameInput.type('JoeSmith')`, and `await passwordInput.type(`bluesky`)` to `await passwordInput.type('password')`. while client continues serving with `yarn start`, open a separate terminal and execute `yarn run test:e2e-public`. if a test fails, press cntrl+c to terminate because "sign in" test may have occurred before "create account" test. `git checkout e2e/public/createAccount.test.js` to restore automated test to original version. sign into `JoeSmith` account now available in local environment.
1. build react client with new environment values outputted from terraform, e.g. `NODE_PATH=./src REACT_APP_COGNITO_POOL_ID=$REACT_APP_COGNITO_POOL_ID_STG REACT_APP_COGNITO_CLIENT_ID=$REACT_APP_COGNITO_CLIENT_ID_STG node node_modules/react-scripts/scripts/build.js`
1. `aws s3 sync build/ s3://mxfactorial-react-stg --delete` to deploy newly-built client from react/build
1. navigate to newly-deployed client in new environment, e.g. stg.mxfactorial.io, and sign in with test user
1. in subsequent deployments, terminate cache after an s3 deployment to expedite new cache, e.g. `aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*" --query 'Invalidation.{Status:Status,CreateTime:CreateTime}` (use query option to limit cloudfront distribution ID output)
1. add new environment values to continuous integration tool
1. configure continuous integration tool in `.circle/config.yml` to automate execution of these build and deployment commands

# deploy graphql server to new environment
1. `cd graphql-faas`
1. add `"update:faas:stg": "aws lambda update-function-code --function-name mxfactorial-graphql-server-stg --zip-file fileb://$(pwd)/lambda.zip --region us-west-2",` to scripts object in `graphql-faas/package.json` (note new script and function as a service named with `stg` while targeting `us-west-2` region set in Terraform)
1. add `"deploy:stg": "yarn run zip && yarn run update:faas:stg",` to scripts object in `graphql-faas/package.json`
1. execute `yarn run deploy:stg` to zip and deploy graphql server function to new environment
1. navigate to newly-deployed api in new environment, e.g. stg-api.mxfactorial.io to view api browsing tool
1. configure continuous integration tool in `.circle/config.yml` to automate execution of these zip and deployment commands