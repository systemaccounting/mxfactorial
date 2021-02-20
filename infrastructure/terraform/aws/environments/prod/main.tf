terraform {
  required_version = "~> 0.12.4"

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "systemaccounting"

    workspaces {
      name = "aws-prod"
    }
  }
}

provider "aws" {
  region  = "us-east-1"
  version = "~> 2.19.0"

  # use regions where only cloud9 available
  # https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/
}

provider "archive" {
  version = "~> 1.2.2"
}

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
  req_query_return_limit = 20

  ############### shared in lambda and rds ###############
  db_snapshot_id = null

  ############### api gateway ###############
  certificate_arn = lookup(data.terraform_remote_state.aws-us-east-1.outputs.api_cert_map, var.environment)

  ############### cloudfront ###############
  ssl_arn = lookup(data.terraform_remote_state.aws-us-east-1.outputs.client_cert_map, var.environment)
}

