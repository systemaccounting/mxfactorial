<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### project-storage

resources provisioned in init-dev for dev environment

#### ENV_ID

assigned in `.env` at project root

#### naming conventions

- `infra/terraform/aws/modules/project-storage/v001/s3.tf`
- `infra/terraform/aws/modules/project-storage/v001/codepipeline.tf`
- `infra/terraform/aws/modules/project-storage/v001/integ.tf`
- `infra/terraform/aws/modules/ecr/v001/ecr.tf`
- `infra/terraform/aws/modules/ecr/v001/codebuild.tf`
- `infra/terraform/aws/modules/codebuild/v001/codebuild.tf`
- `infra/terraform/aws/modules/codepipeline/v001/codepipeline.tf`

#### manual deletion

when `terraform destroy` fails, delete in order:

1. codepipeline
1. eventbridge rule + target
1. codebuild projects (integ + 13 per-service)
1. ecr repos
1. s3 buckets (artifacts, tfstate)
1. iam roles + policies

#### state list

```
module.project_storage_dev.aws_s3_bucket.artifacts
module.project_storage_dev.aws_s3_bucket.tfstate
module.project_storage_dev.aws_s3_bucket_notification.artifacts_eventbridge
module.project_storage_dev.aws_s3_bucket_versioning.artifacts

module.project_storage_dev.aws_codebuild_project.integ
module.project_storage_dev.aws_iam_role.integ
module.project_storage_dev.aws_iam_role_policy.integ

module.project_storage_dev.module.codepipeline.aws_codepipeline.build
module.project_storage_dev.module.codepipeline.aws_cloudwatch_event_rule.s3_trigger
module.project_storage_dev.module.codepipeline.aws_cloudwatch_event_target.codepipeline
module.project_storage_dev.module.codepipeline.aws_iam_role.codepipeline
module.project_storage_dev.module.codepipeline.aws_iam_role.eventbridge_pipeline
module.project_storage_dev.module.codepipeline.aws_iam_role_policy.codepipeline
module.project_storage_dev.module.codepipeline.aws_iam_role_policy.eventbridge_pipeline

module.project_storage_dev.module.ecr_repos["auto-confirm"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["auto-confirm"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["auto-confirm"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["auto-confirm"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["auto-confirm"].module.codebuild.aws_iam_role_policy.codebuild

module.project_storage_dev.module.ecr_repos["balance-by-account"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["balance-by-account"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["balance-by-account"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["balance-by-account"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["balance-by-account"].module.codebuild.aws_iam_role_policy.codebuild

module.project_storage_dev.module.ecr_repos["client"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["client"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["client"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["client"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["client"].module.codebuild.aws_iam_role_policy.codebuild

module.project_storage_dev.module.ecr_repos["go-migrate"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["go-migrate"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["go-migrate"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["go-migrate"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["go-migrate"].module.codebuild.aws_iam_role_policy.codebuild

module.project_storage_dev.module.ecr_repos["graphql"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["graphql"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["graphql"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["graphql"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["graphql"].module.codebuild.aws_iam_role_policy.codebuild

module.project_storage_dev.module.ecr_repos["request-approve"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["request-approve"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["request-approve"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["request-approve"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["request-approve"].module.codebuild.aws_iam_role_policy.codebuild

module.project_storage_dev.module.ecr_repos["request-by-id"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["request-by-id"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["request-by-id"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["request-by-id"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["request-by-id"].module.codebuild.aws_iam_role_policy.codebuild

module.project_storage_dev.module.ecr_repos["request-create"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["request-create"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["request-create"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["request-create"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["request-create"].module.codebuild.aws_iam_role_policy.codebuild

module.project_storage_dev.module.ecr_repos["requests-by-account"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["requests-by-account"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["requests-by-account"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["requests-by-account"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["requests-by-account"].module.codebuild.aws_iam_role_policy.codebuild

module.project_storage_dev.module.ecr_repos["rule"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["rule"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["rule"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["rule"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["rule"].module.codebuild.aws_iam_role_policy.codebuild

module.project_storage_dev.module.ecr_repos["transaction-by-id"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["transaction-by-id"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["transaction-by-id"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["transaction-by-id"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["transaction-by-id"].module.codebuild.aws_iam_role_policy.codebuild

module.project_storage_dev.module.ecr_repos["transactions-by-account"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["transactions-by-account"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["transactions-by-account"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["transactions-by-account"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["transactions-by-account"].module.codebuild.aws_iam_role_policy.codebuild

module.project_storage_dev.module.ecr_repos["warm-cache"].aws_ecr_repository.default
module.project_storage_dev.module.ecr_repos["warm-cache"].aws_ecr_lifecycle_policy.default
module.project_storage_dev.module.ecr_repos["warm-cache"].module.codebuild.aws_codebuild_project.default
module.project_storage_dev.module.ecr_repos["warm-cache"].module.codebuild.aws_iam_role.codebuild
module.project_storage_dev.module.ecr_repos["warm-cache"].module.codebuild.aws_iam_role_policy.codebuild
```
