terraform {
  required_version = "~> 0.15.0"

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "systemaccounting"

    workspaces {
      name = "aws-dev" // !!! change value when duplicating !!!
    }
  }
}

provider "aws" {
  region = "us-east-1"

  # use regions where only cloud9 available
  # https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/
}

provider "archive" {}

data "terraform_remote_state" "aws-us-east-1" {
  backend = "remote"

  config = {
    organization = "systemaccounting"

    workspaces = {
      name = "aws-us-east-1"
    }
  }
}

locals {
  APP     = "mxfactorial"
  ENV     = "dev"
  APP_ENV = "${local.APP}-${local.ENV}"
}

# IMPORTANT: first build lambda artifacts using `cd infrastructure/terraform && sh build.sh $ENV`
module "dev" {
  source = "../../modules/environment"

  ############### shared ###############
  env = local.ENV

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
  certificate_arn                = lookup(data.terraform_remote_state.aws-us-east-1.outputs.api_cert_map, local.ENV)

  // apigw v2
  enable_api_auto_deploy = true

  ############### client ###############
  client_origin_bucket_name = "${local.APP}-client-${local.ENV}"

  ############### cloudfront ###############
  ssl_arn = lookup(data.terraform_remote_state.aws-us-east-1.outputs.client_cert_map, local.ENV)
}

