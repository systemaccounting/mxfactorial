module "prod_certs_and_artifact_storage" {
  source = "../../modules/us-east-1/v01"
  env    = "prod"
}

module "dev_certs_and_artifact_storage" {
  source = "../../modules/us-east-1/v02"
  env    = "dev"
}
