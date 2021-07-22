// omit if not using custom dns
module "acm_certs_prod" {
  source             = "../../modules/acm-certs/v001"
  env                = "prod"
  custom_domain_name = "mxfactorial.io"
}
