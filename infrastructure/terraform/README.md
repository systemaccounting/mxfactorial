<p align="center">
  <a href="http://www.systemaccounting.org/math_identity" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

## build environment

**ssl certs and artifact storage**  
1. `cd infrastructure/terraform/aws/environments/us-east-1`  
1. in `infrastructure/terraform/aws/environments/us-east-1/certs-and-s3.tf` duplicate an existing `*_certs_and_artifact_storage` module and change environment name prefix to, for example, `stg`. also add `stg` to environment property:  
    ```
    module "stg_certs_and_artifact_storage" {
      source      = "../../modules/us-east-1"
      environment = "stg"
    }
    ```
1. add `stg  = module.stg_certs_and_artifact_storage.client_cert` to `client_cert_map` output in `outputs.tf`, and also  
1. add `stg  = module.stg_certs_and_artifact_storage.api_cert` to `api_cert_map` output  
1. `terraform init` in `infrastructure/terraform/aws/environments/us-east-1` directory to retrieve terraform state for shared us-east-1 resources from the [remote backend](https://www.terraform.io/docs/backends/types/remote.html)  
1. `terraform apply` to **create ssl and s3 artifact storage resources** in us-east-1  
1. `cd ../../../../..` to project root  
1. confirm `node --version # returns >= v12.9.1`  
1. confirm `yarn --version # returns >= 1.19.1`  
1. confirm `python3 --version # returns >= 3.7.0`  
1. confirm `go version # returns >= go1.13.3`  
1. confirm `aws --version # returns >= aws-cli/1.16.168`  
1. `make deploy ENV=stg` to deploy all service artifacts  

**environment**  
1. `cd infrastructure/terraform/aws/environments`  
1. `mkdir stg` to create directory for storing configuration for new `stg` environment  
1. `cd stg`  
1. `touch main.tf outputs.tf variables.tf terraform.tfvars` to create files storing configuration for new `stg` environment  
1. copy contents from identical files in adjacent environment directory such as `../dev`  
1. change `dev` values in files duplicated in `terraform/environments/stg` directory to `stg` values  
1. confirm `environment = "stg"` assignment in `terraform.tfvars` **AND** search each new file for remaining `dev` vars  
1. set desired aws `region` for new `stg` environment in `provider` block of `main.tf`  
1. duplicate aws `region` assignment in `terraform.tfvars`  
1. `terraform init`  in `stg` directory to create workspace in app.terraform.io  
1. disable "Remote" Execution mode under Settings / General in app.terraform.io  
1. `terraform apply`, expect similar output: `Apply complete! Resources: 125 added, 0 changed, 0 destroyed.` (DNS for new sites require approximately 30 minutes for propagation)  
1. note outputted values such as `postgres_address` for independent access of resources  
1. `git add . && git commit -m "add stg env" && git push` to commit new infrastructure code to origin  
1. repeat `terraform apply` to update configuration after any future changes in `infrastructure/terraform/aws/modules/environment` and commit changes  

**add git-stored schema to postgres**
1. `cd schema`  
1. `bash schema.sh`  
1. input region when prompted, e.g. `us-east-1`  
1. input environment when prompted, e.g. `stg`  
1. input branch name, e.g. `develop`  
1. sign into `stg` environment's dedicated cloud9 instance for direct connetions to `stg` postgres instance  
1. `sudo yum update && sudo yum install postgresql`  
1. `PGPASSWORD=replace_with_password psql -h host -p 5432 -U replace_with_user mxfactorial` to access postgres  

**init rule-instance**
1. `cd services/rules-faas`  
1. `make init-rules ENV=stg` to add transaction rules  

**deploy react to new environment**  

1. `cd react`  
1. `make build ENV=stg`  
1. `make deploy ENV=stg`  
1. `make create-accounts ENV=stg` to create test accounts for automated and manual testing  
1. after DNS propagation, navigate to newly-deployed client in new environment, e.g. stg.mxfactorial.io, and sign in with test user  
1. `make test-e2e ENV=stg` to test service and client 
1. optionally add `*.yaml` in `.github/workflows` to configure automated build, test and deployment   

**manually test services**  
1. sign into `stg.mxfactorial.io` in browser  
1. open developer tools, select "Application" tab, then "Local Storage" subtab (left side), then stg.mxfactorial.io  
1. copy cognito idToken  
1. install Modheader in chrome browser to manually configure `Authorization` header  
1. add `Authorization: $idToken` to installed Modheader in chrome browser  
1. navigate to newly-deployed api in new environment, e.g. stg-api.mxfactorial.io to view api browsing tool  
1. test graphql requests documented in `graphql-faas/test-data`  

**tear down environment**  

1. `cd infrastructure/terraform/aws/environments/stg`  
1. `terraform destroy` (cloudfront cache destroy consumes approximately 18 minutes)
1.  navigate to console in browser, and delete all objects in `mxfactorial-artifacts-stg` **AND** `mxfactorial-websocket-artifacts-stg` s3 buckets  
1. `cd infrastructure/terraform/aws/environments/us-east-1`  
1. delete `stg_certs_and_artifact_storage` in `certs-and-s3.tf`  
1. delete `stg  = module.stg_certs_and_artifact_storage.client_cert` entry in `client_cert_map` output from `outputs.tf`, and also  
1. delete `stg  = module.stg_certs_and_artifact_storage.api_cert` entry in `api_cert_map` output  
1. `terraform apply` to delete `stg` environment ssl certificates and artifact buckets  
1. delete workspace in app.terraform.io
1. `git add . && git commit -m "delete stg env" && git push` to commit new infrastructure code to remote  
