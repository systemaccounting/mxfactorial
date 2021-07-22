module "artifact_storage_prod" {
  source                           = "../../modules/artifact-storage"
  env                              = "prod"
  artifacts_bucket_name_prefix     = local.ARTIFACTS_PREFIX
  client_origin_bucket_name_prefix = local.ORIGIN_PREFIX
}

// omit if not using custom dns
module "acm_certs_prod" {
  source             = "../../modules/acm-certs"
  env                = "prod"
  custom_domain_name = "mxfactorial.io"
}