//instructions on README.md

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

provider "aws" {
  region = "us-east-1"
}
