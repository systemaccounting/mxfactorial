locals {
  ENV             = "dev"
  PROJECT_CONF    = yamldecode(file("../../../../../project.yaml"))
  INFRA_ENV_VAR   = local.PROJECT_CONF.infrastructure.terraform.aws.modules.environment.env_var.set
  ENV_ID          = jsondecode(file("../../../env-id/terraform.tfstate")).outputs.env_id.value
  STORAGE_ENV_VAR = local.PROJECT_CONF.infrastructure.terraform.aws.modules.project-storage.env_var.set
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
  force_destroy_storage            = true
  env                              = local.ENV
  env_id                           = local.ENV_ID
  artifacts_bucket_name_prefix     = local.STORAGE_ENV_VAR.ARTIFACTS_BUCKET_PREFIX.default
  client_origin_bucket_name_prefix = local.STORAGE_ENV_VAR.CLIENT_ORIGIN_BUCKET_PREFIX.default
  tfstate_bucket_name_prefix       = local.STORAGE_ENV_VAR.TFSTATE_BUCKET_PREFIX.default
  ddb_table_name_prefix            = local.STORAGE_ENV_VAR.DDB_TABLE_NAME_PREFIX.default
  ddb_table_hash_key               = local.STORAGE_ENV_VAR.DDB_TABLE_HASH_KEY.default
  max_image_storage_count          = 10
}
