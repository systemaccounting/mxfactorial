terraform {
  required_version = ">= 0.11.8"

  backend "s3" {
    encrypt        = true
    bucket         = "global-mxfactorial-tf-state"
    dynamodb_table = "global-mxfactorial-tf-state"
    region         = "us-east-1"
    key            = "global-mxfactorial.tfstate"
  }
}

// us-east-1 required for Amazon Certificate Manager (acm)
provider "aws" {
  region = "us-east-1"
}

// ATTN: addition of cert requires addition to client_cert_map AND api_cert_map outputs

module "prod_certs" {
  source      = "../../modules/us-east-1-acm"
  environment = "prod"
}

module "dev_certs" {
  source      = "../../modules/us-east-1-acm"
  environment = "dev"
}

module "qa_certs" {
  source      = "../../modules/us-east-1-acm"
  environment = "qa"
}
