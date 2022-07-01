terraform {
  required_version = "~> 1.0.3"
}

provider "aws" {
  region = "us-east-1"
}

locals {
  APP              = "mxfactorial"
  ENV              = "dev"
  APP_ENV          = "${local.APP}-${local.ENV}"
  PROJECT_JSON     = "../../../../../project.json"
  ORIGIN_PREFIX    = jsondecode(file("${path.module}/${local.PROJECT_JSON}")).client_origin_bucket_name_prefix
  ARTIFACTS_PREFIX = jsondecode(file("${path.module}/${local.PROJECT_JSON}")).artifacts_bucket_name_prefix
}

// IMPORTANT: first build lambda artifacts using `make all CMD=initial-deploy ENV=$ENV` from project root
module "dev" {
  source = "../../modules/environment/v001"

  ############### shared ###############

  env                   = local.ENV
  artifacts_bucket_name = "${local.ARTIFACTS_PREFIX}-${local.ENV}"

  ############### lambda ###############

  requests_by_account_return_limit     = 20
  transactions_by_account_return_limit = 20
  notifications_return_limit           = 20
  initial_account_balance              = 1000

  ############### rds ###############

  rds_db_version                  = "13.4"
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

  // apigw v2
  enable_api_auto_deploy = true

  ############### client ###############

  client_origin_bucket_name = "${local.ORIGIN_PREFIX}-${local.ENV}"
}

