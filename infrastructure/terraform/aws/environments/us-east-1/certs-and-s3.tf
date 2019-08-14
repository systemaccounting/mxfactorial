module "prod_certs" {
  source      = "../../modules/us-east-1-acm"
  environment = "prod"
}

module "dev_certs" {
  source      = "../../modules/us-east-1-acm"
  environment = "dev"
}
