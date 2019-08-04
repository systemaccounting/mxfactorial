terraform {
  required_version = "~> 0.12.4"

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "systemaccounting"

    workspaces {
      name = "aws-dev"
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

# IMPORTANT: first build lambda artifacts using `cd services && sh build.sh`
module "dev" {
  source = "../../modules/environment"

  ############### Shared ###############
  environment = var.environment

  ############### Shared in Lambda and RDS ###############
  db_master_username = var.db_master_username
  db_master_password = var.db_master_password

  ############### API Gateway ###############
  certificate_arn = lookup(data.terraform_remote_state.aws-us-east-1.outputs.api_cert_map, var.environment)

  ############### Cloudfront ###############
  ssl_arn = lookup(data.terraform_remote_state.aws-us-east-1.outputs.client_cert_map, var.environment)
}

