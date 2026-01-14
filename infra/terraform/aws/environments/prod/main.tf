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
  PROJECT_CONF     = yamldecode(file("../../../../../project.yaml"))
  STORAGE_ENV_VAR  = local.PROJECT_CONF.infra.terraform.aws.modules.project-storage.env_var.set
  ARTIFACTS_PREFIX = local.STORAGE_ENV_VAR.ARTIFACTS_BUCKET_PREFIX.default
  TFSTATE_PREFIX   = local.STORAGE_ENV_VAR.TFSTATE_BUCKET_PREFIX.default
  INFRA_ENV_VAR    = local.PROJECT_CONF.infra.terraform.aws.modules.environment.env_var.set
  RDS_PREFIX       = local.INFRA_ENV_VAR.RDS_PREFIX.default
  REGION           = local.INFRA_ENV_VAR.REGION.default
  ENV_ID           = local.PROJECT_CONF.env_var.set.PROD_ENV_ID.default
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

  initial_account_balance = 1000

  ############### rds ###############

  rds_allow_major_version_upgrade = true
  rds_instance_class              = "db.t3.micro"
  rds_parameter_group             = "default.postgres13"
  rds_engine_version              = "13.20"
  rds_instance_name               = "${local.RDS_PREFIX}-${local.ID_ENV}"
  db_snapshot_id                  = null

  ############### api gateway ###############

  // change graphql_deployment_version when switching
  enable_api_auth = local.INFRA_ENV_VAR.ENABLE_API_AUTH.default

  // change value to deploy api
  graphql_deployment_version     = 1
  apigw_authorization_header_key = "Authorization"

  // OPTIONAL, comment or delete api_cert_arn if custom_domain_name unused:
  api_cert_arn = module.acm_certs_prod.api_cert // acm-certs module requires api subdomain = "${var.env}-api"

  // apigw v2
  enable_api_auto_deploy = true
  # terraform keeps applying changes to apigwv2_logging_level
  # even when it doesnt change so commenting out
  # apigwv2_logging_level = "OFF" // OFF, INFO, ERROR
  apigwv2_burst_limit   = 5000
  apigwv2_rate_limit    = 10000

  ############### k8s ###############

  microk8s_instance_type = "t2.medium"
  enable_microk8s        = false

  ############### cloudfront ###############

  // OPTIONAL, comment or delete client_cert_arn if custom_domain_name unused:
  client_cert_arn = module.acm_certs_prod.client_cert // acm-certs module requires client subdomain = var.env
}
