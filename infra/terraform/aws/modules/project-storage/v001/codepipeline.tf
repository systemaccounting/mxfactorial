module "codepipeline" {
  source                  = "../../codepipeline/v001"
  env                     = var.env
  env_id                  = var.env_id
  artifacts_bucket_name   = aws_s3_bucket.artifacts.bucket
  artifacts_bucket_arn    = aws_s3_bucket.artifacts.arn
  codebuild_project_names = { for k, v in module.ecr_repos : k => v.codebuild_project_name }
}
