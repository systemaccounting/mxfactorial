data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

module "ecr_repos" {
  for_each                = local.ECR_REPOS
  source                  = "../../ecr/v001"
  max_image_storage_count = var.max_image_storage_count
  env                     = var.env
  env_id                  = var.env_id
  service_name            = each.value
  force_delete            = var.force_destroy_storage
  artifacts_bucket_arn    = aws_s3_bucket.artifacts.arn
  aws_region              = data.aws_region.current.id
  aws_account_id          = data.aws_caller_identity.current.account_id
  codebuild_compute_type  = var.codebuild_compute_type
}
