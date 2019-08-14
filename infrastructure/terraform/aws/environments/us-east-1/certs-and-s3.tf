module "prod_certs_and_artifact_storage" {
  source      = "../../modules/us-east-1"
  environment = "prod"
}

module "dev_certs_and_artifact_storage" {
  source      = "../../modules/us-east-1"
  environment = "dev"
}
