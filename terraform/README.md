# build a new environment

1. `cd terraform/environments/global`  
1. in `terraform/environments/global/main.tf` add, for example, a `stg_certs` module to create ssl certificates for a new `stg` environment (duplicate an existing module in `main.tf`)  
1. add `stg  = "${module.stg_certs.client_cert}"` to `client_cert_map` output in `outputs.tf`, and also  
1. add `stg  = "${module.stg_certs.api_cert}"` to `api_cert_map` output  
1. `terraform init` in `terraform/environments/global` directory to retrieve terraform state for global resources from an [s3 remote backend](https://www.terraform.io/docs/backends/types/s3.html)  
1. `terraform apply` to **create ssl resources**  
1. `cd terraform/environments`  
1. `mkdir stg` in `terraform/environments` to create directory for storing configuration for new `stg` environment  
1. `cd stg`  
1. `mkdir remote-state` to create directory for storing configuration for new s3 bucket serving as a remote backend  
1. `cd remote-state`
1. `touch main.tf` in `terraform/environments/stg/remote-state`  
1. copy contents of `terraform/environments/dev/remote-state/main.tf`, an adjacent environment directory, to new `terraform/environments/stg/remote-state/main.tf`  
1. change `main.tf` values from `dev` to `stg`  
1. `terraform init` in `terraform/environments/stg/remote-state`  
1. `terraform apply` to create s3 remote backend for `stg`  
1. `cd ..` to parent `terraform/environments/stg` directory
1. `touch main.tf outputs.tf variables.tf terraform.tfvars` to create files storing configuration for new `stg` environment  
1. copy contents from identical files in adjacent environment directory such as `terraform/environments/dev`  
1. change `dev` values in files duplicated in `terraform/environments/stg` directory to `stg` values  
1. confirm `environment = "stg"` assignment in `terraform.tfvars`  
1. set desired aws `region` for new `stg` environment in `provider` block of `main.tf`  
1. duplicate desired aws `region` assignment in `terraform.tfvars`  
1. `cd graphql-faas` to temporarily switch to graphql directory to create `lambda.zip` file for terraform  
1. `yarn run cp:lambda`
1. `cd terraform/environments/stg` to return to new `stg` configuration in terraform  
1. `terraform init`  
1. `terraform apply`, expect similar output: `Apply complete! Resources: 56 added, 0 changed, 0 destroyed.` (DNS for new sites require approximately 30 minutes for propagation)  
1. supply outputted values for `cache_id`, `pool_id`, `pool_client_id`, `rds_endpoint`, `api`, etc., to application developers requiring their reference as environment variables, and in configuration objects  
1. `git add . && git commit -m "add stg env" && git push` to commit new infrastructure code to remote  
1. repeat `terraform apply` to update configuration after any future changes in `terraform/modules` and commit changes  

# deploy react to new environment

1. `cd react`  
1. `touch .env.stg`  
1. add `REACT_APP_COGNITO_POOL_ID`, `REACT_APP_COGNITO_CLIENT_ID`, `REACT_APP_API_URL` variables in `.env.stg` file per [usage instructions](https://www.npmjs.com/package/env-cmd#basic-usage)  
1. assign variables in `.env.stg` to recently outputted values from creating `stg` environment in terraform (prefix `https://` to `api` terraform output value for `REACT_APP_API_URL` variable value)
1. add `"stg:e2e": "LOCAL_ENV=stg yarn run test:e2e-public && LOCAL_ENV=stg yarn run test:e2e-private",` to `scripts` object in `react/package.json` for development  
1. in `react/jest-puppeteer.config.js`, add `'stg'` case with `return 'NODE_PATH=./src env-cmd .env.stg react-scripts start'` to `LOCAL_ENV` condition block of `detectEnvironment()`. jest will load the `.env.stg` when executing e2e tests  
1. avoid automated test failure by adding a `JoeSmith` account with password of `password`. test user may be added quickly through temporarily modifying, then exectuting automated test, OR manually:
   > automated: change the following lines in `react/e2e/public/createAccount.test.js`: `await accountNameInput.type(account)` to `await accountNameInput.type('JoeSmith')`, and `await passwordInput.type(`bluesky`)` to `await passwordInput.type('password')`. while client continues serving with `yarn start:stg`, open a separate terminal and execute `yarn run test:e2e-public`. if a test fails, press cntrl+c to terminate because "sign in" test may have occurred before "create account" test. after success, `git checkout e2e/public/createAccount.test.js` to restore automated test to original version  

    > manually: `yarn start:stg` to serve react client on `http://localhost:3000`, then create account  
1. sign into `JoeSmith` account now available from local environment  
1. add `"build:stg": "NODE_PATH=./src env-cmd .env.stg react-scripts build",` to `scripts` object in `react/package.json`  
1. `yarn build:stg`
1. `aws s3 sync build/ s3://mxfactorial-react-stg --delete` to deploy newly-built `stg` client from react/build directory (`--delete` option replaces bucket contents; unnecessary for initial deployment, but presented here for subsequent deployments)  
1. navigate to newly-deployed client in new environment, e.g. stg.mxfactorial.io, and sign in with test user
1. in subsequent deployments, terminate cache after an s3 deployment to expedite new cache, e.g. `aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*" --query 'Invalidation.{Status:Status,CreateTime:CreateTime}'` (replace `$CLOUDFRONT_DISTRIBUTION_ID ` with terraform output value; use query option to limit cloudfront distribution ID output)

    > if authentication fails in react client after subsequent deployments, open browser developer tools:

    > i. navigate to Network and checkmark to Disable cache
    
    > ii. navigate to Application > Service Worker settings, and unregister react client's previously registered service worker

1. to add CI to new environment, [base64 encode](https://support.circleci.com/hc/en-us/articles/360003540393-How-to-insert-files-as-environment-variables-with-Base64) the recently-created `.env.stg` with `base64 -i .env.stg -o out.txt`  
1. add a `STG_REACT_VARS` environment variable in [ci settings](https://circleci.com/gh/systemaccounting/mxfactorial/edit#env-vars), and assign to base64 contents of `out.txt` file created in previous step (exclude new lines when copying)  
1. `rm out.txt` to avoid inclusion in git  
1. in `react/jest-puppeteer.config.js`, add `'stg'` case with `return 'NODE_PATH=./src env-cmd $STG_REACT_VARS react-scripts start'` to `CI_ENV` condition block of `detectEnvironment()`. jest will load `$STG_REACT_VARS` when executing e2e tests 
1. configure continuous integration tool in `.circle/config.yml` to automate execution of build and deployment commands referencing `$STG_REACT_VARS`  


# add git-stored schema to serverless rds
1. `cd liquibase`  
1. `sh batch.sh`  
1. input region when prompted, e.g. `us-east-1`  
1. input environment when prompted, e.g. `stg`  
1. input name for batch job when prompted, e.g. `commit-08e6725` (latest abbreviated commit on remote branch available, for example, from `git log -1 origin/develop --pretty=format:%h`)
1. input branch when prompted, e.g. `develop`
1. input rds endpoint outputted by terraform when creating `stg` environment, e.g. `some-db.cluster-12345678910.us-east-2.rds.amanonaws.com`  
1. input db username when prompted, e.g. `someadmin`  
1. input db password when prompted, e.g. `somepassword`  
1. input liquibase command when prompted, e.g. `updateTestingRollback`  
1. wait for `batch.sh` script exits
1. sign into `stg` environment's dedicated cloud9 instance for direct connetions to `stg` rds instance using `mysql --user=theadmin -h some-db.cluster-12345678910.us-east-2.rds.amanonaws.com -pthepassword`  

# deploy graphql server to new environment

1. a graphql server function initially deploys in terraform since environment creations requires `terraform/environments/common-bin/graphql/lambda.zip`. for subsequent deployments, `cd graphql-faas`
1. add `"update:faas:stg": "aws lambda update-function-code --function-name mxfactorial-graphql-server-stg --zip-file fileb://$(pwd)/lambda.zip --region us-east-1",` to scripts object in `graphql-faas/package.json` (note: new script and function as a service named with `stg` while targeting `us-east-1` region set in Terraform)
1. add `"deploy:stg": "yarn install && yarn run zip && yarn run update:faas:stg",` to scripts object in `graphql-faas/package.json`
1. execute `yarn run deploy:stg` to zip and deploy graphql server function to new environment
1. navigate to newly-deployed api in new environment, e.g. stg-api.mxfactorial.io to view api browsing tool
1. test graphql requests documented in `graphql-faas/test-data`  
1. configure continuous integration tool in `.circle/config.yml` to automate execution of these zip and deployment commands

# tear down environment

1. `cd terraform/environments/stg`
1. `terraform destroy` (cloudfront cache destroy consumes approximately 18 minutes)
1. `cd remote-state` to change directory to `terraform/environments/stg/remote-state`  
1. in `main.tf`, comment in OR add `force_destroy = true` in `aws_s3_bucket` resource, AND
1. comment out OR delete `lifecycle { prevent_destroy = true }` block from `aws_s3_bucket` resource  
1. `terraform apply` to change `aws_s3_bucket` resource configuration - prepares for remote backend destroy to proceed without s3 exception  
1. `terraform destroy`  
1. `cd terraform/environments` to switch current directory to parent directory storing ALL environments  
1. `rm -rf stg` to delete `stg` environment configuration directory  
1. `cd terraform/environments/global`
1. delete the `stg_certs` in `main.tf`  
1. delete `stg  = "${module.stg_certs.client_cert}"` entry in `client_cert_map` output from `outputs.tf`, and also  
1. delete `stg  = "${module.stg_certs.api_cert}"` entry in `api_cert_map` output  
1. `terraform apply` to delete `stg` environment ssl certificates  
1. `git add . && git commit -m "delete stg env" && git push` to commit new infrastructure code to remote  
