locals {
  ID_ENV                     = "${var.env_id}-${var.env}"
  ID_ENV_PREFIX              = "${var.env_id}/${var.env}"
  PROJECT_CONF_FILE_NAME     = "project.yaml"
  PROJECT_CONF               = yamldecode(file("../../../../../${local.PROJECT_CONF_FILE_NAME}"))
  STORAGE_ENV_VAR            = local.PROJECT_CONF.infra.terraform.aws.modules.project-storage.env_var.set
  SERVICES_ZIP               = local.PROJECT_CONF.scripts.env_var.set.SERVICES_ZIP.default
  INTEG_TEST_OBJECT_KEY_PATH = local.STORAGE_ENV_VAR.INTEG_TEST_OBJECT_KEY_PATH.default
  INTEG_SOURCE_LOCATION      = "${local.INTEG_TEST_OBJECT_KEY_PATH}/${local.SERVICES_ZIP}"
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

module "codebuild_projects" {
  for_each = var.service_names
  source   = "../../codebuild/v001"

  project_name         = "mxfactorial-${each.value}-${local.ID_ENV}"
  service_name         = each.value
  env                  = var.env
  env_id               = var.env_id
  aws_region           = data.aws_region.current.id
  aws_account_id       = data.aws_caller_identity.current.account_id
  compute_type         = var.compute_type
  buildspec            = file("${path.module}/../../ecr/v001/buildspecs/build.yaml")
  artifacts_bucket_arn = var.artifacts_bucket_arn
  ecr_repository_arn   = "arn:aws:ecr:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:repository/${local.ID_ENV_PREFIX}/${each.value}"
  lambda_function_arn  = "arn:aws:lambda:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:function:${each.value}-${local.ID_ENV}"
}

module "codepipeline" {
  source                  = "../../codepipeline/v001"
  env                     = var.env
  env_id                  = var.env_id
  artifacts_bucket_name   = var.artifacts_bucket_name
  artifacts_bucket_arn    = var.artifacts_bucket_arn
  codebuild_project_names = { for k, v in module.codebuild_projects : k => v.project_name }
}
