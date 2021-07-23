locals {
  ORIGIN_PREFIX    = jsondecode(file("${path.module}/../../../../../project.json")).client_origin_bucket_name_prefix
  ARTIFACTS_PREFIX = jsondecode(file("${path.module}/../../../../../project.json")).artifacts_bucket_name_prefix
}

module "project_storage_dev" {
  source                           = "../../modules/project-storage/v001"
  env                              = "dev"
  artifacts_bucket_name_prefix     = local.ARTIFACTS_PREFIX
  client_origin_bucket_name_prefix = local.ORIGIN_PREFIX
}
