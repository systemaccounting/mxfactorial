locals {
  ENV          = "dev"
  PROJECT_JSON = jsondecode(file("../../../../../project.json"))
  ENV_ID       = jsondecode(file("../../../env-id/terraform.tfstate")).outputs.env_id.value
}

provider "aws" {
  region = local.PROJECT_JSON.region
  default_tags {
    tags = {
      env_id = local.ENV_ID
      env    = local.ENV
    }
  }
}

// creates 3 buckets and 1 dynamodb table
module "project_storage_dev" {
  source                           = "../../modules/project-storage/v001"
  force_destroy_tfstate            = true
  env                              = local.ENV
  env_id                           = local.ENV_ID
  artifacts_bucket_name_prefix     = local.PROJECT_JSON.artifacts_bucket_name_prefix
  client_origin_bucket_name_prefix = local.PROJECT_JSON.client_origin_bucket_name_prefix
  tfstate_bucket_name_prefix       = local.PROJECT_JSON.tfstate_bucket_name_prefix
  ddb_table_name_prefix            = local.PROJECT_JSON.github_workflows.dynamodb_table.name_prefix
  ddb_table_hash_key               = local.PROJECT_JSON.github_workflows.dynamodb_table.hash_key
}
