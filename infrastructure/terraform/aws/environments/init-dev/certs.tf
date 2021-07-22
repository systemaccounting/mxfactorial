// omit if not using custom dns
module "acm_certs_dev" {
  source             = "../../modules/acm-certs/v001"
  env                = "dev"
  custom_domain_name = "mxfactorial.io"
}
