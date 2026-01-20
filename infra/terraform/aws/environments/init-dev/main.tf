locals {
  ENV             = "dev"
  PROJECT_CONF    = yamldecode(file("../../../../../project.yaml"))
  INFRA_ENV_VAR   = local.PROJECT_CONF.infra.terraform.aws.modules.environment.env_var.set
  ENV_ID          = module.env_id.ENV_ID
  STORAGE_ENV_VAR = local.PROJECT_CONF.infra.terraform.aws.modules.project-storage.env_var.set
}

module "env_id" {
  source = "../../../modules/env-id/v001"
}

provider "aws" {
  region = local.INFRA_ENV_VAR.REGION.default
  default_tags {
    tags = {
      env_id = local.ENV_ID
      env    = local.ENV
    }
  }
}

module "project_storage_dev" {
  source                           = "../../modules/project-storage/v001"
  force_destroy_storage            = false
  env                              = local.ENV
  env_id                           = local.ENV_ID
  artifacts_bucket_name_prefix     = local.STORAGE_ENV_VAR.ARTIFACTS_BUCKET_PREFIX.default
  tfstate_bucket_name_prefix       = local.STORAGE_ENV_VAR.TFSTATE_BUCKET_PREFIX.default
  max_image_storage_count          = 10
  codebuild_compute_type           = "BUILD_GENERAL1_MEDIUM" # SMALL, MEDIUM, LARGE, 2XLARGE
}
