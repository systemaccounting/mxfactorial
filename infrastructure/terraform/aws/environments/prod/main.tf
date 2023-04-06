terraform {
  backend "s3" {
    bucket = "mxfactorial-tfstate-0-prod"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

locals {
  APP              = "mxfactorial"
  ENV              = "prod"
  APP_ENV          = "${local.APP}-${local.ENV}"
  PROJECT_JSON     = jsondecode(file("../../../../../project.json"))
  ORIGIN_PREFIX    = local.PROJECT_JSON.client_origin_bucket_name_prefix
  ARTIFACTS_PREFIX = local.PROJECT_JSON.artifacts_bucket_name_prefix
  TFSTATE_PREFIX   = local.PROJECT_JSON.tfstate_bucket_name_prefix
  RDS_PREFIX       = local.PROJECT_JSON.terraform.aws.rds.instance_name_prefix
  REGION           = local.PROJECT_JSON.region
  ENV_ID           = local.PROJECT_JSON.terraform.prod.env_id
  ID_ENV           = "${local.ENV_ID}-${local.ENV}"
  CUSTOM_DOMAIN    = "mxfactorial.io"
  SSM_VERSION      = "v1"
}

provider "aws" {
  region = local.REGION
  default_tags {
    tags = {
      env_id = local.ENV_ID
      env    = local.ENV
    }
  }
}

module "acm_certs_prod" {
  source             = "../../modules/acm-certs/v001"
  env                = local.ENV
  custom_domain_name = local.CUSTOM_DOMAIN
}

module "prod" {
  source = "../../modules/environment/v001"

  ############### shared ###############

  env                   = local.ENV
  artifacts_bucket_name = "${local.ARTIFACTS_PREFIX}-${local.ID_ENV}"
  env_id                = local.ENV_ID
  build_db              = true
  build_cache           = true

  // OPTIONAL, comment or delete if unused:
  custom_domain_name = local.CUSTOM_DOMAIN

  ############### ssm ###############

  ssm_prefix = "${local.ENV_ID}/${local.SSM_VERSION}/${local.ENV}"

  ############### lambda ###############

  requests_by_account_return_limit     = 20
  transactions_by_account_return_limit = 20
  notifications_return_limit           = 20
  initial_account_balance              = 1000
  web_adapter_layer_version            = "15"

  ############### rds ###############

  rds_allow_major_version_upgrade = true
  rds_instance_class              = "db.t3.micro"
  rds_parameter_group             = "default.postgres13"
  rds_instance_name               = "${local.RDS_PREFIX}-${local.ID_ENV}"
  db_snapshot_id                  = null

  ############### api gateway ###############

  // change graphql_deployment_version when switching
  enable_api_auth = local.PROJECT_JSON.enable_api_auth

  // change value to deploy api
  graphql_deployment_version     = 1
  apigw_authorization_header_key = "Authorization"

  // OPTIONAL, comment or delete api_cert_arn if custom_domain_name unused:
  api_cert_arn = module.acm_certs_prod.api_cert // acm-certs module requires api subdomain = "${var.env}-api"

  // apigw v2
  enable_api_auto_deploy = true

  ############### notifications ###############

  enable_notifications = local.PROJECT_JSON.enable_notifications

  ############### client ###############

  client_origin_bucket_name = "${local.ORIGIN_PREFIX}-${local.ID_ENV}"

  ############### cloudfront ###############

  // OPTIONAL, comment or delete client_cert_arn if custom_domain_name unused:
  client_cert_arn = module.acm_certs_prod.client_cert // acm-certs module requires client subdomain = var.env
}
