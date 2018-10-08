# environments created using `terraform workspace new`
# view "environments" interpolated from variables.tf

terraform {
  required_version = ">= 0.11.8"

  backend "s3" {
    encrypt        = true
    bucket         = "prod-mxfactorial-tf-state"
    dynamodb_table = "prod-mxfactorial-tf-state"
    region         = "us-east-1"
    key            = "prod-mxfactorial.tfstate"
  }
}

provider "aws" {
  region = "${lookup(var.region, "${terraform.workspace}")}"
}
