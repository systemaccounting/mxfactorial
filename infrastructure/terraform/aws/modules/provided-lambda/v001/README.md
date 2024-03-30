<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

#### provided runtime lambda terraform module

use:
1. assign `var.artifacts_bucket_name` a name to deploy from an s3 bucket
1. assign `var.artifacts_bucket_name` to null and add an `aws_ecr_repository` resource to `infrastructure/terraform/aws/modules/project-storage/v001/ecr.tf` to deploy from a docker image repository
1. assign `var.aws_lwa_port` a unique project application port* to enable the [lambda web adapter](https://github.com/awslabs/aws-lambda-web-adapter)

examples:
1. `infrastructure/terraform/aws/modules/environment/v001/lambda-services.tf`
1. `infrastructure/terraform/aws/modules/environment/v001/go-migrate.tf`

\* `project.yaml` env vars with _PORT suffixes are assigned unique port numbers