# build a new environment
1. `cd terraform/global`
1. add, for example, `stg` to `environments` list in `terraform/global/variables.tf`
1. `terraform init` which retrieves state for a single-workspace conifguration
1. `terraform apply` and wait until complete
1. `cd terraform/workspaces`
1. `terraform init` because this directory stores a separate, multi-workspace configuration
1. `terraform workspace new stg` to create state and switch to new `stg` workspace
1. add, for example, `stg = "us-west-2"` to `region` map in `variables.tf` to isolate resources per region; avoid naming conflicts (e.g. `transactions` dynamo db table may be duplicated between regions)
1. pass new ssl cert for example `stg` client:  in `terraform/workspaces/variables.tf`, add `stg  = "${data.terraform_remote_state.global.client_certs[2]}"` to `triggers` property of `null_resource.client_cert_arns` resource. example `stg` requires occupying `[2]` index since it's listed as 3rd environment in `terraform/global/variables.tf`
1. pass new ssl cert for example `stg` api:  in `terraform/workspaces/variables.tf`, add `stg  = "${data.terraform_remote_state.global.api_certs[2]}"` to `triggers` property of `null_resource.client_cert_arns` resource. again, example `stg` requires occupying `[2]` index since it's listed as 3rd environment in `terraform/global/variables.tf`
1. `terraform apply` and wait until complete
1. `terraform workspace select prod`
1. `terraform apply` to achieve state parity with new example `stg` workspace
1. repeat previous 2 steps for any other environments