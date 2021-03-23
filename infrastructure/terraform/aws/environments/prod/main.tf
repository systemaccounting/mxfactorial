terraform {
  required_version = "~> 0.14.8"

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

# IMPORTANT: first build lambda artifacts using `cd infrastructure/terraform && sh build.sh $ENV`
module "prod" {
  source = "../../modules/environment"

  ############### shared ###############
  environment = var.environment

  ############### shared in lambda and rds ###############
  req_query_return_limit   = 20
  trans_query_return_limit = 20

  ############### shared in lambda and rds ###############
  db_snapshot_id = null

  ############### rds ###############
  rds_db_version                  = "11.10"
  rds_allow_major_version_upgrade = true
  rds_instance_class              = "db.t2.micro"
  rds_parameter_group             = "default.postgres11"

  ############### api gateway ###############
  certificate_arn = lookup(data.terraform_remote_state.aws-us-east-1.outputs.api_cert_map, var.environment)

  ############### cloudfront ###############
  ssl_arn = lookup(data.terraform_remote_state.aws-us-east-1.outputs.client_cert_map, var.environment)
}

