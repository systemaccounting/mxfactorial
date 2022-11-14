terraform {
  required_version = "~> 1.2.7"

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "systemaccounting"

    workspaces {
      name = "aws-prod"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "terraform_remote_state" "aws_init_prod" {
  backend = "remote"

  config = {
    organization = "systemaccounting"

    workspaces = {
      name = "aws-init-prod"
    }
  }
}

locals {
  APP              = "mxfactorial"
  ENV              = "prod"
  APP_ENV          = "${local.APP}-${local.ENV}"
  PROJECT_JSON     = jsondecode(file("../../../../../project.json"))
  ORIGIN_PREFIX    = local.PROJECT_JSON.client_origin_bucket_name_prefix
  ARTIFACTS_PREFIX = local.PROJECT_JSON.artifacts_bucket_name_prefix
  RDS_SUFFIX       = local.PROJECT_JSON.terraform.aws.rds.instance_name_suffix
  CUSTOM_DOMAIN    = "mxfactorial.io"
}

module "prod" {
  source = "../../modules/environment/v001"

  ############### shared ###############

  env                   = local.ENV
  artifacts_bucket_name = "${local.ARTIFACTS_PREFIX}-${local.ENV}"

  // OPTIONAL, comment or delete if unused:
  custom_domain_name = local.CUSTOM_DOMAIN

  ############### ssm ###############

  ssm_version = local.PROJECT_JSON.ssm_version

  ############### lambda ###############

  requests_by_account_return_limit     = 20
  transactions_by_account_return_limit = 20
  notifications_return_limit           = 20
  initial_account_balance              = 1000

  ############### rds ###############

  rds_allow_major_version_upgrade = true
  rds_instance_class              = "db.t3.micro"
  rds_parameter_group             = "default.postgres13"
  rds_instance_name               = "${local.ENV}-${local.RDS_SUFFIX}"
  db_snapshot_id                  = null

  ############### api gateway ###############

  // change graphql_deployment_version when switching
  enable_api_auth = local.PROJECT_JSON.enable_api_auth

  // change value to deploy api
  graphql_deployment_version     = 1
  apigw_authorization_header_key = "Authorization"

  // OPTIONAL, comment or delete api_cert_arn if custom_domain_name unused:
  api_cert_arn = data.terraform_remote_state.aws_init_prod.outputs.api_cert_prod // acm-certs module requires api subdomain = "${var.env}-api"

  // apigw v2
  enable_api_auto_deploy = true

  ############### notifications ###############

  enable_notifications = local.PROJECT_JSON.enable_notifications

  ############### client ###############

  client_origin_bucket_name = "${local.ORIGIN_PREFIX}-${local.ENV}"

  ############### cloudfront ###############

  // OPTIONAL, comment or delete client_cert_arn if custom_domain_name unused:
  client_cert_arn = data.terraform_remote_state.aws_init_prod.outputs.client_cert_prod // acm-certs module requires client subdomain = var.env
}

