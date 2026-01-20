locals {
  ID_ENV = "${var.env_id}-${var.env}"
}

module "codebuild" {
  source = "../../codebuild/v001"

  project_name         = "mxfactorial-${var.service_name}-${local.ID_ENV}"
  service_name         = var.service_name
  env                  = var.env
  env_id               = var.env_id
  aws_region           = var.aws_region
  aws_account_id       = var.aws_account_id
  compute_type         = var.codebuild_compute_type
  buildspec            = file("${path.module}/buildspecs/build.yaml")
  artifacts_bucket_arn = var.artifacts_bucket_arn
  ecr_repository_arn   = aws_ecr_repository.default.arn
  lambda_function_arn  = "arn:aws:lambda:${var.aws_region}:${var.aws_account_id}:function:${var.service_name}-${local.ID_ENV}"
}
