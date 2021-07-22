module "artifact_storage_dev" {
  source                           = "../../modules/artifact-storage"
  env                              = "dev"
  artifacts_bucket_name_prefix     = local.ARTIFACTS_PREFIX
  client_origin_bucket_name_prefix = local.ORIGIN_PREFIX
}

// omit if not using custom dns
module "acm_certs_dev" {
  source             = "../../modules/acm-certs"
  env                = "dev"
  custom_domain_name = "mxfactorial.io"
}