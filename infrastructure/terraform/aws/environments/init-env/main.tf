terraform {
  required_version = "~> 0.15.0"

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "systemaccounting"

    workspaces {
      name = "aws-init-env" // !!! change value when duplicating !!!
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

// avoids 'Function calls not allowed' in variables.tf
locals {
  ORIGIN_PREFIX    = jsondecode(file("${path.module}/../../../../../project.json")).client_origin_bucket_name_prefix
  ARTIFACTS_PREFIX = jsondecode(file("${path.module}/../../../../../project.json")).artifacts_bucket_name_prefix
}