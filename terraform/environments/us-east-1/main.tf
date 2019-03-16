terraform {
  required_version = ">= 0.11.8"

  backend "s3" {
    encrypt        = true
    bucket         = "us-east-1-mxfactorial-tf-state"
    dynamodb_table = "us-east-1-mxfactorial-tf-state"
    region         = "us-east-1"
    key            = "us-east-1-mxfactorial.tfstate"
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnet_ids" "default" {
  vpc_id = "${data.aws_vpc.default.id}"
}

data "aws_region" "current" {}
