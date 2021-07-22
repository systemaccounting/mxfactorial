terraform {
  required_version = "~> 0.15.0"

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

data "terraform_remote_state" "aws_init_env" {
  backend = "remote"

  config = {
    organization = "systemaccounting"

    workspaces = {
      name = "aws-init-env"
    }
  }
}

locals {
  APP     = "mxfactorial"
  ENV     = "prod"
  APP_ENV = "${local.APP}-${local.ENV}"
  ORIGIN_PREFIX = jsondecode(file("${path.module}/../../../../../project.json")).client_origin_bucket_name_prefix
  ARTIFACTS_PREFIX = jsondecode(file("${path.module}/../../../../../project.json")).artifacts_bucket_name_prefix
  CUSTOM_DOMAIN = "mxfactorial.io"
}

module "prod" {
  source = "../../modules/environment"

  ############### shared ###############

  env = local.ENV
  artifacts_bucket_name = "${local.ARTIFACTS_PREFIX}-${local.ENV}"

  // OPTIONAL, comment or delete if unused:
  custom_domain_name = local.CUSTOM_DOMAIN

  ############### lambda ###############

  requests_by_account_return_limit     = 20
  transactions_by_account_return_limit = 20
  notifications_return_limit           = 20
  initial_account_balance              = 1000

  ############### rds ###############

  rds_db_version                  = "13.1"
  rds_allow_major_version_upgrade = true
  rds_instance_class              = "db.t3.micro"
  rds_parameter_group             = "default.postgres13"
  rds_instance_name               = local.APP_ENV
  db_snapshot_id                  = null

  ############### api gateway ###############

  // change graphql_deployment_version when switching
  enable_api_auth = false

  // change value to deploy api
  graphql_deployment_version     = 19
  apigw_authorization_header_key = "Authorization"

  // OPTIONAL, comment or delete api_cert_arn if custom_domain_name unused:
  api_cert_arn = lookup(data.terraform_remote_state.aws_init_env.outputs.api_cert_map, local.ENV) // acm-certs module requires api subdomain = "${var.env}-api"

  // apigw v2
  enable_api_auto_deploy = true

  ############### client ###############

  client_origin_bucket_name = "${local.ORIGIN_PREFIX}-${local.ENV}"

  ############### cloudfront ###############

  // OPTIONAL, comment or delete client_cert_arn if custom_domain_name unused:
  client_cert_arn = lookup(data.terraform_remote_state.aws_init_env.outputs.client_cert_map, local.ENV) // acm-certs module requires client subdomain = var.env
}

